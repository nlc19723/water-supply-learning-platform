#!/usr/bin/env bash
# ============================================================================
# 供水学习平台 · 一键发布（强制戳版本号）
#
# ⚠️ 发布纪律：本项目每次对外发布【必须】递增版本号。
#    原因：index.html/图标等为不带哈希的固定文件名，被 Service Worker
#    以 Cache-First 缓存；版本号不变则老用户拿不到新内容。
#    本脚本把「递增 → 同步 5 处 → 校验 → 发布」固化为一步，不要绕过它
#    直接调 publish.js。
#
# 用法：
#   ./release.sh                 # patch +1（如 2.26.0 → 2.26.1）并发布
#   ./release.sh 2.27.0          # 指定版本号（主/次版本升级时用）并发布
#   ./release.sh --dry-run       # 只预览将做的改动，不写文件、不发布
#
# 健壮性（v2 修复 L2）：
#   - flock 并发锁：防止两次发布同时改文件 / 交叉覆盖
#   - trap 回滚：任何一步失败，自动恢复被改文件到发布前状态
#   - 精确锚点替换：只替换已知的版本号模式，不做裸字符串全局替换
# ============================================================================
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

PUBLISH_JS="/root/.codebuddy/skills/sites/scripts/publish.js"
DRY_RUN=0
SPEC=""

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    *) SPEC="$arg" ;;
  esac
done

# 并发锁：同一时刻只允许一个发布进程（dry-run 也加锁，避免读到半改状态）
LOCK="/tmp/water-learn-release.lock"
exec 9>"$LOCK"
if ! flock -n 9; then
  echo "❌ 另一个发布进程正在运行（锁文件 $LOCK），请稍后重试" >&2
  exit 1
fi

# 1) 读当前版本号
CUR=$(python3.11 -c "import json;print(json.load(open('version.json'))['v'])")

# 2) 计算目标版本：指定则用它，否则 patch+1
if [ -n "$SPEC" ]; then
  NEW="$SPEC"
else
  NEW=$(python3.11 -c "
a,b,c=[int(x) for x in '$CUR'.split('.')]
print(f'{a}.{b}.{c+1}')")
fi

# 3a) 计算图标资产指纹：favicon + 全部 icons 的内容哈希
#     图标内容不变 → 指纹不变 → ASSETS_CACHE 名不变 → 发版后图片零重下
#     图标变化（换 logo）→ 指纹变 → 新资产缓存名 → 图标/图片重新下载（正确行为）
ASSET_FP=$(cat favicon.png icons/*.png | sha256sum | cut -c1-8)

# 3) 严格校验 x.y.z 格式且必须大于当前版本
python3.11 - "$CUR" "$NEW" <<'PY'
import re, sys
cur, new = sys.argv[1], sys.argv[2]
assert re.fullmatch(r'\d+\.\d+\.\d+', new), f'版本号必须是 x.y.z 纯数字格式: {new}'
def cmp(a, b):
    x, y = a.split('.'), b.split('.')
    for i in range(3):
        d = int(x[i]) - int(y[i])
        if d: return 1 if d > 0 else -1
    return 0
assert cmp(new, cur) > 0, f'新版本必须大于当前版本: {new} <= {cur}'
PY

echo "版本：$CUR  →  $NEW"
echo "图标资产指纹：$ASSET_FP"

# 精确锚点定义：每个文件要替换的模式（含版本号），确保只动版本号位置
# anchor 中的 {V} 占位符在脚本里替换为 CUR
anchor_index_1='name="app-version" content="{V}"'   # meta
anchor_index_2='版本 v{V}'                            # 侧栏底栏
anchor_index_3='id="verChip">v{V}'                    # 角标
anchor_version='"v":"{V}"'                           # version.json
anchor_sw='water-learn-v{V}'                         # sw.js APP_CACHE 名
anchor_assets='water-learn-assets-XXXXXXXX'          # sw.js ASSETS_CACHE 指纹占位

if [ "$DRY_RUN" -eq 1 ]; then
  echo "[dry-run] 将替换以下 5 处版本锚点 + 1 处资产指纹："
  grep -n -E "app-version|版本 v|verChip|water-learn-v|\"v\"" index.html version.json sw.js | grep "$CUR" || true
  grep -n "water-learn-assets" sw.js || true
  echo "[dry-run] 资产缓存指纹占位 → water-learn-assets-$ASSET_FP"
  echo "[dry-run] 不写文件、不发布。"
  exit 0
fi

# 4) 备份待改文件 + trap 回滚（任何失败恢复原状）
BAK=$(mktemp -d)
cp index.html version.json sw.js "$BAK/"
ROLLBACK=1
rollback(){
  if [ "${ROLLBACK:-0}" -eq 1 ]; then
    echo "↩️  发布失败，回滚文件到 $CUR" >&2
    cp "$BAK/index.html" "$BAK/version.json" "$BAK/sw.js" "$DIR/" 2>/dev/null || true
  fi
  rm -rf "$BAK"
}
trap rollback EXIT

# 5) 精确锚点替换：任一锚点未命中即中止（触发回滚）
python3.11 - "$CUR" "$NEW" "$DIR" "$ASSET_FP" <<'PY'
import sys, os, re
cur, new, d, fp = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
# (文件, 旧锚点, 新锚点) —— 锚点含完整上下文，避免裸版本号误替换
jobs = [
  ("index.html", f'name="app-version" content="{cur}"', f'name="app-version" content="{new}"'),
  ("index.html", f'版本 v{cur}', f'版本 v{new}'),
  ("index.html", f'id="verChip">v{cur}', f'id="verChip">v{new}'),
  ("version.json", f'"v":"{cur}"', f'"v":"{new}"'),
  ("sw.js", f'water-learn-v{cur}', f'water-learn-v{new}'),
]
for fn, old, new_s in jobs:
    p = os.path.join(d, fn)
    s = open(p, encoding='utf-8').read()
    n = s.count(old)
    assert n == 1, f'{fn} 中锚点 {old!r} 命中 {n} 次（应为 1），已中止以防漏改/误改'
    open(p, 'w', encoding='utf-8').write(s.replace(old, new_s, 1))
    print(f'  ✓ {fn}: {old} -> {new_s}')

# 资产缓存指纹：把 sw.js 里 water-learn-assets-xxxxxxxx（或占位符）替换为当前指纹
# 用正则匹配，兼容首次发布的 XXXXXXXX 占位与后续已写入的 8 位 hex
p = os.path.join(d, "sw.js")
s = open(p, encoding='utf-8').read()
new_line = f"const ASSETS_CACHE = 'water-learn-assets-{fp}';"
s2, n = re.subn(r"const ASSETS_CACHE = 'water-learn-assets-[0-9A-Fa-fX]{8}';", new_line, s)
assert n == 1, f'sw.js 中资产缓存锚点命中 {n} 次（应为 1），已中止'
open(p, 'w', encoding='utf-8').write(s2)
print(f'  ✓ sw.js: 资产缓存指纹 -> water-learn-assets-{fp}')
PY

# 6) 校验无残留旧版本号（-F 固定字符串匹配：'.' 不能当通配符，否则会误命中日期 2026-11-19）
if grep -rnF "$CUR" index.html version.json sw.js; then
  echo "❌ 仍有旧版本号 $CUR 残留，已中止发布（将回滚）" >&2
  exit 1
fi
echo "✅ 5 处版本号已同步为 $NEW"

# 7) 发布
echo "🚀 发布中..."
node "$PUBLISH_JS" --dir "$DIR" --language static

# 发布成功，取消回滚
ROLLBACK=0
echo ""
echo "✅ 已发布，版本 $NEW"

# trap 会在 EXIT 时清理 BAK（此时 ROLLBACK=0 不回滚）
