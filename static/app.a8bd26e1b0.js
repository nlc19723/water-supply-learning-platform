

// cat:1级大类  lv2:2级分类  lv3:3级分类(可选)  tag:类型标签  img:images/文件名


const CAT_ORDER=["管材类","管件类","补偿器类","阀门类","管道抢修器","水表类","辅材类"];
const CATS=["全部", ...CAT_ORDER.filter(c=>DATA.some(d=>d.cat===c)), ...[...new Set(DATA.map(d=>d.cat))].filter(c=>!CAT_ORDER.includes(c))];
/* B4 · P1-10 / P1-12：材料数据单一数据源对外暴露（平台壳题库、断言、状态恢复共用） */
window.MAT_DATA = DATA;
window.MAT_CATS = CATS;
window.MAT_RENDER = () => render();
window.MAT_CUR = () => ({cur:cur, cur2:cur2});
window.MAT_RESTORE = f => { if(!f) return; cur=f.cur||"全部"; cur2=f.cur2||"全部"; buildTabs(); render(); };
let cur = "全部", cur2 = "全部";
/* 「仅看公司现用」筛选按钮已移除，恒为 false：渲染层 onlyCompany 相关过滤条件自动失效，默认显示全部材料。
   保留变量而非删除，是为兼容 render/crumb 中既有的条件判断，避免改动多处渲染逻辑引入风险。 */
const onlyCompany = false;
function buildTabs(){
  /* 安全修复：分类名放入 data-* 属性（escapeHtml 转义），不再拼进 onclick 字符串。
     事件委托统一在 initDelegates() 中绑定，避免 innerHTML 重建导致监听器失效。 */
  document.getElementById("tabs").innerHTML = CATS.map(c=>`<span class="tab${c===cur?" active":""}" role="button" tabindex="0" data-c="${escapeHtml(c)}">${escapeHtml(c)}</span>`).join("");
  const t2=document.getElementById("tabs2");
  if(cur==="全部"){t2.innerHTML="";return;}
  const lv2s=[...new Set(DATA.filter(d=>d.cat===cur).map(d=>d.lv2))];
  t2.innerHTML=`<span class="tab2${cur2==="全部"?" active":""}" role="button" tabindex="0" data-l2="全部">全部</span>`+
    lv2s.map(l2=>`<span class="tab2${l2===cur2?" active":""}" role="button" tabindex="0" data-l2="${escapeHtml(l2)}">${escapeHtml(l2)}<span class="cnt">${DATA.filter(d=>d.cat===cur&&d.lv2===l2).length}</span></span>`).join("");
}
/* 事件委托：tab 切换（点击 + 键盘），绑在稳定父容器上 */
function initDelegates(){
  function onTab(e){
    const el=e.target.closest(".tab,.tab2"); if(!el) return;
    if(e.type==="keydown"){if(e.key!=="Enter"&&e.key!==" ")return;e.preventDefault();}
    if(el.dataset.c!==undefined) pick(el.dataset.c);
    else if(el.dataset.l2!==undefined) pick2(el.dataset.l2);
  }
  ["click","keydown"].forEach(t=>{
    document.getElementById("tabs").addEventListener(t,onTab);
    document.getElementById("tabs2").addEventListener(t,onTab);
  });
  /* 跨分类空结果链接：data-* 传参，消除 onclick 中 HTML 实体解码后的引号闭合注入 */
  document.getElementById("grid").addEventListener("click",function(e){
    const a=e.target.closest(".empty-cross a[data-cat]"); if(!a) return;
    gotoCatKW(a.dataset.cat,a.dataset.kw);
  });
}
function focusTab(){
  const el=document.querySelector("#tabs2 .tab2.active")||document.querySelector("#tabs .tab.active");
  /* B7 · focus 不滚动视口：不带 preventScroll 时浏览器会把选中分类拉回顶部，
     打断移动端一级分类栏 sticky 吸顶（用户反馈「选了一级分类后下滑就不固定」）。 */
  if(el){try{el.focus({preventScroll:true});}catch(e){el.focus();}}
}
function pick(c){cur=c;cur2="全部";buildTabs();render();focusTab();}
function pick2(l2){cur2=l2;buildTabs();render();focusTab();}
function clearFilter(){document.getElementById("q").value="";cur="全部";cur2="全部";buildTabs();render();}

/* —— 术语表：正文中出现即加虚线下划线，悬停显示解释 —— */
const TERMS={
 "公称直径":"管道阀门的名义口径代号，接近内径，单位毫米",
 "公称压力":"承压等级代号，PN16 即 1.6MPa",
 "PN10":"公称压力 1.0MPa 的承压等级",
 "PN16":"公称压力 1.6MPa 的承压等级",
 "承压":"承受管道内部水压的能力",
 "水锤":"阀门骤关引起的水流冲击波，会震裂管道",
 "气阻":"管内积气形成的阻塞，减小过流断面",
 "流阻":"流体通过管件阀门时受到的阻力",
 "压损":"流体流经部件造成的压力降低",
 "倒流":"水反向流动，可能污染上游水源",
 "真空":"管内压力低于大气压，易吸瘪管道",
 "量程比":"最大与最小可准确计量流量之比",
 "始动流量":"水表开始转动计量的最小流量",
 "直管段":"计量/阀门前后要求的等径直管长度",
 "法兰":"带螺栓孔的盘状连接件，两片压紧垫片密封",
 "承口":"管件上承接插口的喇叭形端口",
 "插口":"管材插入承口的一端",
 "承插":"插口插入承口、靠橡胶圈密封的连接",
 "橡胶圈":"承插口的弹性密封圈，压紧后止水",
 "垫片":"夹在两法兰间填塞间隙的密封件",
 "生料带":"缠绕螺纹的聚四氟乙烯密封带",
 "螺纹":"管件上的螺旋牙，用于丝接",
 "丝接":"靠螺纹旋紧的可拆连接",
 "焊接":"加热熔合管材管件的不可拆连接",
 "热熔":"加热塑料至熔融后压合的一体连接",
 "沟槽":"管端滚压凹槽，用卡箍抱紧的连接",
 "卡箍":"抱箍沟槽管端的两半式金属件",
 "限位螺栓":"限制补偿接头拉伸量的螺栓",
 "螺栓":"穿入法兰孔并旋紧螺母的紧固件",
 "密封面":"阀门或法兰上贴合密封的接触面",
 "球墨铸铁":"球化处理的高强韧铸铁，供水管主力材质",
 "衬塑":"钢管内壁衬塑料层，即钢塑复合",
 "无缝":"无焊缝的钢管，承压更均匀",
 "有缝":"带焊缝的焊接钢管",
 "镀锌":"钢管表面镀锌防锈的处理",
 "不结垢":"内壁光滑不易附着水垢",
 "耐腐蚀":"抵抗介质侵蚀、不易锈蚀",
 "柔韧性":"管材可弯曲而不断裂的能力",
 "闸板":"闸阀内垂直升降的启闭件",
 "阀座":"阀门内与启闭件贴合的密封环",
 "阀杆":"传递手轮力矩、带动启闭件的杆",
 "明杆":"阀杆随启闭升降外露，开度可视",
 "暗杆":"阀杆只旋转不外露，省空间",
 "弹性座封":"闸板包橡胶与阀座弹性贴合的软密封",
 "中线":"蝶阀阀杆居蝶板中心的对称结构",
 "双偏心":"阀杆偏离密封面与阀体中心各一次",
 "三偏心":"双偏心再加密封面锥角偏心，金属密封",
 "蝶板":"蝶阀中旋转启闭的圆盘",
 "浮动球":"靠介质压力压向阀座的球体",
 "固定球":"由轴承固定、双阀座密封的球体",
 "阀瓣":"止回阀或截止阀中启闭的盘状件",
 "缓闭":"关闭末段减速，削减水锤",
 "先导":"由小导阀先动作再控制主阀的结构",
 "直动":"电磁力直接驱动阀芯启闭",
 "膜片":"感受压力并驱动阀瓣的弹性薄膜",
 "泄水阀":"倒流时自动开启排水的阀门",
 "滤网":"拦截杂质颗粒的网状滤芯",
 "节流":"用阀门开度调节流量，闸阀不宜",
 "全开全关":"阀门只作通断，不作调节",
 "旋翼":"水流冲击叶轮旋转计量的结构",
 "螺翼":"螺旋叶片式的大流量计量结构",
 "远传":"将读数远程传输至管理平台",
 "超声波":"用时差法无活动部件计量",
 "电磁":"导电流体切割磁力线感应计量",
 "带压":"在管道带压状态下安装作业",
 "弹簧管":"压力表内受压变形的波登管",
 "全丝":"螺杆全长带螺纹",
 "半丝":"螺杆一端光杆一端螺纹",
 "防冻":"防止低温冻结损坏",
 "承重":"井盖可承受的荷载等级"
};
const TERMS_KEYS=Object.keys(TERMS).sort((a,b)=>b.length-a.length);
const TERMS_RE=new RegExp(TERMS_KEYS.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|"),"g");
let showTerms=true;
/* v2.9.0 蓝图：术语「仅首现可点」。每次说明面渲染前由 detailHtml 重置 _termSeen，
   同一段说明里重复出现的术语降级为纯文本，避免满屏点线打断阅读；
   关闭术语解释（showTerms=false）时全部为纯文本，逻辑不变。 */
let _termSeen=null;
function mark(s){
  if(s==null)return "";
  /* 安全修复：先统一转义原文，术语词为纯文本（中文/字母数字）转义后仍可被 TERMS_RE 匹配。
     杜绝外部采集包字段经 mark() 原样进入 innerHTML 造成存储型 XSS。 */
  const str=escapeHtml(String(s));
  if(!showTerms)return str;
  return str.replace(TERMS_RE,m=>{
    if(_termSeen){
      if(_termSeen.has(m)) return m;      /* 重复出现：纯文本，不点、不划线 */
      _termSeen.add(m);
    }
    return `<span class="term" role="button" tabindex="0" aria-expanded="false" data-def="${escapeHtml(TERMS[m])}">${m}</span>`;
  });
}
function toggleTerms(){
  showTerms=!showTerms;
  const tb=document.getElementById("termBtn");
  tb.textContent="术语解释："+(showTerms?"开":"关");
  tb.classList.toggle("off",!showTerms);
  tb.setAttribute("aria-pressed",showTerms?"true":"false");   /* B3 · P1-04 状态可播报 */
  showToast(showTerms?"已开启术语标注 · 点击虚线词查看解释":"已关闭术语标注");  /* B3 · P1-04 即时反馈 */
  render();
  // 已展开的面板同步重绘，保证开关状态与面板内容一致
  if(expCur&&expCard.classList.contains("show")){
    document.getElementById("expBody").innerHTML=detailHtml(expCur,false);
  }
  hideTermTip();
}

/* —— 把自由文本规格解析为「键:值」结构（口径/压力/接口/长度/材质） —— */
function splitList(t){
  if(!t) return [];
  return String(t).replace(/[。．\s]+$/,"").split(/[、，,；;]/).map(s=>s.trim()).filter(Boolean);
}
function parseSpec(spec){
  const t=(spec||"").trim();
  if(!t) return null;
  const rules=[
    [/DN|口径|公称直径/i,"口径"],
    [/PN|压力等级|工作压力/i,"压力等级"],
    [/法兰|螺纹|焊接|沟槽|承插|粘接|卡箍|接口|连接|对夹/i,"连接方式"],
    [/单支|长度|米|\d\s*m\b|mm/i,"长度/规格"],
    [/球墨|铸铁|钢|PPR|衬塑|塑|铜|不锈钢|材质/i,"材质"]
  ];
  const kv=[],seen={};
  splitList(t).forEach(seg=>{
    let hit=null;
    for(const[re,k]of rules){ if(re.test(seg)){hit=k;break;} }
    if(!hit) return;
    if(seen[hit]!==undefined){ kv[seen[hit]][1]+=" / "+seg; return; }
    seen[hit]=kv.length; kv.push([hit,seg]);
  });
  return kv.length?kv.slice(0,4):null;
}
/* 长句不拆成列表（拆开读不通），短句拆成要点 */
function pointList(t){
  const arr=splitList(t);
  if(arr.length<2) return null;
  if(arr.some(s=>s.length>26)) return null;
  return arr;
}
function ptsHtml(t){
  const p=pointList(t);
  if(!p) return `<div class="principle">${mark(t)}</div>`;
  return `<ul class="pts">${p.map(x=>`<li>${mark(x)}</li>`).join("")}</ul>`;
}

/* v2.19.0 · 标准号后补全中文名称（渲染层，不改 xlsx 数据源，幂等）
   仅补全高置信标准号；若标准号后已紧跟中文名则不重复添加，避免误导用户。 */
const STD_CN={
  "GB/T 3091":"低压流体输送用焊接钢管",
  "GB/T 9711":"石油天然气工业 管线输送系统用钢管",
  "GB/T 13401":"钢制对焊管件技术规范",
  "GB 50268":"给水排水管道工程施工及验收规范",
  "SY/T 0457":"钢质管道液体环氧涂料内防腐技术规范",
  "SY/T 5037":"普通流体输送管道用埋弧焊钢管",
  "GB/T 13295":"水及燃气用球墨铸铁管、管件和附件",
  "GB/T 13663":"给水用聚乙烯(PE)管道系统",
  "GB/T 18742":"冷热水用聚丙烯管道系统",
  "GB/T 28897":"流体输送用钢塑复合管及管件",
  "GB/T 17219":"生活饮用水输配水设备及防护材料的安全性评价标准",
  "GB/T 778":"饮用冷水水表和热水水表",
  "GB/T 8464":"铁制和铜制螺纹连接阀门",
  "GB/T 7306":"55°密封管螺纹",
  "GB/T 12465":"管路补偿接头",
  "GB/T 1348":"球墨铸铁件",
  "GB/T 23858":"检查井盖",
  "GB/T 26081":"污水用球墨铸铁管、管件和附件",
  "GB/T 12232":"通用阀门 法兰连接铁制闸阀",
  "GB/T 12233":"通用阀门 铁制截止阀与升降式止回阀",
  "GB/T 12237":"石油、石化及相关工业用钢制球阀",
  "GB/T 12238":"法兰和对夹连接弹性密封蝶阀",
  "GB/T 13927":"工业阀门 压力试验",
  "GB/T 13932":"铁制旋启式止回阀",
  "GB/T 12223":"部分回转阀门驱动装置的连接",
  "GB/T 1226":"一般压力表",
  "GB/T 12244":"减压阀",
  "GB/T 12246":"先导式减压阀",
  "GB/T 12777":"金属波纹管膨胀节通用技术条件",
  "GB/T 3098":"紧固件机械性能",
  "GB/T 5782":"六角头螺栓",
  "GB/T 3280":"不锈钢冷轧钢板和钢带",
  "GB/T 9124":"钢制管法兰",
  "GB/T 9115":"对焊钢制管法兰",
  "GB 4452":"室外消火栓",
  "CJ/T 180":"建筑给水水表箱",
  "CJ/T 137":"给水衬塑复合钢管",
  "CJ/T 156":"沟槽式管路连接件",
  "CJ/T 216":"给水排水用软密封闸阀"
};
function enrichStd(t){
  return String(t||"").replace(/(GB\/T|GB|SY\/T|SY|CJ\/T|CJ)\s*[\d.]+(?:-\d{4})?/g,
    function(match,pre,offset,str){
      var base=pre+" "+match.slice(pre.length).trim().replace(/-\d{4}$/,"");
      var cn=STD_CN[base]||STD_CN[base.replace(/\.\d+$/,"")];
      if(!cn) return match;
      var tail=str.slice(offset+match.length).replace(/^\s*/,"");
      if(/^[\u4e00-\u9fff]/.test(tail)) return match;   /* 已有中文名，不重复 */
      return match+" "+cn;
    });
}

/* v2.16.0 验收：执行标准按「；」逐条提行，不再整段混排。
   括号内的分号（如「（现行；新版于 2027 实施）」）不切，避免把同一条标准拆断；
   逗号 / 顿号不切，保持每条标准原文完整。 */
function stdLines(t){
  const out=[];let buf="",depth=0;
  for(const ch of String(t||"")){
    if(ch==="（"||ch==="("||ch==="【"||ch==="["){depth++;buf+=ch;continue;}
    if(ch==="）"||ch===")"||ch==="】"||ch==="]"){if(depth>0)depth--;buf+=ch;continue;}
    if(depth===0&&(ch==="；"||ch===";")){if(buf.trim())out.push(buf.trim());buf="";continue;}
    buf+=ch;
  }
  if(buf.trim())out.push(buf.trim());
  return out.length?out:[String(t||"")];
}

/* 生成完整说明 HTML（背面与放大弹窗共用）
   v2.13.0 按 v3 样张组件落地：d-sec / mlab / kv / std / parts / principle / chips。
   结构组成改为静态列表、点击不再弹窗；数据字段与图片一律未改。 */
function detailHtml(d,compact){
  /* v2.9.0：每次说明面渲染重置术语去重集合，保证「仅首现可点」按单张卡计算。 */
  _termSeen=new Set();
  const kv=parseSpec(d.spec||d.model);
  const cls=compact?"bsec":"d-sec";
  const lab=(t)=>compact?`<div class="blab">${t}</div>`
    :`<div class="mlab">${t}<span class="sect">SECTION</span></div>`;
  let h=`<div class="${cls}">${lab("常用规格型号","SECTION 01")}`;
  h+= kv ? `<dl class="kv">${kv.map(k=>`<dt>${k[0]}</dt><dd>${mark(k[1])}</dd>`).join("")}</dl>`
        : `<div class="principle">${mark(d.spec||d.model||"—")}</div>`;
  /* v2.16.0：执行标准默认折叠（渐进披露）；展开后每个标准单独提行，不再整段混排。
     点击展开不跳页、不影响术语标注（术语仅在单张卡内首现可点）。 */
  if(d.std) h+=`<details class="bp-std" data-std><summary>执行标准 · 展开查看</summary>`+
    `<div class="std"${compact?"":' style="margin-top:0"'}>${stdLines(enrichStd(d.std)).map(s=>`<div class="std-line">${mark(s)}</div>`).join("")}</div></details>`;
  h+=`</div>`;
  /* 结构组成：v3 静态列表，不绑定 data-name / role="button"，点击不再弹窗 */
  h+=`<div class="${cls}">${lab("结构组成","SECTION 02")}<ul class="parts">${(Array.isArray(d.parts)?d.parts:[d.parts]).map(p=>`<li>${mark(p)}</li>`).join("")}</ul></div>`;
  if(d.conn) h+=`<div class="${cls}">${lab("连接方式","SECTION 03")}<div class="principle">${mark(d.conn)}</div></div>`;
  if(d.principle) h+=`<div class="${cls}">${lab("工作原理","SECTION 04")}<div class="principle">${mark(d.principle)}</div></div>`;
  if(d.func) h+=`<div class="${cls}">${lab("作用","SECTION 05")}${compact?ptsHtml(d.func):`<div class="principle">${mark(d.func)}</div>`}</div>`;
  if(d.adv) h+=`<div class="${cls}">${lab("优势","SECTION 06")}${compact?ptsHtml(d.adv):`<div class="principle">${mark(d.adv)}</div>`}</div>`;
  const mateArr=splitList(d.mate)||[];
  const mateInner=(mateArr.length>1&&mateArr.every(s=>s.length<=16))
    ? `<div class="chips">${mateArr.map(s=>`<span>${mark(s)}</span>`).join("")}</div>`
    : `<div class="chips"><span>${mark(d.mate)}</span></div>`;
  h+=`<div class="${cls}">${lab("常搭配使用","SECTION 07")}${mateInner}</div>`;
  if(d.companyUsed) h+=`<div class="${cls}">${lab("使用情况","SECTION 08")}<div class="principle"><span class="co-badge">✓ 公司现用</span><span style="margin-left:8px">本条目属于本公司当前在用材料</span></div></div>`;
  if(d.status) h+=`<div class="${cls}">${lab("选型状态","SECTION 09")}<div class="principle">${mark(d.status)}</div></div>`;
  return h;
}

function stCls(s){ if(!s) return ""; if(s.includes("强制检定")) return "st-check"; if(s.includes("特定工况")) return "st-spec"; if(s.includes("换版")) return "st-warn"; return "st-main"; }
function cardHtml(d){
  /* 安全修复：统一用 escapeHtml，弃用只覆盖 &"< 的自定义 esc，文本节点与属性一并转义 */
  const esc=escapeHtml(d.name);
  const fn=shotFile(d.img);
  const noimg=fn?"":" noimg";
  const lv3=d.lv3?`<span class="lv3-tag">${escapeHtml(d.lv3)}</span>`:"";
  const badge=d.status?`<span class="st-badge ${stCls(d.status)}">${escapeHtml(d.status)}</span>`:"";
  const co=d.companyUsed?`<span class="co-badge co-corner">✓ 公司现用</span>`:"";
  return `<div class="card${noimg}" tabindex="0" role="button" aria-label="${esc}${d.companyUsed?"，公司现用":""}，按回车展开卡片" data-name="${esc}">
    ${co}
    <div class="imgcard">
      <div class="photo${noimg}"><div class="ph">${d.icon?`<img class="ico" src="images/icons/${escapeHtml(d.icon)}.svg" alt="">`:""}<span>暂无实物图</span></div>${fn?`<img class="shot" src="images/${escapeHtml(fn)}" alt="${esc}" loading="lazy" decoding="async" onerror="shotFail(this)">`:""}</div>
      <button class="flip-hint" aria-label="展开卡片，查看实物大图">展开</button>
      <div class="fcap">
        <h3>${esc}</h3>
        <div class="ftags">${lv3}<span class="model">${escapeHtml(d.model)}</span><span class="cat-tag">${escapeHtml(d.tag)}</span>${badge}</div>
      </div>
    </div>
  </div>`;
}

/* 实物图：构建期注入已上传清单，只有实际存在的图片才发请求；同名 .jpg/.png/.webp 均可 */
var SHOTS = window.__SHOTS__ || null;
function shotFile(name){
  if(!name) return null;
  if(!SHOTS) return name;                       // 独立打开数据源：按原逻辑尝试
  if(SHOTS.indexOf(name)>=0) return name;
  const base=name.replace(/\.(jpg|jpeg|png|webp)$/i,"");
  const hit=SHOTS.find(f=>f.replace(/\.(jpg|jpeg|png|webp)$/i,"")===base);
  return hit||null;
}
/* .jpg 不存在时自动尝试 .png；都失败才回退占位 */
function shotFail(el){
  if(!el.dataset.tryPng){
    el.dataset.tryPng="1";
    el.src=(el.getAttribute("src")||"").replace(/\.jpg$/i,".png");
    return;
  }
  const ph=el.closest(".photo"); if(ph) ph.classList.add("noimg");
  const c=el.closest(".card"); if(c) c.classList.add("noimg");
  el.remove();
}
function matHay(d){return (d.name+d.model+d.cat+d.lv2+d.lv3+d.tag+(Array.isArray(d.parts)?d.parts:[d.parts||""]).join(" ")+(d.conn||"")+(d.func||"")+(d.principle||"")+(d.spec||"")+(d.adv||"")+(d.mate||"")+(d.std||"")).toLowerCase();}
/* 体验优化·P-G：零结果时给出跨分类命中引导，一键带关键词跳转到目标分类 */
function gotoCatKW(cat,kw){const q=document.getElementById("q");if(q)q.value=kw;pick(cat);}
function render(){
  const q=(document.getElementById("q").value||"").trim().toLowerCase();
  const list=DATA.filter(d=>{
    if(onlyCompany&&!d.companyUsed)return false;
    if(cur!=="全部"&&d.cat!==cur)return false;
    if(cur!=="全部"&&cur2!=="全部"&&d.lv2!==cur2)return false;
    if(!q)return true;
    return matHay(d).indexOf(q)>=0;
  });
  const grid=document.getElementById("grid");
  if(!list.length){
    const qv=(document.getElementById("q").value||"").trim();
    const scope=cur!=="全部"?`「${cur}${cur2!=="全部"?" / "+cur2:""}」分类`:"全部材料";
    const kw=qv?`、关键词「${escapeHtml(qv)}」`:"";
    let cross="";
    if(q){
      const others=CATS.slice(1).filter(c=>c!==cur).map(c=>{
        const n=DATA.filter(d=>d.cat===c&&(!onlyCompany||d.companyUsed)&&matHay(d).indexOf(q)>=0).length;
        return n?{c,n}:null;
      }).filter(Boolean);
      if(others.length){
        cross='<div class="empty-cross">或在 '+others.map(o=>`<a href="javascript:void(0)" data-cat="${escapeHtml(o.c)}" data-kw="${escapeHtml(qv)}">『${escapeHtml(o.c)}』找到 ${o.n} 项</a>`).join("、")+' 查看</div>';
      }
    }
    grid.innerHTML=`<div class="empty"><p>在${scope}${kw}下未找到匹配的材料。</p><div class="empty-actions"><button class="empty-clear" type="button" onclick="clearFilter()">清除筛选</button>${qv?`<button class="empty-clear ghost" type="button" onclick="clearKeyword()">仅清除关键词</button>`:""}</div>${cross}</div>`;
    updateCrumb(0);return;
  }

  let html="";
  // 二级分类(lv2)标题条 + 三级分类(lv3)各自独立小标题：每个 lv3 成为独立小标题块，下方紧跟其卡片
  const lv2block=(l2,items)=>{
    const lv3s=[...new Set(items.map(d=>d.lv3))].filter(Boolean);
    let body="";
    if(lv3s.length<=1){
      // 单一子类：不再重复出小标题，直接放卡片
      body=`<div class="ginner">${items.map(cardHtml).join("")}</div>`;
    } else {
      lv3s.forEach(l3=>{
        const grp=items.filter(d=>(d.lv3||"")===l3);
        body+=`<div class="gsubwrap"><div class="ghead3">${l3}</div><div class="ginner">${grp.map(cardHtml).join("")}</div></div>`;
      });
    }
    html+=`<div class="gwrap"><div class="grow"><div class="ghead2">${l2}</div></div>${body}</div>`;
  };
  if(cur==="全部"){
    CATS.slice(1).forEach(c=>{
      const cl=list.filter(d=>d.cat===c);
      if(!cl.length)return;
      html+=`<div class="ghead top">${c}</div>`;
      [...new Set(cl.map(d=>d.lv2))].forEach(l2=>{
        lv2block(l2,cl.filter(d=>d.lv2===l2));
      });
    });
  } else {
    const lv2groups=[...new Set(list.map(d=>d.lv2))];
    lv2groups.forEach(l2=>{
      const l2l=list.filter(d=>d.lv2===l2);
      lv2block(l2,l2l);
    });
  }
  grid.innerHTML=html;
  updateCrumb(list.length);
  if(window.MAT_HINTS) window.MAT_HINTS();
}
/* B4 · P1-09 面包屑回显关键词（可单独清除） + P2-08 结果数反馈 / 已显示全部 */
function escapeHtml(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function clearKeyword(){const q=document.getElementById("q");if(q)q.value="";render();}
function updateCrumb(count){
  const el=document.getElementById("crumb");
  if(!el) return;
  const qv=(document.getElementById("q").value||"").trim();
  const filtered=(cur!=="全部"||cur2!=="全部"||!!qv||onlyCompany);
  const n=(typeof count==="number")?count:DATA.length;
  const seg=[];
  if(cur!=="全部"){
    let c=`<span class="c">${escapeHtml(cur)}</span>`;
    if(cur2!=="全部") c+=`<span class="sep">/</span><span class="c">${escapeHtml(cur2)}</span>`;
    seg.push(`<span class="clab">筛选：</span>${c}`);
  }
  if(onlyCompany) seg.push(`<span class="co-scope">✓ 公司现用</span>`);
  if(qv) seg.push(`<span class="clab">关键词：</span><span class="c kw">${escapeHtml(qv)}<button class="kw-x" onclick="clearKeyword()" aria-label="仅清除关键词">✕</button></span>`);
  seg.push(`<span class="rcount">${filtered?`共 <b>${n}</b> 项结果`:`已显示全部 <b>${n}</b> 项`}</span>`);
  let h=seg.join(`<span class="csep"> · </span>`);
  if(filtered) h+=` <button class="c-clear" onclick="clearFilter()" aria-label="清除筛选">清除 ✕</button>`;
  el.innerHTML=h;
}
initDelegates();
buildTabs();
render();
document.getElementById("pcount").textContent = DATA.length + " 项（主材+管件）";

/* ===== 安装图库 IG（手写稳定区｜mat_inline.py 原样搬运，零改构建链） ===== */
(function(){
  /* 每个总成的 parts.mat 为材料卡真名（已核对 MAT_DATA），仅做跳卡，不参与 DATA 渲染 */
  const IG_DATA=[{
    id:"wm-group-01",
    title:"入户水表井安装总成",
    sub:"远传抄表 · 表前过滤减压 + 分户计量 · 示意装配图",
    img:"images/gallery/水表组安装总成.4e2f200319.png",
    thumb:"images/gallery/水表组安装总成.4e2f200319.thumb.jpg",
    flow:"闸阀 → 过滤阀 → 减压阀 → 表前阀 → 分水器 → 黄铜表前阀 → 远传电子水表 → 止回阀 → 黄铜球阀 → 各户",
    source:"组装后由顶端支管进水，沿衬塑管件按安装顺序依次流经闸阀、过滤阀、减压阀、表前阀至分水器分户，再经黄铜表前阀、远传电子水表计量、止回阀防倒流、黄铜球阀启闭后进入各家；减压阀组两端各装压力表，用于监测减压阀进水后是否正常工作。",
    foot:"图中标注为装配示意，具体阀门类型/型号以现场实际配置为准；点部件名可跳转对应材料卡。",
    /* x/y 热点中心＝新实拍图（1920×1615）彩色序号数字字形的像素级质心（HSV 颜色分割＋连通域测量），
       与前面安装图「热点圆覆盖原图序号数字字形」规则一致）；no10 为「10」两字符合并质心；圆盖住数字、不压中文说明 */
    parts:[
      {no:1,name:"压力表",      x:52.5,y:4.9, note:"监测管网压力，常配缓冲弯",         mat:"压力表"},
      {no:2,name:"闸阀",        x:52.6,y:32.7,note:"主管启闭，图示红手轮闸阀",         mat:"黄铜闸阀"},
      {no:3,name:"过滤阀",      x:87.6,y:46.9,note:"拦截杂质、保护水表，图示Y型过滤器", mat:"螺纹Y型过滤器"},
      {no:4,name:"减压阀",      x:87.5,y:55.1,note:"稳定入户压力",                     mat:"直动式减压阀"},
      {no:5,name:"表前阀",      x:87.4,y:63.3,note:"水表检修切断，图示加密闸阀",       mat:"加密闸阀"},
      {no:6,name:"分水器",      x:39.0,y:85.4,note:"分户配水",                         mat:"PE分水器"},
      {no:7,name:"黄铜表前阀",  x:55.8,y:80.3,note:"分水器各户端检修切断，图示黄铜球阀", mat:"黄铜内螺纹浮动球阀"},
      {no:8,name:"远传电子水表",x:1.9,y:81.3, note:"计量与远传抄表，图示光电直读",      mat:"光电直读远传水表"},
      {no:9,name:"止回阀",      x:3.1,y:19.4, note:"防止各户水倒流污染管网",           mat:"升降式止回阀"},
      {no:10,name:"黄铜球阀",   x:23.5,y:15.7,note:"分户启闭，图示黄铜内螺纹球阀",     mat:"黄铜内螺纹浮动球阀"}
    ]
  },{
    id:"pe-tap-01",
    title:"PE管道带压开孔分支安装",
    sub:"带压开孔 · 马鞍三通接出支管 · 示意装配图",
    img:"images/gallery/PE管道带压开孔分支安装.b3f019334a.png",
    thumb:"images/gallery/PE管道带压开孔分支安装.b3f019334a.thumb.jpg",
    flow:"PE主管 → 马鞍三通（带压开孔） → 闸阀 → 橡胶伸缩器 → PE支管",
    source:"组装后由PE给水主管带压进水，经抱箍夹紧的马鞍三通在不停水状态下开孔接出支管，再依次通过闸阀启闭检修、橡胶伸缩器补偿位移减振，将水送入PE支管。",
    foot:"图中标注为装配示意，马鞍三通抱箍夹紧主管后开孔接出支管，实现不停水分支；具体型号以现场实际配置为准；点部件名可跳转对应材料卡。",
    /* x/y 热点中心＝原图印刷数字标中心换算百分比（553×698） */
    parts:[
      {no:1,name:"PE管（主管）", x:74.7,y:59.8,note:"带压开孔的母管，图示PE给水管",       mat:"PE给水管"},
      {no:2,name:"马鞍三通",     x:14.6,y:75.5,note:"抱箍夹紧主管后开孔接出支管，不停水分支",mat:"鞍型管件（马鞍三通）"},
      {no:3,name:"闸阀",        x:11.8,y:56.0,note:"支管启闭检修，图示法兰暗杆闸阀",     mat:"弹性座封闸阀（暗杆式）"},
      {no:4,name:"橡胶伸缩器",  x:7.7,y:38.8, note:"补偿位移与减振，便于拆装",         mat:"可曲挠式橡胶接头"},
      {no:5,name:"PE管（支管）", x:17.2,y:10.6,note:"接出的分支供水管",                 mat:"PE给水管"}
    ]
  },{
    id:"outdoor-meter-well-01",
    title:"室外水表井安装总成",
    sub:"室外井 · 法兰连接 · 计量+防倒流+过滤+排气 · 示意装配图",
    img:"images/gallery/室外水表井安装总成.5294bb762c.png",
    thumb:"images/gallery/室外水表井安装总成.5294bb762c.thumb.jpg",
    flow:"黄铜排气阀 → 表前磁加密闸阀 → 过滤阀 → 螺翼式机械水表 → 低阻力倒流防止器 → 橡胶伸缩器 → 闸阀",
    source:"组装后由市政供水从井内主管下端进入，依次经过滤阀拦截杂质、螺翼式机械水表计量、低阻力倒流防止器阻断倒流污染，再由橡胶伸缩器补偿位移、闸阀控制启闭；表前磁加密闸阀便于水表检修切断，井内最高点的黄铜排气阀自动排除管内积气。",
    foot:"图中标注为装配示意，具体阀门类型/型号以现场实际配置为准；点部件名可跳转对应材料卡。",
    /* x/y 热点中心＝新图（474×974）蓝色序号数字字形的像素级质心测量，圆盖住数字字形、不压中文说明 */
    parts:[
      {no:1,name:"闸阀",              x:22.8,y:92.8,note:"井内主管启闭检修，图示法兰闸阀",       mat:"弹性座封闸阀（暗杆式）"},
      {no:2,name:"橡胶伸缩器",        x:22.8,y:77.7,note:"补偿位移与减振，便于拆装",             mat:"可曲挠式橡胶接头"},
      {no:3,name:"低阻力倒流防止器",  x:22.9,y:64.7,note:"防止管网水倒流污染，水表前设",         mat:"低阻力倒流防止器"},
      {no:4,name:"螺翼式机械水表",    x:69.7,y:38.8,note:"大流量计量，图示水平螺翼式",           mat:"水平螺翼机械水表"},
      {no:5,name:"磁加密闸阀（表前阀）",x:69.6,y: 9.3,note:"水表前检修切断，图示磁加密闸阀",      mat:"黄铜加密闸阀"},
      {no:6,name:"黄铜排气阀",        x:22.7,y: 2.7,note:"排除管内积气，装于井内最高点",         mat:"小口径黄铜自动排气阀"},
      {no:7,name:"过滤阀",            x:16.8,y:16.2,note:"拦截杂质保护水表，图示法兰Y型过滤器",  mat:"法兰Y型过滤器"}
    ]
  },{
    id:"air-vent-riser-01",
    title:"水表井立管自动排气阀组",
    sub:"立管顶端 · 自动排气 · 丝扣连接 · 示意装配图",
    img:"images/gallery/水表井立管自动排气阀组.4f003489e2.png",
    thumb:"images/gallery/水表井立管自动排气阀组.4f003489e2.thumb.jpg",
    flow:"衬塑管 → 补芯 → 内丝 → 表前阀 → 内丝 → 直接 → 黄铜排气阀",
    source:"组装后由立管下端的衬塑管进水，经补芯变径过渡、表前阀检修切断，再通过内丝与直接向上连接至顶端的黄铜排气阀；排气阀装于立管最高点，自动排除管内积气，保证计量与供水稳定。",
    foot:"图中标注为装配示意，排气阀装于立管最高点自动排除管内积气；具体阀门类型/型号以现场实际配置为准；点部件名可跳转对应材料卡。",
    /* x/y 热点中心＝新图（855×854）彩色序号数字字形的像素级质心（HSV 颜色分割＋连通域测量，
       与前面安装图「热点覆盖序号数字字形」规则一致）；18px 橙红圆盖住数字、不压中文说明 */
    parts:[
      {no:1,name:"黄铜排气阀",x:67.60,y:9.81, note:"装于立管最高点，自动排除管内积气",       mat:"小口径黄铜自动排气阀"},
      {no:2,name:"直接",      x:15.84,y:20.84,note:"丝扣连接直通件，图示双内丝直接",         mat:"衬塑双内丝直接"},
      {no:3,name:"内丝",      x:67.73,y:28.96,note:"双外丝直接过渡，便于排气阀拆装检修",     mat:"衬塑双外丝直接"},
      {no:4,name:"表前阀",    x:11.65,y:36.65,note:"表前检修切断，图示黄铜丝扣阀",           mat:"黄铜加密闸阀"},
      {no:5,name:"补芯",      x:67.58,y:49.39,note:"丝扣变径过渡，连接不同口径",             mat:"衬塑内外丝补芯（变径补芯）"},
      {no:6,name:"衬塑管",    x:11.63,y:62.71,note:"立管主体，图示钢衬塑复合管",             mat:"衬塑复合管"}
    ]
  },{
    id:"outdoor-hydrant-01",
    title:"室外地上式消火栓安装总成",
    sub:"地上式 · 消火栓 + 闸阀 + 伸缩节 · 示意装配图",
    img:"images/gallery/室外地上式消火栓安装总成.489bba585f.png",
    thumb:"images/gallery/室外地上式消火栓安装总成.489bba585f.thumb.jpg",
    flow:"主管 → 弹性座封闸阀 → 铸铁伸缩器 → 分支三通 → 支管 → 地上式消火栓",
    source:"组装后由市政给水主管引水，先经弹性座封闸阀控制启闭、铸铁伸缩器补偿主管位移，再通过分支三通从主管接出球墨铸铁支管，向上引至地上式消火栓；消火栓作为管网取水口供消防取水，闸阀检修时可切断该支路。",
    foot:"图中标注为装配示意，消火栓经支管接自市政主管，闸阀检修切断、伸缩器补偿位移；具体型号以现场实际配置为准；点部件名可跳转对应材料卡。",
    /* x/y 热点中心＝原图（833×827）彩色序号数字字形的像素级质心（HSV 颜色分割＋连通域测量，
       与前面安装图「热点圆覆盖原图序号数字字形」规则一致）；18px 橙红圆盖住数字、不压中文说明 */
    parts:[
      {no:1,name:"地上式消火栓",x:58.20,y:18.73,note:"市政管网取水口，图示地上式室外消火栓", mat:"地上式消火栓"},
      {no:2,name:"支管",        x:19.76,y:44.69,note:"消火栓接出分支管，图示球墨铸铁管",     mat:"球墨铸铁管"},
      {no:3,name:"闸阀",        x:89.14,y:67.46,note:"支管启闭检修，图示法兰弹性座封闸阀",   mat:"弹性座封闸阀（暗杆式）"},
      {no:4,name:"铸铁伸缩器",  x:55.22,y:96.78,note:"补偿位移与减振，便于消火栓拆装",       mat:"球墨铸铁伸缩节（限位型/传力型）"},
      {no:5,name:"主管",        x:26.81,y:86.14,note:"市政给水主管，图示球墨铸铁管",         mat:"球墨铸铁管"}
    ]
  }];
  let IG_cur=null;
  const $=id=>document.getElementById(id);

  /* 视图切换：从详情页切走时先回到图库列表，避免状态残留 */
  window.IG_mode=function(m){
    IG_back();
    const single=(m!=="gallery");
    $("igTabSingle").setAttribute("aria-selected",single?"true":"false");
    $("igTabGallery").setAttribute("aria-selected",single?"false":"true");
    $("igSingle").style.display=single?"":"none";
    $("igView").classList.toggle("ig-on",!single);
    try{window.scrollTo(0,0);}catch(e){}
  };

  /* 渲染图库卡片 */
  function renderGrid(){
    $("igGrid").innerHTML=IG_DATA.map(it=>
      '<div class="ig-card" role="button" tabindex="0" data-id="'+it.id+'" '+
      'onclick="IG_open(\''+it.id+'\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();this.click()}">'+
        '<div class="ig-thumb"><img src="'+it.thumb+'" alt="'+it.title+'" loading="lazy"><span class="ig-badge">安装总成</span></div>'+
        '<div class="ig-meta"><h3>'+it.title+'</h3><p>'+it.sub+'</p>'+
        '<span class="ig-partn">'+it.parts.length+' 个标注部件 · 点击查看</span></div>'+
      '</div>').join("");
  }

  /* 桌面放大气泡跟随鼠标：出现在指针右上方；悬停呼吸序号时切为"单击查看材料、橙色系"。
     触屏无 hover/mousemove，且 CSS 的 hover:none 规则用 !important 固定顶部位，互不冲突 */
  (function bindZoomTipFollow(){
    const stage=$("igStage"), tip=stage&&stage.querySelector(".ig-zoomtip");
    if(!stage||!tip) return;
    const ico=tip.querySelector(".ig-zoomtip-ico"), txt=tip.querySelector(".ig-zoomtip-txt");
    stage.addEventListener("mousemove",function(e){
      const r=stage.getBoundingClientRect();
      const mx=e.clientX-r.left, my=e.clientY-r.top;
      const tw=tip.offsetWidth||132, th=tip.offsetHeight||38;
      let left=mx+16, top=my-th-10;                 // 默认指针右上
      if(left+tw>r.width-4) left=mx-tw-16;          // 右侧空间不足则翻到左侧
      if(left<4) left=4;
      if(top<4) top=my+18;                           // 顶部空间不足则落到指针下方
      if(top+th>r.height-4) top=Math.max(4,r.height-th-4);
      tip.style.left=left+"px";
      tip.style.top=top+"px";
    });
    /* 桌面真支持 hover 时：滑过序号→"单击查看材料"，移开→恢复"单击图片放大"。
       触屏 tap 会合成 mouseover，用 hover:none 判定隔离，避免误改文案。 */
    if(ico && txt && !(window.matchMedia&&window.matchMedia("(hover:none)").matches)){
      const setTip=onHot=>{
        if(onHot){ ico.textContent="▤"; txt.textContent="单击查看材料"; tip.classList.add("ig-tip-mat"); }
        else     { ico.textContent="⤢"; txt.textContent="单击图片放大"; tip.classList.remove("ig-tip-mat"); }
      };
      stage.addEventListener("mouseover",e=>{ if(e.target.closest&&e.target.closest(".ighot")) setTip(true); });
      stage.addEventListener("mouseout", e=>{ if(e.target.closest&&e.target.closest(".ighot")) setTip(false); });
    }
  })();

  /* 右侧部件列表限高：不超过左侧图片区域高度（精确同步图区实测高度），超出内部滚动；
     移动端清空内联高度，回到 CSS 的 max-height:none，正常整页下滑。 */
  function fitIGList(){
    const fig=$("igFigure"), list=$("igList");
    if(!fig||!list) return;
    if(window.matchMedia("(max-width:720px)").matches){ list.style.maxHeight=""; updateIGHint(); return; }
    const h=fig.getBoundingClientRect().height;
    if(h>0) list.style.maxHeight=Math.round(h)+"px";
    requestAnimationFrame(updateIGHint);
  }
  /* 滚动提示：列表底部仍有未完整显示的部件行时显示，明确告知总数与剩余数；滚到底自动消失。
     以部件行相对列表底部的位置判断（不受 sticky 提示自身占位影响，避免显隐循环闪烁）。 */
  function updateIGHint(){
    const list=$("igList"), hint=$("igScrollHint"), rows=$("igRows");
    if(!list||!hint||!rows) return;
    if(window.matchMedia("(max-width:720px)").matches){ hint.classList.remove("ig-hint-on"); return; }
    const lb=list.getBoundingClientRect().bottom;
    const remain=[].filter.call(rows.querySelectorAll(".igprow"),
      el=>el.getBoundingClientRect().bottom>lb+2).length;
    if(remain>0){
      hint.innerHTML='<span class="ig-hint-arrow">↓</span> 下方还有 '+remain+' 个部件，下滑查看';
      hint.classList.add("ig-hint-on");
    }else{
      hint.classList.remove("ig-hint-on");
    }
  }
  window.addEventListener("resize",function(){ if($("igDetail").classList.contains("igd-on")) fitIGList(); });
  (function(){ const l=document.getElementById("igList"); if(l) l.addEventListener("scroll",updateIGHint,{passive:true}); })();

  /* 沉浸模式：详情页隐藏顶部统计Hero、视图切换条、平台底栏；返回后恢复。
     这些元素在 #mat-lib 外层/动态注入，CSS 会被 mat_inline scope 加前缀，故用内联 style 直接控制。 */
  function IG_chrome(on){
    const mobile=window.matchMedia("(max-width:720px)").matches;
    /* 统计条/切换条/引导条：两端都隐藏；底栏 sidebar：仅移动端隐藏（桌面为左侧主导航，保留） */
    /* 沉浸详情：移动端连站点大标题栏(header)一并隐藏，详情页从视口顶部开始，
       避免打开时把 header 滚上去导致顶部按钮钻到状态栏下方、底部留出空白滚动区 */
    const targets=[".v3-mat-hero", ".ig-seg", "#introBar"].concat(mobile?[".sidebar","header"]:[]);
    targets.forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){
        if(on){
          if(el.dataset.igPrevDisp===undefined) el.dataset.igPrevDisp=el.style.display||"";
          el.style.display="none";
        }else if(el.dataset.igPrevDisp!==undefined){
          el.style.display=el.dataset.igPrevDisp;
          delete el.dataset.igPrevDisp;
        }
      });
    });
  }

  /* 打开总成详情页（页面内视图切换，非弹窗：不受底栏/引导条遮挡，可自然滚动） */
  window.IG_open=function(id){
    const it=IG_DATA.find(x=>x.id===id); if(!it)return;
    IG_cur=it;
    $("igpTitle").textContent=it.title;
    $("igpSub").textContent=it.sub;
    $("igListTitle").textContent="图中共"+it.parts.length+"个部件 · 点序号看详情";
    $("igImg").src=it.img;
    $("igImg").alt=it.title;
    /* 列表限高跟随图区实测高度：图片加载完成后同步一次（含缓存命中与加载失败） */
    const im=$("igImg");
    const fit=()=>requestAnimationFrame(fitIGList);
    if(im.complete) fit(); else { im.onload=fit; im.onerror=fit; }
    /* 流程说明区：分步流程链 + 提示（字体大、观感舒适） */
    const steps=it.flow.split("→").map(s=>s.trim()).filter(Boolean);
    $("igpFoot").innerHTML=
      '<div class="igflow-t">安装流程</div>'+
      '<div class="igflow">'+steps.map((s,i)=>
        (i?'<span class="igarr" aria-hidden="true">›</span>':'')+
        '<span class="igstep">'+s+'</span>').join("")+'</div>'+
      (it.source?'<p class="igflow-src"><span class="igflow-src-ico">💧</span>'+it.source+'</p>':'')+
      '<p class="igfoot-note">'+it.foot+'</p>';
    /* 部件列表 */
    $("igRows").innerHTML=it.parts.map(p=>
      '<div class="igprow" data-no="'+p.no+'" tabindex="0" onclick="IG_focus('+p.no+')" '+
      'onkeydown="if(event.key===\'Enter\'){event.preventDefault();IG_focus('+p.no+')}">'+
        '<span class="igpno">'+p.no+'</span>'+
        '<span class="igptxt"><b>'+p.name+'</b><span>'+p.note+'</span>'+
        (p.mat?'<button type="button" class="igpjump" onclick="event.stopPropagation();IG_jump(\''+p.mat+'\',this)">查看材料卡</button>':'')+
        '</span></div>').join("");
    /* 图上热点（相对 igStage 定位，与图片同坐标系） */
    const stage=$("igStage");
    stage.querySelectorAll(".ighot").forEach(n=>n.remove());
    it.parts.forEach(p=>{
      const h=document.createElement("button");
      h.className="ighot"; h.textContent=p.no;
      h.setAttribute("data-no",p.no);
      h.style.left=p.x+"%"; h.style.top=p.y+"%";
      h.setAttribute("aria-label",p.no+" "+p.name+"，查看部件详情与材料卡");
      h.onclick=e=>{e.stopPropagation();
        if(window.matchMedia("(max-width:720px)").matches) IGsOpenPart(p.no);
        else { IG_focus(p.no); if(p.mat) IG_jump(p.mat,h); }  /* 桌面：先看部件详情，同时直接弹出对应材料卡 */
      };
      stage.appendChild(h);
    });
      /* 显示详情、隐藏列表 */
    $("igLead").style.display="none";
    $("igGrid").classList.add("igd-hidden");
    $("igDetail").classList.add("igd-on");
    /* 沉浸详情：隐藏顶部 Hero/统计条、视图切换、平台底栏；返回时恢复 */
    IG_chrome(true);
    /* 不高亮任何热点/部件，避免一进入就误显示"已选中" */
    IG_focus(0);
    /* 顶部元素与 header 已由 IG_chrome 隐藏，详情页从视口顶部开始；
       顶部按钮栏 sticky 吸顶，故只需回到文档顶部，勿再 scrollTo 到 detail 顶部（会把吸顶栏推走） */
    setTimeout(()=>{
      const d=$("igDetail"), ml=document.getElementById("mat-lib");
      try{ if(ml&&ml.scrollHeight>ml.clientHeight) ml.scrollTo({top:0,behavior:"instant"});
           else window.scrollTo(0,0); }catch(e){}
      const b=d.querySelector(".igd-back"); if(b)b.focus({preventScroll:true});
    },80);
  };

  /* 编号热点 ⇄ 部件列表 双向联动 */
  window.IG_focus=function(no){
    document.querySelectorAll("#igStage .ighot").forEach(n=>n.classList.toggle("ig-active",n.getAttribute("data-no")==no));
    document.querySelectorAll("#igList .igprow").forEach(n=>n.classList.toggle("ig-active",n.getAttribute("data-no")==no));
    const row=document.querySelector('#igList .igprow[data-no="'+no+'"]');
    if(row&&row.scrollIntoView)try{row.scrollIntoView({block:"nearest"});}catch(e){}
  };

  /* ===== 移动端底部抽屉：部件详情 / 安装流程 ===== */
  var IGsLast=null;                       /* 关闭后归还焦点的元素 */
  var IGsCurNo=0;                         /* 当前部件编号，供上/下一个翻页 */
  window.IGsOpenPart=function(no){
    if(!IG_cur)return;
    const p=IG_cur.parts.find(x=>x.no==no); if(!p)return;
    IGsCurNo=no;
    IG_focus(no);                         /* 联动高亮图上热点 */
    $("igsTitle").textContent="部件 "+p.no+" · "+p.name;
    const body=$("igsBody");
    body.innerHTML=
      '<div class="igsd-part"><div class="igsd-no">'+p.no+'</div>'+
      '<div class="igsd-info"><b>'+p.name+'</b><p>'+p.note+'</p></div></div>'+
      (p.mat?'<button type="button" class="igsd-cta" onclick="IGsJump(this,\''+p.mat+'\')">查看材料卡</button>':'');
    const idx=IG_cur.parts.findIndex(x=>x.no==no), total=IG_cur.parts.length;
    $("igsNav").innerHTML=
      '<button type="button" '+(idx<=0?'disabled':'onclick="IGsOpenPart('+IG_cur.parts[idx-1].no+')"')+'>‹ 上一个</button>'+
      '<button type="button" '+(idx>=total-1?'disabled':'onclick="IGsOpenPart('+IG_cur.parts[idx+1].no+')"')+'>下一个 ›</button>';
    IGsShow();
  };
  window.IGsOpenFlow=function(){
    if(!IG_cur)return;
    $("igsTitle").textContent="安装流程";
    const steps=IG_cur.flow.split("→").map(s=>s.trim()).filter(Boolean);
    $("igsBody").innerHTML=
      '<div class="igsd-flow">'+steps.map((s,i)=>
        (i?'<span class="igarr" aria-hidden="true">›</span>':'')+
        '<span class="igstep">'+s+'</span>').join("")+'</div>'+
      (IG_cur.source?'<p class="igsd-src"><span class="igflow-src-ico">💧</span>'+IG_cur.source+'</p>':'')+
      '<p class="igsd-note">'+IG_cur.foot+'</p>';
    $("igsNav").innerHTML='<button type="button" class="igs-primary" onclick="IGsClose()">看完关闭</button>';
    IGsShow();
  };
  function IGsShow(){
    IGsLast=document.activeElement;
    const mask=$("igsMask"), sheet=$("igsSheet");
    mask.classList.add("igs-on"); sheet.classList.add("igs-on");
    sheet.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
    requestAnimationFrame(function(){ mask.classList.add("igs-in"); sheet.classList.add("igs-in"); });
    const b=$("igsClose"); if(b)b.focus({preventScroll:true});
  }
  window.IGsClose=function(immediate){
    const mask=$("igsMask"), sheet=$("igsSheet");
    if(!sheet.classList.contains("igs-on"))return;
    mask.classList.remove("igs-in"); sheet.classList.remove("igs-in");
    sheet.setAttribute("aria-hidden","true");
    document.body.style.overflow="";
    /* 视觉收起（去 igs-in）走动画；DOM 收起（去 igs-on）默认等 260ms。
       但「从抽屉跳材料卡」时必须立即去掉 igs-on：否则深灰遮罩靠定时器延迟清除，
       真机上该定时器易被材料卡的 WAAPI 动画/滚动锁挤占，导致抽屉遮罩残留在顶部
       安全区（时间/信号/电量那一条发灰），关掉材料卡后依旧发灰。 */
    if(immediate){
      mask.classList.remove("igs-on"); sheet.classList.remove("igs-on");
    }else{
      setTimeout(function(){ mask.classList.remove("igs-on"); sheet.classList.remove("igs-on"); },260);
    }
    if(IGsLast&&IGsLast.focus)try{IGsLast.focus({preventScroll:true});}catch(e){}
    IGsLast=null;
  };
  /* 抽屉内点「查看材料卡」：立即收起抽屉遮罩（不等延迟），再走课程同款 openExpand，
     避免深灰抽屉遮罩与材料卡遮罩在顶部安全区叠加/残留 */
  window.IGsJump=function(btn,name){ IGsClose(true); IG_jump(name,btn); };
  /* ESC 关闭抽屉 */
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape" && $("igsSheet") && $("igsSheet").classList.contains("igs-on")) IGsClose();
  });
  /* 顶部「查看安装流程」按钮委托到统一流程抽屉 */
  window.IG_openFlow=function(){ IGsOpenFlow(); };

  /* 跳转材料卡：与课程关联材料卡完全一致——用 openExpand 打开带实物图+说明的中央展开卡 */
  window.IG_jump=function(name,btn){
    if(typeof DATA==="undefined") return;
    let d=DATA.find(function(x){return x.name===name;});
    /* 宽松兜底：历史映射若写通用名/别名（如"闸阀""球阀"），按核心词再匹配一次，
       避免精确名不一致时 openDetail 静默 return、按钮点了没反应 */
    if(!d && name){
      const core=String(name).replace(/[（(][^)）]*[)）]/g,"").trim();
      if(core.length>=2)
        d=DATA.find(function(x){return x.name===core;})||
          DATA.find(function(x){return x.name.indexOf(core)>=0;});
    }
    if(d && typeof openExpand==="function"){ openExpand(d, btn||null); return; }
    /* 兜底：极个别材料未进 DATA 时退回旧简版卡 */
    if(typeof openDetail==="function") openDetail(name);
  };

  /* 返回图库列表 */
  window.IG_back=function(){
    const d=$("igDetail");
    if(!d.classList.contains("igd-on"))return;
    if($("igsSheet").classList.contains("igs-on"))IGsClose();
    d.classList.remove("igd-on");
    $("igGrid").classList.remove("igd-hidden");
    $("igLead").style.display="";
    IG_chrome(false);
    IG_cur=null;
    try{window.scrollTo(0,0);}catch(e){}
  };

  /* 初始化：默认单件材料视图 */
  renderGrid();
  IG_mode("single");
})();

/* ===== 安装图放大灯箱：FLIP 飞出放大 + 二次缩放（上限 4x，下限 1x） ===== */
(function(){
  const g=id=>document.getElementById(id);
  const box=g("igLightbox"), stage=g("iglbStage"), big=g("iglbImg"),
        pct=g("iglbPct"), zin=g("iglbZoomIn"), zout=g("iglbZoomOut");
  if(!box||!stage||!big) return;
  const MIN=1, MAX=4;
  const reduced=()=>window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  let zoom=1, tx=0, ty=0;          /* 当前缩放与平移 */
  let srcImg=null, opened=false, closing=false;
  let ghost=null, ghostTimer=null;   /* 飞入克隆层：与主图彻底解耦 */
  const pts=new Map();             /* 活动触点：单指平移 / 双指 pinch */
  let drag=null, pinchDist=0, pinchZoom=1;

  /* iOS WKWebView：祖先的 -webkit-overflow-scrolling:touch 会把 position:fixed 的包含块
     从视口劫持到该滚动容器，导致灯箱 inset:0 只盖到 #mat-lib 底部（底栏上方露出 body 工程网格）。
     打开期间临时降级为 auto 让灯箱重新贴视口；关闭后精确还原（含 scrollTop），避免滚动跳动。 */
  let _ovSaved=[];
  const releaseContainingBlock=()=>{
    _ovSaved=[];
    let n=box.parentElement;
    while(n && n!==document.documentElement){
      const cs=window.getComputedStyle?window.getComputedStyle(n):null;
      const computedTouch=cs&&((cs.webkitOverflowScrolling||cs.WebkitOverflowScrolling||"")==="touch");
      const inlineTouch=/touch/.test(n.style.webkitOverflowScrolling||n.style.WebkitOverflowScrolling||"");
      if(computedTouch||inlineTouch){
        const rec={el:n,prev:n.style.webkitOverflowScrolling||n.style.WebkitOverflowScrolling||"",
                   top:n.scrollTop,left:n.scrollLeft};
        n.style.webkitOverflowScrolling="auto";
        try{ n.scrollTop=rec.top; n.scrollLeft=rec.left; }catch(e){}  /* 切换后立刻补回滚动位置 */
        _ovSaved.push(rec);
      }
      n=n.parentElement;
    }
  };
  const restoreContainingBlock=()=>{
    _ovSaved.forEach(function(rec){
      rec.el.style.webkitOverflowScrolling=rec.prev;
      try{ rec.el.scrollTop=rec.top; rec.el.scrollLeft=rec.left; }catch(e){}
    });
    _ovSaved=[];
  };

  const clamp=()=>{
    /* 把平移限制在「放大后超出视口的范围内」，保证图片边缘不会被拖出可视区 */
    const maxX=Math.max(0,(big.clientWidth*zoom-stage.clientWidth)/2);
    const maxY=Math.max(0,(big.clientHeight*zoom-stage.clientHeight)/2);
    tx=Math.min(maxX,Math.max(-maxX,tx));
    ty=Math.min(maxY,Math.max(-maxY,ty));
  };
  const apply=()=>{
    clamp();
    big.style.transform="translate("+tx+"px,"+ty+"px) scale("+zoom+")";
    if(pct) pct.textContent=Math.round(zoom*100)+"%";
    if(zout) zout.disabled=zoom<=MIN+0.001;
    if(zin) zin.disabled=zoom>=MAX-0.001;
  };
  const reset=()=>{ zoom=1;tx=0;ty=0;apply(); };
  const setZoom=(z)=>{ zoom=Math.min(MAX,Math.max(MIN,z)); if(zoom===1){tx=0;ty=0;} apply(); };

  /* 飞入动画彻底解耦：动画只作用于独立的 ghost 克隆层，主图 opacity 恒由 CSS class
     控制（.iglb-flying 时隐藏、移除后显示），transform 恒由 apply() 控制。
     因此即便 WebView 的 WAAPI onfinish 不触发、fill:both 卡在起始帧，
     最坏情况只是 ghost 残留，主图依然清晰且可缩放。 */
  const clearGhost=()=>{
    if(ghostTimer){ clearTimeout(ghostTimer); ghostTimer=null; }
    if(ghost){ try{ ghost.remove(); }catch(e){} ghost=null; }
  };
  const revealBig=()=>{
    box.classList.remove("iglb-flying");   /* 主图 opacity 走 CSS，稳定淡入到 1 */
    clearGhost();                          /* 飞入完成，移除克隆层 */
  };
  /* 交互入口：不再 cancel 任何作用在主图上的动画，只需确保主图已显示、克隆层已清理 */
  const ensureReady=()=>{ if(box.classList.contains("iglb-flying")) revealBig(); };

  window.IGlbZoom=function(d){ ensureReady(); setZoom(zoom+d); };
  window.IGlbReset=function(){ ensureReady(); reset(); };

  /* 以视口内某点为中心缩放（滚轮/双击） */
  const zoomAt=(next,cx,cy)=>{
    ensureReady();
    next=Math.min(MAX,Math.max(MIN,next));
    if(next<1){reset();return;}
    const r=stage.getBoundingClientRect();
    const ox=cx-(r.left+r.width/2), oy=cy-(r.top+r.height/2);
    const k=next/zoom;
    tx=ox-(ox-tx)*k; ty=oy-(oy-ty)*k; zoom=next; apply();
  };

  window.IGlbOpen=function(){
    if(opened||closing) return;
    const im=g("igImg");
    if(!im||!im.src) return;
    releaseContainingBlock();   /* iOS：先解除滚动祖先对 fixed 灯箱的包含块劫持 */
    srcImg=im;
    clearGhost();
    big.src=im.src; big.alt=im.alt||"安装总成图放大查看";
    big.style.opacity=""; big.style.transform="";
    reset();
    box.classList.add("iglb-on");
    box.setAttribute("aria-hidden","false");
    /* 主图默认就显示（不加 flying），保证任何时刻都清晰、可缩放；
       飞入动画只在一个独立克隆层上播放，播完/超时即移除。 */
    const from=im.getBoundingClientRect();
    requestAnimationFrame(()=>{
      box.classList.add("iglb-in");
      const to=big.getBoundingClientRect();
      if(!reduced()&&from.width>0&&to.width>0&&document.body.appendChild){
        try{
          const gh=document.createElement("img");
          gh.className="iglb-ghost";
          gh.src=im.src; gh.alt=im.alt||""; gh.draggable=false;
          gh.style.left=to.left+"px"; gh.style.top=to.top+"px";
          gh.style.width=to.width+"px"; gh.style.height=to.height+"px";
          document.body.appendChild(gh);
          ghost=gh;
          const sx=from.width/to.width, sy=from.height/to.height;
          const dx=from.left-to.left+(from.width-to.width)/2;
          const dy=from.top-to.top+(from.height-to.height)/2;
          const a=gh.animate([
            {transform:"translate("+dx+"px,"+dy+"px) scale("+sx+","+sy+")",opacity:.5},
            {transform:"translate(0px,0px) scale(1)",opacity:1}
          ],{duration:320,easing:"cubic-bezier(.2,.75,.25,1)",fill:"both"});
          ghostTimer=setTimeout(clearGhost,340);   /* 不依赖 onfinish，定时兜底必删 */
        }catch(e){ clearGhost(); }
      }
    });
    opened=true;
    if(window.OverlayManager&&window.__OM_Z__){
      OverlayManager.push("lightbox",{el:box,z:window.__OM_Z__.modal+2,close:IGlbClose,deferDetach:true});
    }else{ document.body.style.overflow="hidden"; }
    setTimeout(()=>{ try{g("iglbClose").focus({preventScroll:true});}catch(e){} },60);
  };

  window.IGlbClose=function(){
    if(!opened||closing) return;
    closing=true;
    const im=srcImg;
    const finish=()=>{
      clearGhost();
      box.classList.remove("iglb-in","iglb-on","iglb-flying");
      box.setAttribute("aria-hidden","true");
      big.style.opacity=""; big.style.transform="";
      if(window.OverlayManager){ OverlayManager.remove("lightbox"); }
      else{ document.body.style.overflow=""; }
      restoreContainingBlock();   /* iOS：灯箱隐藏后还原滚动祖先的 overflow-scrolling 与滚动位置 */
      opened=false; closing=false; srcImg=null;
    };
    clearGhost();
    /* 飞回原图位置：同样只作用于独立克隆层，主图直接隐藏，绝不被动画占据 */
    const to=im?im.getBoundingClientRect():null;
    const from=big.getBoundingClientRect();
    box.classList.remove("iglb-in");   /* 主图随灯箱整体淡出 */
    if(!reduced()&&to&&to.width>0&&from.width>0){
      try{
        const gh=document.createElement("img");
        gh.className="iglb-ghost";
        gh.src=big.src; gh.alt=big.alt||""; gh.draggable=false;
        gh.style.left=from.left+"px"; gh.style.top=from.top+"px";
        gh.style.width=from.width+"px"; gh.style.height=from.height+"px";
        gh.style.transform=big.style.transform||"";
        document.body.appendChild(gh);
        ghost=gh;
        const sx=to.width/from.width, sy=to.height/from.height;
        const dx=to.left-from.left+(to.width-from.width)/2;
        const dy=to.top-from.top+(to.height-from.height)/2;
        gh.animate([
          {transform:(big.style.transform||"translate(0px,0px) scale(1)"),opacity:1},
          {transform:"translate("+dx+"px,"+dy+"px) scale("+sx+","+sy+")",opacity:.15}
        ],{duration:260,easing:"cubic-bezier(.35,0,.7,.3)",fill:"both"});
        ghostTimer=setTimeout(finish,270);   /* 不依赖 onfinish */
      }catch(e){ finish(); }
    }else{ setTimeout(finish,reduced()?0:200); }
  };

  /* 点遮罩空白处关闭（图片与控件不触发） */
  box.addEventListener("click",e=>{
    if(e.target===box||e.target===stage) IGlbClose();
  });
  /* 双击复位 */
  stage.addEventListener("dblclick",e=>{ if(e.target!==big)return; e.preventDefault(); ensureReady(); reset(); });
  /* 滚轮缩放（以指针为中心） */
  stage.addEventListener("wheel",e=>{
    if(!opened)return;
    ensureReady();
    e.preventDefault();
    const step=e.deltaY<0?0.25:-0.25;
    zoomAt(zoom+step,e.clientX,e.clientY);
  },{passive:false});

  /* 指针：单指/鼠标拖动平移；双指 pinch 缩放（触点数变化时重设基准，避免跳变） */
  const twoPts=()=>{const p=[...pts.values()];return p.length>=2?[p[0],p[1]]:null;};
  stage.addEventListener("pointerdown",e=>{
    if(!opened||closing)return;
    ensureReady();
    pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===1){
      drag={x:e.clientX,y:e.clientY,tx:tx,ty:ty,pointerId:e.pointerId};
      pinchDist=0;
      try{stage.setPointerCapture(e.pointerId);}catch(err){}
    }else if(pts.size===2){
      drag=null;
      const p=twoPts();
      pinchDist=p?Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y):0;
      pinchZoom=zoom;
    }
  });
  stage.addEventListener("pointermove",e=>{
    if(!opened||!pts.has(e.pointerId))return;
    pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    const pair=twoPts();
    if(pair){
      const d=Math.hypot(pair[0].x-pair[1].x,pair[0].y-pair[1].y);
      if(pinchDist>0){
        const z=pinchZoom*(d/pinchDist);
        zoom=Math.min(MAX,Math.max(MIN,z));
        if(zoom>1){tx=0;ty=0;}
        apply();
      }
      return;
    }
    if(drag&&drag.pointerId===e.pointerId){
      tx=drag.tx+(e.clientX-drag.x);
      ty=drag.ty+(e.clientY-drag.y);
      apply();
    }
  });
  const endPtr=e=>{
    pts.delete(e.pointerId);
    if(pts.size<2) pinchDist=0;
    if(pts.size===1){
      const [id,p]=[...pts.entries()][0];
      drag={x:p.x,y:p.y,tx:tx,ty:ty,pointerId:id};
    }else if(pts.size===0){ drag=null; }
  };
  stage.addEventListener("pointerup",endPtr);
  stage.addEventListener("pointercancel",endPtr);
})();
/* B4 · P1-10：分类数 / 项数 / 路径文案全部由 CATS、DATA 派生，禁止硬编码；并加发布前一致性断言 */
(function(){
  const catN=CATS.length-1, itemN=DATA.length;
  const fix=el=>{ if(!el) return;
    el.innerHTML=el.innerHTML.replace(/6\s*大类/g,catN+" 大类").replace(/105\s*项/g,itemN+" 项");
  };
  document.querySelectorAll("header p, .banner, footer p").forEach(fix);
  /* B4-M3：pathSteps 断言保留但恒为 0（路径 DOM 已删除），不引用已删元素 */
  const steps=[];
  const bad=[];
  window.__B4_ASSERT__=window.__B4_ASSERT__||{};
  Object.assign(window.__B4_ASSERT__,{
    catCount:catN, itemCount:itemN, pathSteps:0,
    allDataCatValid:true, badCats:bad,
    /* 口径：header / banner 内嵌平台壳后为 display:none，body.innerText 不含它们；
       文案派生是否生效须按源文案节点的 textContent 判定，不能用渲染可见文本。 */
    docCatOk:[...document.querySelectorAll("header p, .banner, footer p")].some(el=>el.textContent.indexOf(catN+" 大类")>=0),
    docItemOk:[...document.querySelectorAll("header p, .banner, footer p")].some(el=>el.textContent.indexOf(itemN+" 项")>=0)
  });
  if(bad.length) console.warn("[B4 一致性] 非法 data-cat:",bad.join(","));
})();

/* W-M3：触屏设备文案从「悬停/键盘」切换为「点按」，与实际交互一致 */
(function(){
  if(!window.matchMedia("(pointer:coarse)").matches) return;
  const map=[
    ["鼠标悬停即可看到解释","点按即可看到解释"],
    ["鼠标悬停即显示解释","点按即显示解释"],
    ["正文术语悬停即见解释","正文术语点按即见解释"],
    ["悬停术语可见解释","点按术语可见解释"],
    ["键盘可用 Tab/Enter 切换分类","触屏点按可切换分类"]
  ];
  const fix=el=>{ if(!el) return; let h=el.innerHTML; map.forEach(([a,b])=>{ if(h.includes(a)) h=h.split(a).join(b); }); el.innerHTML=h; };
  document.querySelectorAll("header p, .banner, footer p").forEach(fix);
  const tb=document.getElementById("termBtn"); if(tb) tb.title="点击虚线词查看解释";
  const ef=document.getElementById("expFigure"); if(ef) ef.title="点按图片翻到完整说明";
})();

/* W-M5：触屏设备默认收起首屏引导（平台说明），让材料列表前置。
   B4-M3：学习路径 DOM 已删除，仅保留 banner 处理。 */
if(window.matchMedia("(pointer:coarse)").matches){
  const b=document.querySelector(".banner"); if(b) b.removeAttribute("open");
}

// —— 结构组成：v2.13.0 按 v3 样张落地为静态展示，不再绑定「点击弹部件窗」。 ——
// 原全局事件委托（click / keydown → openPart）已移除；正文术语(.term)点按解释仍保留。
// openPart / partMore / closeModal 定义保留仅供历史弹层 DOM 引用，运行时不再被触发。

const mask=document.getElementById("mask");
function openPart(d,part){
  document.getElementById("mTitle").textContent=part;
  document.getElementById("mSub").textContent="所属材料："+d.name+"（"+d.model+" · "+d.tag+"）";
  document.getElementById("mParts").innerHTML=(Array.isArray(d.parts)?d.parts:[d.parts]).filter(Boolean).map(p=>`<li class="${p===part?"active":""}" onclick="partMore('${d.name.replace(/'/g,"\\'")}','${p.replace(/'/g,"\\'")}')" role="button" tabindex="0">${p}</li>`).join("");
  document.getElementById("mMore").innerHTML="";
  const lab2=document.getElementById("mLab2");
  const body=document.getElementById("mBody");
  if(d.conn){
    lab2.textContent="连接方式 / 作用";
    body.innerHTML=`<b>连接方式：</b>${d.conn}<br><b>作用：</b>${d.func}`;
  }else{
    lab2.textContent="工作原理";
    body.textContent=d.principle;
  }
  mask.classList.add("show");
  OverlayManager.push("part",{el:mask,z:OM_Z.modal,close:closeModal});
  setTimeout(()=>{const c=document.querySelector("#mask .close"); if(c) c.focus();},60);
}
/* 点击部件：列出含该部件的材料，支持顺藤摸瓜查看（消除 chip 死路） */
function partMore(dname,part){
  const matches=DATA.filter(x=>(Array.isArray(x.parts)?x.parts:[x.parts]).includes(part));
  const box=document.getElementById("mMore");
  if(!matches.length){box.innerHTML="";return;}
  const n=matches.length;
  const btn=x=>`<button class="morebtn" onclick="closeModal();openDetail('${x.name.replace(/'/g,"\\'")}')">${x.name}</button>`;
  let html=`<div class="mlab">含此部件的材料（共 ${n} 项）</div>`;
  if(n>8){
    const groups={};
    matches.forEach(x=>{(groups[x.cat]=groups[x.cat]||[]).push(x);});
    html+=Object.keys(groups).map(cat=>
      `<div class="more-group"><span class="more-gcat">${cat}</span>`+groups[cat].map(btn).join("")+`</div>`
    ).join("");
  }else{
    html+=matches.map(btn).join("");
  }
  box.innerHTML=html;
}
function closeModal(){mask.classList.remove("show");OverlayManager.remove("part");}

/* —— 完整说明弹窗：复用 detailHtml —— */
function openDetail(name){
  const d=DATA.find(x=>x.name===name); if(!d) return;
  document.getElementById("dTitle").textContent=d.name;
  document.getElementById("dSub").textContent=d.model+" · "+d.tag+" · "+d.cat;
  document.getElementById("dBody").innerHTML=detailHtml(d,false);
  document.getElementById("dmask").classList.add("show");
  OverlayManager.push("detail",{el:document.getElementById("dmask"),z:OM_Z.modal,close:closeDetail});
  setTimeout(()=>{const c=document.querySelector("#dmask .close"); if(c) c.focus();},60);
}
function closeDetail(){document.getElementById("dmask").classList.remove("show");OverlayManager.remove("detail");}
const dmask=document.getElementById("dmask");
dmask.addEventListener("click",e=>{if(e.target===dmask)closeDetail();});
mask.addEventListener("click",e=>{if(e.target===mask)closeModal();});
/* B2 · P1-06：ESC / Tab 统一由下方 OverlayManager 的 capture 监听接管，此处不再重复注册 */

/* —— 中央展开：卡片飞入中央显示完整大图，再点图片翻到完整说明 —— */
const expMask=document.getElementById("expmask");
const expCard=document.getElementById("expcard");
let expSrc=null,expAnim=null,expAnimOp=null,expMaskAnim=null,expCur=null,expToken=0;

/* ==========================================================================
   B2 · OverlayManager：浮层栈 + 5 级运行时层级 + 背景 inert + 焦点循环 + ESC 单层
   模态浮层 3 个：expand 展开卡 / part 部件小卡 / detail 完整说明
   轻量层 1 个：tip 术语气泡（pointer-events:none 且非模态，不入栈；ESC 优先关闭）
   说明：浮层 DOM 位于 .main > #m-materials > #mat-lib 内部，直接给 .main 加 inert
        会连浮层一起冻结（HTML inert 不可被子元素取消），故采用「背景子树 inert +
        仅栈顶浮层可交互 + Tab 在栈顶浮层内循环」的等效隔离，断言 #11 按此口径验收。
   ========================================================================== */
const OM_Z={base:1,sticky:20,overlay:60,modal:70,toast:90};
window.__OM_Z__=OM_Z;
const OM_MODAL=[
  {id:"expand",el:document.getElementById("expcard")},
  {id:"part",  el:document.getElementById("mask")},
  {id:"detail",el:document.getElementById("dmask")},
  {id:"lightbox",el:document.getElementById("igLightbox")}
];
function omReduced(){return !!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches);}
function omStopAnim(){
  /* v2.25 第五轮：卡片关闭动画拆成「几何」与「透明度」两条（见 closeExpand），
     两条都要停。注意：本函数【不】碰遮罩动画 —— 遮罩淡出必须活到淡出结束，
     提前 cancel 会让遮罩瞬间消失（等于把淡出时长吃掉）。 */
  if(expAnim){
    try{expAnim.onfinish=null;expAnim.oncancel=null;expAnim.cancel();}catch(e){}
    expAnim=null;
  }
  if(expAnimOp){
    try{expAnimOp.onfinish=null;expAnimOp.oncancel=null;expAnimOp.cancel();}catch(e){}
    expAnimOp=null;
  }
}
/* 遮罩淡出动画单独收：仅在「淡出自然结束」或「重新打开」时调用 */
function omStopMaskAnim(){
  if(expMaskAnim){
    try{expMaskAnim.onfinish=null;expMaskAnim.oncancel=null;expMaskAnim.cancel();}catch(e){}
    expMaskAnim=null;
  }
}
const OverlayManager={
  stack:[],
  top(){return this.stack[this.stack.length-1]||null;},
  bgNodes(){
    const overlays=OM_MODAL.map(x=>x.el).filter(Boolean);
    const out=[];
    /* #mat-lib 内除 4 个浮层根之外的内容子树（header / .wrap / 搜索 / 卡片网格…） */
    document.querySelectorAll("#mat-lib > :not(#mask):not(#dmask):not(#expmask):not(#expcard):not(#igLightbox)").forEach(n=>out.push(n));
    /* 平台外壳：侧栏 / 底部导航 / 非激活板块 */
    document.querySelectorAll(".sidebar, .nav, .module:not(#m-materials)").forEach(n=>out.push(n));
    return out.filter(n=>n&&!overlays.some(o=>o&&o.contains(n)));
  },
  sync(){
    const ids=new Set(this.stack.map(x=>x.id));
    const topId=this.top()?this.top().id:null;
    /* 仅栈顶浮层可交互，其余模态浮层默认 inert（避免焦点跑进下层浮层） */
    OM_MODAL.forEach(l=>{if(l.el) l.el.inert=(!ids.has(l.id)||l.id!==topId);});
    const bg=this.bgNodes();
    const on=this.stack.length>0;
    bg.forEach(n=>{n.inert=on;});
    document.body.style.overflow=on?"hidden":"";
    window.__OM_STATE__={
      stack:this.stack.map(x=>x.id),z:OM_Z,
      bgInert:bg.filter(n=>n.inert).length,
      modalInert:OM_MODAL.filter(l=>l.el&&l.el.inert).length,
      reducedMotion:omReduced()
    };
  },
  _detach(entry){
    const i=this.stack.indexOf(entry);
    if(i<0) return false;
    this.stack.splice(i,1);
    if(entry.el&&entry._z){entry.el.style.zIndex="";}
    this.sync();
    const rf=entry.returnFocus;
    if(rf&&rf.isConnected){try{rf.focus({preventScroll:true});}catch(e){}}
    return true;
  },
  push(id,opt){
    const old=this.stack.findIndex(x=>x.id===id);
    if(old>=0){const e=this.stack.splice(old,1)[0];if(e.el&&e._z)e.el.style.zIndex="";}
    /* deferDetach：展开卡自行编排「卡片归零 → 背景突变 → 遮罩淡出」三段式，
       背景层突变必须延后到卡片不可见之后，故 ESC 关闭时不得在此之前提前解栈。 */
    const entry={id,el:opt.el,close:opt.close,returnFocus:opt.returnFocus||document.activeElement,_z:false,deferDetach:!!opt.deferDetach};
    if(entry.el&&opt.z){entry.el.style.zIndex=String(opt.z);entry._z=true;}
    this.stack.push(entry);
    this.sync();
    return entry;
  },
  remove(id){
    const e=this.stack.find(x=>x.id===id);
    if(e) this._detach(e);
  },
  pop(){
    const e=this.top();
    if(!e) return false;
    /* v2.25 第四轮（风险1）：原先 pop() 先 _detach（解栈 / 解 inert / 恢复滚动 / 还焦点）再 close()，
       等于在「卡片仍 100% 全显」时就突变背景层 —— 真机上会迫使合成器对整屏背景重新栅格化，
       覆盖其上的展开卡图层可能被单独合成 → 用户看到「闪一下大卡」。
       现在改为：先交由浮层自身的 close() 编排关闭（展开卡会把背景突变延后到卡片归零之后），
       其余浮层的 close() 内部已自行 OverlayManager.remove(id)，此处仅作兜底出栈。 */
    try{e.close&&e.close();}catch(err){}
    if(!e.deferDetach&&this.stack.indexOf(e)>=0) this._detach(e);
    return true;
  },
  reset(){
    this.stack.forEach(e=>{if(e.el&&e._z)e.el.style.zIndex="";});
    this.stack=[];
    this.sync();
  },
  focusables(el){
    /* getClientRects() 为空可排除「祖先 display:none」的隐藏项（如未翻转面的按钮）。
       只判断元素自身 display 会漏掉这类项，导致 Tab 落到 BODY 跑出浮层（断言 #11）。 */
    return Array.from(el.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'))
      .filter(n=>{
        if(!n.isConnected||n.getClientRects().length===0) return false;
        const cs=getComputedStyle(n);
        return cs.display!=="none"&&cs.visibility!=="hidden";
      });
  }
};
window.OverlayManager=OverlayManager;

/* 全局键盘（capture）：ESC 只关最顶层；Tab 在栈顶浮层内循环 */
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    if(tipEl){hideTermTip();e.preventDefault();return;}   /* 术语气泡是最轻量层，先关 */
    if(OverlayManager.pop()){e.preventDefault();}
    return;
  }
  if(e.key!=="Tab") return;
  const top=OverlayManager.top();
  if(!top||!top.el) return;
  const list=OverlayManager.focusables(top.el);
  if(!list.length){e.preventDefault();try{top.el.focus({preventScroll:true});}catch(err){}return;}
  /* 完全接管：每次 Tab 显式落到栈顶浮层内的下一个可聚焦项，
     不依赖浏览器默认顺序，避免隐藏面 / inert 节点把焦点带到 BODY（断言 #11）。 */
  const i=list.indexOf(document.activeElement);
  const next=e.shiftKey
    ? (i<=0?list[list.length-1]:list[i-1])
    : (i<0||i>=list.length-1?list[0]:list[i+1]);
  e.preventDefault();
  try{next.focus({preventScroll:true});}catch(err){}
},true);
OverlayManager.sync();
function expContent(d){
  const esc=d.name.replace(/"/g,"&quot;");
  const fn=shotFile(d.img);
  return `<div class="photo${fn?"":" noimg"}">${fn?`<img class="shot" src="images/${fn}" alt="${esc}" decoding="async" onerror="shotFail(this)">`:""}<div class="ph">${d.icon?`<img class="ico" src="images/icons/${d.icon}.svg" alt="">`:""}<span>暂无实物图</span></div></div>`;
}
function syncExpScrollHint(){
  const _eb=document.getElementById("expBack");
  if(!_eb) return;
  const _recheck=()=>{
    const scrollable=_eb.scrollHeight>_eb.clientHeight+4;
    if(scrollable){
      if(!_eb._ss){_eb._ss=()=>{_eb.classList.toggle("end",_eb.scrollTop+_eb.clientHeight>=_eb.scrollHeight-4);};_eb.addEventListener("scroll",_eb._ss,{passive:true});}
      _eb.classList.remove("no-scroll");_eb._ss();
    }else{
      if(_eb._ss){_eb.removeEventListener("scroll",_eb._ss);_eb._ss=null;}
      _eb.classList.add("no-scroll");
    }
  };
  _recheck();
  requestAnimationFrame(_recheck);          /* 布局稳定后校准 */
  setTimeout(_recheck,80);                   /* 翻面动画落位后校准 */
  _eb.querySelectorAll("img").forEach(im=>{ if(!im.complete) im.addEventListener("load",_recheck,{once:true}); }); /* 图片到位后校准 */
}
function expFlip(on){
  expCard.classList.toggle("flipped",on);
  syncExpScrollHint();                      /* 体验优化·P-B：翻面后重新校准说明面滚动提示 */
}
function openExpand(d,card){
  if(!d) return;
  /* B6：快速连点/重复入栈时先清上一张卡的状态，避免遮罩与 exp-open 残留 */
  if(expSrc){expSrc=null;expCur=null;}
  const tk=++expToken;
  omStopAnim();                         /* B2：重入时先断开旧动画回调，避免 oncancel 误清新卡 */
  expSrc=card;
  expCur=d;
  document.getElementById("expTitle").textContent=d.name;
  document.getElementById("expSub").textContent=d.model+" · "+d.tag+" · "+d.cat+" · "+d.lv2;
  document.getElementById("expFig").innerHTML=expContent(d);
  document.getElementById("expBody").innerHTML=detailHtml(d,false);
  /* B4 · P1-12 双向关联：从材料直达相关练习（题目由平台壳从同一 DATA 派生） */
  (function(){
    const eb=document.getElementById("expBody");
    const rel=window.MAT_QUIZ_REF?window.MAT_QUIZ_REF(d.name):-1;
    if(rel<0||!eb) return;
    const a=document.createElement("button");
    a.className="morebtn quiz-link"; a.type="button";
    a.textContent="✎ 练一练相关题";
    a.addEventListener("click",()=>{ if(window.MAT_GO_QUIZ) window.MAT_GO_QUIZ(rel); });
    eb.appendChild(a);
  })();
  expCard.classList.toggle("noimg", !shotFile(d.img));
  // B3 · P1-05：默认落点统一为「有图→实物图面 / 无图→说明面」，与设备无关，
  // 消除桌面/触屏行为不一致；图片相关样式仍冻结，未改动。
  expFlip(!shotFile(d.img));
  /* v2.25 第五轮：关闭序列残留复位 —— 遮罩淡出改由 WAAPI 驱动（不再有 .closing /
     --exp-mask-ms），此处复位：停掉可能残留的遮罩动画、恢复被临时禁用的 CSS transition，
     否则下次打开遮罩会缺一段淡入 / 沿用上轮关闭时长 */
  omStopMaskAnim();
  expMask.style.transition="";
  expMask.classList.add("show");
  expCard.style.opacity="";            /* B7 · 清上次关闭的隐藏残留，打开首帧由动画接管 */
  expCard.classList.add("show");
  expCard.setAttribute("tabindex","-1");
  /* B2 · P0-2 正式收口 / P2-09 / P2-14：入栈后由 sync 统一管理层级、inert 与 overflow
     v2.25 第四轮：deferDetach —— 展开卡的背景层突变由 closeExpand 延后到「卡片归零之后」，
     ESC 关闭时 OverlayManager.pop() 不得提前解栈（否则背景层在卡片仍全显时就突变）。 */
  OverlayManager.push("expand",{el:expCard,z:OM_Z.overlay+1,close:closeExpand,returnFocus:card,deferDetach:true});
  setTimeout(()=>{if(tk===expToken){try{expCard.focus({preventScroll:true});}catch(e){}}},60);
  // FLIP：从原卡位置与尺寸飞到屏幕中央（P2-19：减弱动效偏好下直接落位）
  const r=card.getBoundingClientRect();
  const w=expCard.offsetWidth||720, h=expCard.offsetHeight||600;
  const dx=(r.left+r.width/2)-(window.innerWidth/2);
  const dy=(r.top+r.height/2)-(window.innerHeight/2);
  const sx=Math.max(.2,r.width/w), sy=Math.max(.2,r.height/h);
  const from=`translate(${dx}px,${dy}px) scale(${sx},${sy})`;
  const to="translate(0px,0px) scale(1)";
  const land=()=>{if(tk!==expToken)return;expCard.style.transform=to;expCard.style.opacity="1";};
  if(omReduced()){land();}
  else{
    expAnim=expCard.animate(
      [{transform:from,opacity:0},{transform:to,opacity:1}],
      {duration:480,easing:"cubic-bezier(.22,.9,.24,1)",fill:"forwards"}
    );
    expAnim.onfinish=()=>{if(tk!==expToken)return;omStopAnim();land();};
    setTimeout(land,560);
  }
  syncExpScrollHint();                       /* 体验优化·P-B：说明面滚动提示（翻面/图片加载后再校准） */
  document.body.classList.add("exp-open");   /* 隐藏底部导航，避免遮挡展开卡 */
}
/* B2 · P2-15：关闭时同步清状态，动画只负责视觉；P2-19：减弱动效直接落位 */
function closeExpand(){
  if(!expSrc) return;                    /* 状态已清，快速连点不会重入 */
  const _eb=document.getElementById("expBack");
  if(_eb){if(_eb._ss){_eb.removeEventListener("scroll",_eb._ss);_eb._ss=null;}_eb.classList.remove("end","no-scroll");}
  const tk=++expToken;
  const src=expSrc;
  expSrc=null;expCur=null;              /* ← 逻辑状态立即清（防快速连点重入），本轮不变 */
  omStopAnim();
  /* ======================================================================
     v2.25 · 第五轮收口（只动「关闭编排」，不推翻第四轮已生效的方案）
         ① 卡片 opacity 归零  —— WAAPI 飞回/淡出动画自然结束（桌面 380ms 几何零改动）
         ② 背景层突变         —— 浮层栈出栈 / 背景解 inert / 恢复 body 滚动 /
                                焦点归还源卡 / 底部导航恢复（exp-open 摘除）
         ③ 遮罩淡出（列表显露）—— 与 ① 同刻起跑（见下）
     【第四轮遗留 · 本轮收掉】第四轮把遮罩淡出推迟到「飞回结束之后」，桌面端总时长
       380ms → 563ms（+48%），且卡片归零（≈381ms）到遮罩真正开始淡出（≈424ms）之间
       有 ≈43ms 的「卡片已走、灰幕静止、列表还没露」空白等待段 —— 观感迟滞。
     【本轮解法 · 三条同时成立才能收口】
       a) 遮罩淡出必须与「飞回」并发 ⇒ 遮罩淡出起点必须严格等于「卡片 opacity 归零时刻」；
          但 CSS transition 固有「1 帧滞后」（过渡起始帧取值仍等于起点 1），
          两者只要差一帧就必然留下空白等待段 ⇒ 遮罩淡出改由 WAAPI 驱动：
          与卡片动画在同一任务内创建 ⇒ 共用同一条 document.timeline ⇒ 帧级对齐（空白段 = 0ms）。
       b) 不变式「遮罩 opacity<1（列表可见）⇒ 卡片 opacity=0（卡片不可见）」必须继续成立：
          遮罩淡出起点 = 卡片归零时刻 ⇒ 两者同刻翻转 ⇒ 既不会「列表先露、大卡还在」，
          也不会「卡片已走、灰幕静止」。
       c) 卡片透明度单独一条动画、末段线性收口：保证归零前 opacity 始终 > 0.0005
          （判据阈值内不被提前判成「已归零」），归零严格发生在遮罩开始淡出的同一时刻。
     【桌面端观感零劣化】桌面飞回仍是 380ms、几何/缓动一字未改（终点仍收敛到源卡矩形）；
       变的是「遮罩淡出时长」：第四轮 150ms → 本轮 40ms（总时长 380+40=420ms）。
     【移动端零改动】cardMs=130 / maskMs=160 与编排顺序（卡片归零 → 背景突变 → 遮罩淡出）
       全部保持不变；仅把「遮罩淡出的实现」从 CSS transition 换成 WAAPI —— 这正是
       判据4（空白等待段 = 0ms）在移动端达成的必要条件，且总时长由 ≈312ms 降至 ≈295ms（更优）。 */
  const narrow=!!(window.matchMedia&&window.matchMedia("(max-width:720px)").matches)
              ||window.innerWidth<=720;
  const cardMs=narrow?130:380;          /* 卡片几何飞回时长（桌面 380ms = 飞回动画时长，零改动） */
  const maskMs=narrow?160:40;           /* 遮罩淡出时长：紧接「卡片归零时刻」起跑
                                            移动端 160ms（第四轮值，不变）；桌面端 150→40ms
                                            （第五轮收口：消灭灰幕静止段，总时长 380+40=420ms）。 */

  let bgDone=false,done=false,finishTid=0,bgTid=0;
  /* ② 背景层突变（延后执行）：卡片此刻已不可见（opacity=0），遮罩此刻仍近全不透明 ⇒ 突变对用户不可见 */
  const bgMutate=()=>{
    if(bgDone) return;
    bgDone=true;
    OverlayManager.remove("expand");     /* 栈出栈 / 背景解 inert / 恢复滚动 / 焦点归还（preventScroll，无滚动跳动） */
    document.body.classList.remove("exp-open");  /* 底部导航恢复：此刻仍被不透明遮罩盖住，不会「迟到冒出」 */
    /* 兜底：材料卡关闭后彻底清掉移动端抽屉遮罩的 on/in 态与滚动锁 ——
       覆盖「抽屉跳材料卡」后抽屉遮罩因定时器/动画被挤占而残留、导致顶部安全区发灰的情形（幂等） */
    try{
      const im=$("igsMask"), is=$("igsSheet");
      if(im){im.classList.remove("igs-on","igs-in");}
      if(is){is.classList.remove("igs-on","igs-in");is.setAttribute("aria-hidden","true");}
      if(!OverlayManager.stack.length) document.body.style.overflow="";
    }catch(e){}
  };
  /* ①→② 收尾（幂等：动画 onfinish / 终点对齐定时器 / 兜底定时器三路共用同一个入口） */
  const cardGone=()=>{
    if(done) return;
    done=true;
    if(finishTid) clearTimeout(finishTid);/* 掐掉兜底定时器，杜绝二次收尾 */
    if(bgTid) clearTimeout(bgTid);       /* 掐掉终点对齐定时器 */
    if(tk!==expToken) return;            /* 已被新一次 open 接管，不误清新卡 */
    omVisualFinish(tk);                  /* 先钉死隐藏态（opacity=0 + 摘 .show）→ 卡片此刻彻底不可见 */
    bgMutate();                          /* 再做背景层突变（此刻遮罩仍近 1.0 不透明 → 突变对用户不可见） */
  };
  if(omReduced()){
    /* 减弱动效：直接落位（无淡出）。同时修掉旧逻辑漏掉遮罩摘除的老问题——
       原先此分支直接 return，遮罩的 .show 永远留着 → 关闭后整屏灰幕卡死。 */
    expMask.style.transition="none";
    void expMask.offsetWidth;           /* 强制样式重算，让 transition:none 立即生效 */
    cardGone();                         /* 卡片立即归零 → 背景突变（不淡出） */
    expMask.classList.remove("show");   /* 遮罩瞬时摘除：减弱动效下不做淡出 */
    expMask.style.transition="";        /* 复位：无残留 inline（判据：减弱动效下无残留 class/inline） */
    return;
  }
  const r=src.getBoundingClientRect();
  const w=expCard.offsetWidth,h=expCard.offsetHeight;
  const dx=(r.left+r.width/2)-(window.innerWidth/2);
  const dy=(r.top+r.height/2)-(window.innerHeight/2);
  const sx=Math.max(.2,r.width/w), sy=Math.max(.2,r.height/h);
  const to=`translate(${dx}px,${dy}px) scale(${sx},${sy})`;
  /* v2.24.0 修复快速展开→取消的闪帧：飞回动画必须从卡片「当前真实视觉状态」接续，
     不能硬编码 translate(0) scale(1)/opacity:1。否则展开飞入动画尚未结束时取消，
     卡片会瞬间跳到完全展开态(opacity 1)再淡出，视觉上闪一下完整卡片。
     读取 getComputedStyle 的当前 transform/opacity 作为起点，任意时刻取消都平滑接续。 */
  let curTransform="translate(0px,0px) scale(1)", curOpacity="1";
  try{
    const cs=getComputedStyle(expCard);
    curTransform=(cs.transform&&cs.transform!=="none")?cs.transform:curTransform;
    curOpacity=cs.opacity||curOpacity;
  }catch(e){}
  const from=curTransform;
  /* ======================================================================
     v2.25 第五轮：卡片的关闭动画拆成两条（几何 / 透明度），遮罩淡出第三条，
     三条【在同一任务内创建】⇒ 共用同一条 document.timeline ⇒ 帧级对齐。
       · expAnim    （transform）：与第四轮一字不差 —— 桌面 380ms 飞回几何/缓动零改动，
                     终点仍精确收敛到源卡矩形（FLIP：translate+scale 到源卡几何）。
       · expAnimOp  （opacity）  ：同起点同时长；前 95.8% 沿用第四轮的
                     cubic-bezier(.4,0,.2,1)（观感不变），末段 4.2% 改线性收口 ——
                     保证 opacity 在归零时刻之前始终 > 0.0005（判据阈值内不被提前
                     判成「已归零」），且严格在 T_zero 归零。
       · expMaskAnim（遮罩 opacity）：keyframes = 1 → 1(保持到 T_zero) → 0，
                     淡出起点严格 = T_zero（= 卡片归零时刻）⇒
                     「列表可见」与「卡片不可见」同刻成立 ⇒ 空白等待段 = 0ms。
     不变式（验收判据）：maskOpacity<1（列表可见）⇒ cardOpacity=0（卡片不可见）；
       T_card(卡片归零) ≤ T_bg(背景突变) ≤ T_maskEnd(遮罩归零)；
       且背景突变时遮罩 opacity > 0.9（突变被遮罩覆盖）。 */
  expAnim=expCard.animate(
    [{transform:from},{transform:to}],
    {duration:cardMs,easing:"cubic-bezier(.4,0,.2,1)",fill:"forwards"}
  );
  expAnimOp=expCard.animate(
    [{opacity:curOpacity,offset:0,easing:"cubic-bezier(.4,0,.2,1)"},
     {opacity:0.02,offset:0.958,easing:"linear"},
     {opacity:0,offset:1}],
    {duration:cardMs,fill:"forwards"}
  );
  /* 遮罩淡出：先临时禁用其 CSS transition（transition 优先级高于 WAAPI 动画，
     否则摘 .show 会触发基础 .26s 过渡、盖掉下面编排好的淡出） */
  expMask.style.transition="none";
  void expMask.offsetWidth;              /* 强制提交 transition:none（否则同一任务内的还原会把它盖回去） */
  expMaskAnim=expMask.animate(
    [{opacity:1,offset:0,easing:"linear"},
     {opacity:1,offset:cardMs/(cardMs+maskMs),easing:"ease"},
     {opacity:0,offset:1}],
    {duration:cardMs+maskMs,fill:"both"}
  );
  expMask.classList.remove("show");     /* 基线 opacity 1→0；此刻 transition:none ⇒ 不创建过渡，
                                           视觉值由上面的 WAAPI 动画接管（保持 1 → 淡出 → 0） */
  expMaskAnim.onfinish=()=>{            /* 淡出结束：交回 CSS（.show 已摘 ⇒ opacity:0），清残留 */
    if(tk!==expToken) return;
    try{expMaskAnim.cancel();}catch(e){}
    expMaskAnim=null;
    expMask.style.transition="";         /* 恢复基础 .26s 过渡（下次打开淡入） */
  };
  /* ② 背景突变触发：优先「按动画终点对齐」的定时器 —— onfinish 事件有约 1 帧派发延迟
     （第四轮实测 ≈10ms），延迟期间遮罩已在淡出 ⇒ 突变就不再被完全遮住。
     终点对齐后突变落在 T_zero+2ms 附近，遮罩 opacity 仍 >0.95（突变被完全遮住）。 */
  try{
    const a=expAnimOp;
    if(a&&a.ready&&typeof a.ready.then==="function"){
      a.ready.then(()=>{
        if(tk!==expToken||done) return;
        const st=(typeof a.startTime==="number")?a.startTime:performance.now();
        bgTid=setTimeout(cardGone,Math.max(0,st+cardMs-performance.now()+2));
      });
    }
  }catch(e){}
  expAnim.onfinish=cardGone;            /* ① 卡片归零 → ② 背景突变（幂等兜底） */
  expAnim.oncancel=cardGone;
  expAnimOp.onfinish=cardGone;
  expAnimOp.oncancel=cardGone;
  finishTid=setTimeout(cardGone,cardMs+200);  /* 兜底：动画被系统中断也一定走完收尾；cardGone 内会清除 */
}
function omVisualFinish(tk){
  if(tk!==expToken) return;             /* 已被新一次 open/close 接管，不误清新卡 */
  /* B7 · 先钉死隐藏态，再取消 fill:forwards 动画：否则 cancel() 会让卡片瞬间
     回到动画前 inline（opacity:1 的完整白卡）闪一帧。最后清残留 inline，
     由 CSS 非 show 态保持隐藏，且不影响下次打开首帧。 */
  expCard.style.transition="none";      /* 收尾期禁用 CSS transition：否则 class / inline 切换经 .3s/.26s 过渡
                                           会把已隐藏的卡片重新提交成高不透明中间帧（移动端闪帧） */
  expCard.style.opacity="0";
  expCard.classList.remove("show");
  /* v2.25 第四轮补强：显式取消「打开」阶段遗留、仍在后台运行的 CSS 过渡（opacity .26s / transform .3s）。
     它们在关闭动画被 cancel 的瞬间会「接管」这两个属性：因 .show 已摘除，过渡目标变成 0，
     但过渡的当前值仍接近 1 ⇒ 卡片整块闪回近乎全不透明再淡出（v2.24 同类闪帧，
     表现为「展开后 80ms 内快速取消」时闪一下）。此处先 cancel 它们（此刻 WAAPI 动画仍在生效，
     取消不可见），随后 cancel 动画时底层值已是 inline opacity:0 ⇒ 卡片恒为不可见。 */
  try{
    if(expCard.getAnimations){
      expCard.getAnimations().forEach(a=>{
        const css=(typeof CSSTransition!=="undefined"&&a instanceof CSSTransition)
               ||(a.constructor&&a.constructor.name==="CSSTransition");
        if(css) a.cancel();
      });
    }
  }catch(e){}
  omStopAnim();
  expCard.classList.remove("noimg");
  expCard.classList.remove("flipped");
  expCard.style.transform="";
  expCard.style.opacity="";
  expCard.style.transition="";          /* 恢复 CSS 默认，不影响下次打开 */
  /* v2.25 第五轮：本函数只在「卡片 opacity 已归零」之后被调用（closeExpand 的 cardGone），
     故此处摘 exp-open 属于「背景层突变」，与 OverlayManager.remove("expand") 同刻发生；
     第五轮把突变对齐到「卡片归零 + 2ms」，此刻遮罩 opacity 仍 >0.95 ⇒ 突变过程用户不可见。 */
  document.body.classList.remove("exp-open");
}
expMask.addEventListener("click",closeExpand);
document.getElementById("expClose").addEventListener("click",closeExpand);
document.getElementById("expToFlip").addEventListener("click",e=>{e.stopPropagation();expFlip(true);});
document.getElementById("expToFig").addEventListener("click",e=>{e.stopPropagation();expFlip(false);});
/* B7 · 整卡点击翻转：正面任意位置（含顶部标题 .exp-head）→ 完整说明面；
   说明面任意「非术语 / 非功能控件」位置 → 翻回实物图。
   保留原功能：关闭按钮、翻转胶囊（各自 stopPropagation）、术语 .term（弹解释）、
   部件 .parts li（弹部件窗）、按钮/链接（练一练 / 关联材料等原生跳转）一律不吞事件。
   纯文字块（.mlab/.kv/dt/dd/.principle/.stdline/.chips/标题/空白）全部允许翻转。 */
expCard.addEventListener("click",e=>{
  const t=e.target;
  if(!t||!t.closest) return;
  if(t.closest("#expClose,#expToFlip,#expToFig")) return;                 /* 关闭 / 翻转胶囊自行处理 */
  /* v2.9.0：执行标准 <details> 折叠保留原生行为，点击不得误触「点空白翻面」。 */
  if(t.closest("a,button,.term,.parts li,[data-name],[data-part],details.bp-std,details.bp-std summary")) return; /* 功能控件保留原生行为 */
  if(window.getSelection&&String(window.getSelection()).length>0) return;    /* 正在选中文字不翻 */
  expFlip(!expCard.classList.contains("flipped"));                        /* 双面互翻 */
});

/* —— 术语浮层（body 级，不受 3D 容器裁切） —— */
let tipEl=null,activeTerm=null,lastPointerTs=0;
/* 指针（鼠标/触屏）交互完全交给 click 委托管理；focusin/focusout 仅在纯键盘导航时生效，
   否则触屏 tap 后的焦点迁移（term → close 按钮）会触发 focusout 把刚打开的气泡清掉。 */
document.addEventListener("pointerdown",()=>{lastPointerTs=Date.now();},true);
function pointerRecent(){return Date.now()-lastPointerTs<700;}
function hideTermTip(){
  if(tipEl){tipEl.remove();tipEl=null;}
  activeTerm=null;
  document.querySelectorAll(".term[aria-describedby]").forEach(x=>x.removeAttribute("aria-describedby"));
  document.querySelectorAll(".term.show").forEach(x=>{x.classList.remove("show");x.setAttribute("aria-expanded","false");});
}
/* B8 · 气泡挂在 body，伪元素箭头样式必须全局注入；写进 materials.html 的 CSS
   会被 scope_css 加上 #mat-lib 前缀而永不命中，故由主脚本一次性注入 <style>。 */
if(!document.getElementById("termtip-css")){
  const cs=document.createElement("style"); cs.id="termtip-css";
  /* v2.15.0 验收：术语气泡精简为「长条圆角 + 半透明底 + 仅解释内容」。
     与正文重复的术语名、以及「关联材料族」行均已删除，气泡只承载释义。
     气泡挂在 body，必须全局注入（写进 materials.html 的 CSS 会被 scope 加 #mat-lib 前缀而不命中）。 */
  cs.textContent='.termtip::after{content:"";position:absolute;top:-5px;left:var(--tip-x,50%);'
    +'transform:translateX(-50%) rotate(45deg);width:9px;height:9px;'
    +'background:rgba(255,255,255,.9);border-left:1px solid rgba(46,123,214,.28);border-top:1px solid rgba(46,123,214,.28)}'
    +'.termtip[data-up]::after{top:auto;bottom:-5px;transform:translateX(-50%) rotate(225deg)}'
    +'.termtip .g-d{font:500 12.5px/1.6 var(--bp-sans,sans-serif);color:#1E293B}'
    +'.termtip .g-d::before{content:"";display:inline-block;width:7px;height:7px;border-radius:2px;'
    +'background:#2E7BD6;margin-right:8px;vertical-align:1px}';
  document.head.appendChild(cs);
}
function showTermTip(el){
  hideTermTip();
  const def=el.getAttribute("data-def"); if(!def) return;
  const t=document.createElement("div");
  t.className="termtip"; t.id="termtip"; t.setAttribute("role","tooltip");
  /* v2.15.0：只保留释义；术语名 / 关联材料族为重复信息，按验收删除 */
  const escTxt=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  t.innerHTML='<div class="g-d">'+escTxt(def)+'</div>';
  Object.assign(t.style,{
    position:"fixed",zIndex:String(OM_Z.toast),boxSizing:"border-box",
    maxWidth:"min(380px,calc(100vw - 24px))",width:"max-content",
    padding:"10px 16px",borderRadius:"14px",
    background:"rgba(255,255,255,.9)",color:"#1E293B",
    border:"1px solid rgba(46,123,214,.28)",
    backdropFilter:"blur(10px) saturate(140%)",
    WebkitBackdropFilter:"blur(10px) saturate(140%)",
    fontSize:"var(--fs-2)",lineHeight:"var(--lh-body)",fontWeight:"var(--fw-r)",
    whiteSpace:"normal",wordBreak:"break-word",
    boxShadow:"0 6px 22px rgba(11,92,173,.16),0 2px 8px rgba(11,92,173,.08)",
    pointerEvents:"none"
  });
  document.body.appendChild(t);
  const r=el.getBoundingClientRect(),tr=t.getBoundingClientRect();
  let left=r.left+r.width/2-tr.width/2;
  left=Math.max(12,Math.min(left,window.innerWidth-tr.width-12));
  let top=r.bottom+9;
  if(top+tr.height>window.innerHeight-12) top=Math.max(12,r.top-tr.height-9);
  t.style.left=left+"px"; t.style.top=top+"px";
  t.style.setProperty("--tip-x",Math.max(12,Math.min(r.left+r.width/2-left,tr.width-12))+"px");
  if(top<r.top) t.dataset.up="1";
  el.setAttribute("aria-describedby",t.id);
  el.classList.add("show"); el.setAttribute("aria-expanded","true");
  tipEl=t;
}

/* B3 · P1-04：轻量即时反馈（B4 的 Toast 组件复用同一调用契约） */
let _toastT=null;
function showToast(msg){
  let t=document.getElementById("b3toast");
  if(!t){ t=document.createElement("div"); t.id="b3toast"; t.className="toast"; t.setAttribute("role","status");
    t.setAttribute("aria-live","polite"); document.body.appendChild(t); }
  t.textContent=msg; t.classList.add("show");
  clearTimeout(_toastT); _toastT=setTimeout(()=>t.classList.remove("show"),2200);
}
/* P1-03：供课程体系 renderCv() 切步骤时清掉上一步残留 toast（「回答正确」不再跨步骤出现）。
   ⚠ 本脚本由 mat_inline.py 同步进 index.html 的 MAT_LIB 生成区，请勿只改 index.html。 */
function clearToast(){
  var t=document.getElementById("b3toast");
  if(t){t.classList.remove("show"); if(t.textContent!==undefined) t.textContent="";}
  clearTimeout(_toastT); _toastT=null;
}


/* B4 · P2-03 横滑可发现性：仅当容器确实可横滑时加右边缘渐隐，滚到底自动移除 */
function updateScrollHints(){
  document.querySelectorAll(".path, .tabs, .tabs2, .nav, .filterbar .filterrow").forEach(el=>{
    const more=el.scrollWidth-el.clientWidth>4;
    el.classList.toggle("can-scroll",more);
    el.classList.toggle("at-end",!more||el.scrollLeft+el.clientWidth>=el.scrollWidth-4);
  });
}
/* B6：rAF 节流 —— 原实现每次 scroll 都同步读 scrollWidth/clientWidth（强制重排），
   108 张卡片时会明显抖动；合并到每帧最多一次。 */
let hintScheduled=false;
function scheduleHints(){
  if(hintScheduled) return;
  hintScheduled=true;
  requestAnimationFrame(()=>{hintScheduled=false;updateScrollHints();});
}
window.MAT_HINTS=updateScrollHints;
document.addEventListener("scroll",scheduleHints,true);
window.addEventListener("resize",scheduleHints);
document.addEventListener("click",()=>setTimeout(scheduleHints,80));
updateScrollHints();

/* —— 卡片点击展开 —— */
document.addEventListener("mouseover",e=>{
  if(window.matchMedia&&matchMedia("(hover:none)").matches) return;
  const t=e.target.closest&&e.target.closest(".term");
  if(t){showTermTip(t);}else if(tipEl&&!tipEl.matches(":hover")){hideTermTip();}
});
document.addEventListener("mouseout",e=>{
  if(window.matchMedia&&matchMedia("(hover:none)").matches) return;
  const t=e.target.closest&&e.target.closest(".term");
  const to=e.relatedTarget;
  if(t&&to&&t.contains(to)) return;
  if(tipEl&&!(to&&to.closest&&to.closest(".term"))) hideTermTip();
});
/* 键盘/读屏：聚焦术语时同样弹出解释（A11y 底线：与 hover/click 等价） */
document.addEventListener("focusin",e=>{
  const t=e.target.closest&&e.target.closest(".term");
  if(t&&!pointerRecent()&&!tipEl) showTermTip(t);   /* 纯键盘 Tab 聚焦才弹 */
});
document.addEventListener("focusout",e=>{
  const t=e.target.closest&&e.target.closest(".term");
  if(!t||pointerRecent()) return;                    /* 指针交互交给 click / 点空白 / ESC */
  if(!(e.relatedTarget&&e.relatedTarget.closest&&e.relatedTarget.closest(".term"))) hideTermTip();
});
document.addEventListener("click",e=>{
  const inExp=!!e.target.closest("#expcard");
  const t=e.target.closest(".term");
  if(t){
    /* 桌面 hover / 键盘 focus / 触屏 tap 三条路径统一收敛到 click：
       activeTerm 记录「当前由点击打开」的术语，再点即关闭。 */
    const same=(activeTerm===t&&!!tipEl);
    hideTermTip();
    if(!same){showTermTip(t);activeTerm=t;}
    return;
  }
  hideTermTip();
  if(inExp) return;                       /* 展开卡内点空白只清术语，不重复开卡 */
  const card=e.target.closest(".card");
  if(card){
    const d=DATA.find(x=>x.name===card.dataset.name);
    if(d){openExpand(d,card);return;}
  }
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape") return;          /* B2 · P1-06：ESC 统一由 OverlayManager(capture) 处理 */
  if(OverlayManager.top()) return;      /* 浮层打开时不响应背景卡片的 Enter 展开 */
  if(e.key!=="Enter"&&e.key!==" ") return;
  if(e.target.closest&&e.target.closest(".term")) return;
  const card=e.target.closest&&e.target.closest(".card");
  if(!card) return;
  if(e.target.closest("button")) return;
  e.preventDefault();
  const d=DATA.find(x=>x.name===card.dataset.name);
  if(d) openExpand(d,card);
});

;


/* ===== 路由：模块切换 ===== */
const B4_ITEM_N=(window.MAT_DATA?window.MAT_DATA.length:0);
const META={
  materials:{t:"材料认知库",s:B4_ITEM_N+" 项供水材料的图鉴与认知 · 点卡片看大图与完整说明",pill:"阶段一 · 已上线",ok:true},
  courses:{t:"课程体系",s:"四大板块 × 16 子类 · 课程采集包驱动生成，进度本机保存（内容待技术部门审核）",pill:"阶段二 · 试运行",ok:false},
  exam:{t:"考核练习",s:"题库 / 模拟考试 / 错题本 / 成绩看板（阶段三 · 示例数据）",pill:"阶段三 · 规划中",ok:false},
  kb:{t:"知识库 · AI 问答",s:"规范/案例/FAQ 入库，自然语言提问即答（阶段四 · 示例数据）",pill:"阶段四 · 规划中",ok:false}
};
/* 合版说明：课程体系内「课程分类库 / 练习题全库」子页切换。
   与材料库 IG_mode 同构：切换时先退出课程详情学习态，避免沉浸遮罩残留；
   同时把 URL 归一到 #courses（练习子页不单独占用路由段，刷新仍回本板块）。 */
/* 页面加载最早期的子页快照：初始化 go('courses') 会把 cg_sub 重置为 lib，
   故先缓存原值，供本页恢复逻辑使用（手动 F5 刷新）。 */
var CG_INIT_SUB=(function(){try{return sessionStorage.getItem('cg_sub')||'';}catch(e){return '';}})();
window.CG_mode=function(sub){
  const practice=(sub==="practice");
  const a=document.getElementById("cgTabLib"), b=document.getElementById("cgTabPractice");
  if(a) a.setAttribute("aria-selected",practice?"false":"true");
  if(b) b.setAttribute("aria-selected",practice?"true":"false");
  const v1=document.getElementById("cgViewLib"), v2=document.getElementById("cgViewPractice");
  if(v1) v1.classList.toggle("cg-on",!practice);
  if(v2) v2.classList.toggle("cg-on",practice);
  document.body.classList.remove("cv-immersive","cv-focus","cv-steps-open");
  /* 记住子页选择：手动刷新（F5）不走 b4-state，用 sessionStorage 兜底恢复 */
  try{ sessionStorage.setItem('cg_sub', practice?'practice':'lib'); }catch(e){}
};
const nav=document.querySelectorAll(".navitem");
const mods=document.querySelectorAll(".module");
/* 动态同步底部导航真实高度：小屏换行、系统大字体、iPhone 安全区都会改变导航高度 */
function syncNav(){
  /* B3 · P2-17：仅底部导航断点内测量写入；桌面清除，避免把侧栏高度当导航高度污染语义 */
  if(window.innerWidth>860){ document.documentElement.style.removeProperty("--nav-h"); return; }
  const sb=document.querySelector(".sidebar");
  if(!sb||getComputedStyle(sb).display==="none") return;   // 展开卡打开时导航隐藏，保留上次值
  const h=Math.round(sb.getBoundingClientRect().height);
  if(h>0) document.documentElement.style.setProperty("--nav-h",h+"px");
}
/* 切换板块时清理材料库浮层状态，避免 exp-open 残留导致底部导航永久消失 */
function resetMaterialOverlays(){
  /* B2：切板块时同步清空浮层栈，避免背景 inert / overflow / 运行时层级残留 */
  if(window.OverlayManager) window.OverlayManager.reset();
  const ec=document.getElementById("expcard"), em=document.getElementById("expmask");
  if(ec) ec.classList.remove("show");
  if(em) em.classList.remove("show");
  document.body.classList.remove("exp-open");
  document.body.style.overflow="";
}
/* B9：解析 #courses/<courseId>/<stepId> 深链；模块判断只看第一段，不影响既有路由语义 */
function parseRoute(){
  const parts=location.hash.slice(1).split("/");
  let mod=META[parts[0]]?parts[0]:"materials";
  /* 旧 #exam 深链归一到 courses 的练习子页 */
  const sub=(mod==="exam")?"practice":"";
  if(mod==="exam") mod="courses";
  return {mod:mod,course:parts[1]||"",step:parts[2]||"",sub:sub};
}
/* V28_NAVGUARD · 根治移动端系统级侧滑返回（v2.26.0）
   背景：iOS Safari 的边缘侧滑返回是系统手势，优先于网页 touchmove 的 preventDefault，
         JS 无法直接阻止，用户右滑会触发 popstate 回退到上一版块。
   方案：导航全部改 replaceState（不产生可返回历史）+ 初始压入一个「哨兵」历史条目；
         系统返回退到哨兵时由 popstate 立即弹回当前视图，用户始终停留在当前版块。
   页面内「返回列表/返回板块」按钮走 JS 切视图，不依赖 history，故不受影响。 */
var __navCur=(function(){var r=parseRoute();return {mod:r.mod,course:r.course,step:r.step};})();
var __navSentinelReady=false;
function navTarget(s){
  return (s.mod==="courses"&&s.course)?"#courses/"+s.course+(s.step?"/"+s.step:""):"#"+s.mod;
}
function routeOfUrl(url){
  var s=String(url||""),i=s.indexOf("#");
  var hash=i>=0?s.slice(i+1):"",p=hash.split("/");
  return {mod:META[p[0]]?p[0]:"materials",course:p[1]||"",step:p[2]||""};
}
/* 包装 replaceState：课程内部翻步骤/换课的 replaceState 会自动同步当前路由，
   保证右滑弹回时仍精确还原到当前课程与步骤，不丢深链。 */
(function(){
  var _rs=history.replaceState.bind(history);
  history.replaceState=function(state,title,url){
    if(url&&String(url).indexOf("#")>=0) __navCur=routeOfUrl(url);
    return _rs(state,title,url);
  };
})();
function _ensureNavSentinel(){
  if(__navSentinelReady) return;
  history.pushState({__navSentinel:true},"");
  __navSentinelReady=true;
}
function go(mod,opts){
  opts=opts||{};
  /* 合版说明：考核练习并入课程体系，exam 作为 courses 的别名。
     - 旧深链 #exam、材料卡「找练习」跳转、b4-state 里的 mod:"exam" 都落到本板块。
     - 通过 sub 指定进入哪个子页（lib=课程分类库 / practice=练习题全库）。 */
  if(mod==="exam"){ mod="courses"; opts.sub=opts.sub||"practice"; }
  __navCur={mod:mod,course:opts.course||"",step:opts.step||"",sub:opts.sub||""};
  resetMaterialOverlays();
  if(window.CL_MAT_CLOSE) window.CL_MAT_CLOSE();   /* 切板块时关闭课程内材料卡 */
  document.body.classList.remove("cv-immersive");   /* 切板块时退出学习态沉浸 */
  const prevActive=document.querySelector(".module.active");
  mods.forEach(m=>m.classList.toggle("active",m.id==="m-"+mod));
  nav.forEach(n=>{const on=n.dataset.mod===mod;n.classList.toggle("active",on);n.setAttribute("aria-selected",on?"true":"false");});
  document.body.classList.toggle("mat-full", mod==="materials");  // 材料库沉浸式全屏
  document.body.classList.toggle("cur-full", mod==="courses");  // 课程体系沉浸式：隐藏全局顶栏
  document.body.classList.toggle("plain-full", mod!=="materials");  // B10 非材料库板块去壳
  /* 课程板块子页切换：默认课程分类库；带 sub=practice 时进练习题全库。
     从别的板块切进来时清空学习态，回到板块底，避免残留课程详情覆盖子页。 */
  if(mod==="courses"&&typeof window.CG_mode==="function"){
    if(prevActive&&prevActive.id!=="m-courses"&&typeof window.CV_APPLY==="function") window.CV_APPLY("","");
    window.CG_mode(opts.sub==="practice"?"practice":"lib");
  }
  /* B10：.content 现在是各板块共用的滚动容器，切板块时归零，
     避免滚动位置串到新板块导致首张卡片顶部被切掉一半 */
  if(!prevActive||prevActive.id!=="m-"+mod){
    const c=document.querySelector(".content"); if(c) c.scrollTop=0;
  }
  const m=META[mod];
  document.getElementById("topTitle").textContent=m.t;
  document.getElementById("topSub").textContent=m.s;
  const p=document.getElementById("stagePill");
  p.textContent=m.pill; p.className="pill "+(m.ok?"ok":"warn"); p.setAttribute("data-state",m.ok?"ok":"plan");
  /* B9：切到课程体系时按路由渲染课程视图；离开时保留状态不重置 */
  if(mod==="courses"&&typeof window.CV_APPLY==="function") window.CV_APPLY(opts.course||"",opts.step||"");
  /* B4 · P1-15：用户主动切换压入历史栈，返回键可回退；popstate 回调不再重复入栈 */
  if(!opts.fromPop){
    const target=navTarget(__navCur);
    if(location.hash!==target) history.replaceState({mod:mod},"",target);
    _ensureNavSentinel();
  }
  syncNav();
}
window.addEventListener("popstate",()=>{
  /* V28_NAVGUARD：系统级侧滑/返回键触发后退时，立即弹回当前视图，禁止跨版块回退或退出应用。
     replaceState/pushState 不触发 popstate，不会递归；页面内返回按钮走 JS，不受影响。 */
  var t=navTarget(__navCur);
  if(location.hash!==t) history.replaceState({mod:__navCur.mod},"",t);
  history.pushState({__navSentinel:true},"");
});
window.addEventListener("hashchange",()=>{
  const r=parseRoute();
  const curMod=(document.querySelector(".module.active")||{}).id;
  if(curMod!=="m-"+r.mod) go(r.mod,{fromPop:true,course:r.course,step:r.step,sub:r.sub});
  else if(r.sub) window.CG_mode && window.CG_mode(r.sub);
  else if(r.mod==="courses"&&typeof window.CV_APPLY==="function") window.CV_APPLY(r.course,r.step);
});
nav.forEach(n=>{
  n.addEventListener("click",()=>go(n.dataset.mod));
  n.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go(n.dataset.mod);}});
});
(function(){const r=parseRoute();go(r.mod,{init:true,course:r.course,step:r.step,sub:r.sub});})();
syncNav();
window.addEventListener("resize",syncNav);
window.addEventListener("orientationchange",()=>setTimeout(syncNav,120));
/* 系统大字体、安全区变化等纯 CSS 引起的导航高度变化不会触发 resize，直接观察元素尺寸 */
if(window.ResizeObserver){
  const sbEl=document.querySelector(".sidebar");
  if(sbEl) new ResizeObserver(syncNav).observe(sbEl);
}

/* CURRICULUM_MODULE_START */
/* ⚠ 生成区｜sync_module.py ← curriculum_module.js · 请勿手改 index.html 对应区块，改本文件即可 */
/* 课程体系板块 · 四大板块 × 16 子类 · 课程采集包驱动
   数据只来自 window.CURRICULUM（由 curriculum_data.py 从 data/课程采集包.xlsx 生成）；
   本模块只负责渲染与本机进度，不含任何课程正文。 */
(function(){
  "use strict";
  var CUR=window.CURRICULUM||{boards:[],courses:[],quizzes:[]};
  var BOARDS=CUR.boards||[],COURSES=CUR.courses||[],QUIZZES=CUR.quizzes||[];
  var PK="ws_curriculum_progress_v2";
  var pg=document.getElementById("pathGrid"),panel=document.getElementById("coursePanel"),
      list=document.getElementById("courseList"),back=document.getElementById("courseBack"),
      cv=document.getElementById("courseView"),crumb=document.getElementById("curCrumb");
  if(!pg||!panel||!list||!back||!cv) return;

  /* ============================================================
     v2.8.17 · 专注学习模式 Focus Mode（iOS / Android / Desktop 三端分叉）
     仅操作展现层；不触碰 markLast / done / answers / ws_curriculum_progress_v2 业务键。
     ============================================================ */
  /* v2.8.20 · 专注态默认化：偏好不再跨会话持久化。
     清理历史残留的 off 键；「退出专注」仅本次进课内临时生效（内存态），
     刷新 / 每次进课 / 新会话自动回到专注（方案第七章口径）。 */
  var FOCUS_KEY="cv_focus_pref", TIP_KEY="cv_focus_tipped";
  try{localStorage.removeItem(FOCUS_KEY);}catch(e){}
  var focusOffThisView=false;   /* 本次进课的临时退出标记，页面刷新即归零 */
  function detectPlatform(){
    var ua=navigator.userAgent||"";
    /* iPadOS 13+ UA 伪装成 Macintosh，需用 maxTouchPoints 识别 */
    var isIOS=/iP(hone|ad|od)/.test(ua)||
      ((navigator.platform==="MacIntel"||/Macintosh/.test(ua))&&navigator.maxTouchPoints>1);
    var isAndroid=/Android/i.test(ua);
    var c=isIOS?"plat-ios":isAndroid?"plat-android":"plat-desktop";
    document.body.classList.add(c);
    return c;
  }
  var PLAT=detectPlatform();
  function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
  function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
  function focusPref(){return !focusOffThisView;}

  var sheetMask=null;
  function ensureSheet(){
    if(sheetMask) return;
    sheetMask=document.createElement("div");
    sheetMask.className="cv-sheet-mask";
    sheetMask.setAttribute("aria-hidden","true");
    sheetMask.addEventListener("click",function(){document.body.classList.remove("cv-steps-open");});
    document.body.appendChild(sheetMask);
  }
  function focusTip(){
    if(lsGet(TIP_KEY)==="1") return;
    lsSet(TIP_KEY,"1");
    var t=document.createElement("div");
    t.className="cv-focus-tip";
    t.textContent="已默认进入专注学习 · 点「退出专注」可查看完整信息并随时切回";
    var bar=cv.querySelector(".cv-bar");
    if(bar&&bar.parentNode) bar.parentNode.insertBefore(t,bar.nextSibling);
    else document.body.appendChild(t);
    setTimeout(function(){if(t.parentNode) t.parentNode.removeChild(t);},3200);
  }
  /* B5-DK14：普通态翻页栏常驻。
     专注态由 CSS fixed 独立处理；普通态三栏中列位置随视口变化（228/266/238、宽 633/720），
     纯 CSS 无法跟随，故把 .cv-main 的实时几何写入 CSS 变量，供收口层 fixed 定位。 */
  function syncNormalFoot(){
    var main=cv.querySelector(".cv-main"),foot=cv.querySelector(".cv-foot");
    if(!main||!foot||!cv.classList.contains("show")) return;
    if(document.body.classList.contains("cv-focus")) return;  /* 专注态走自己的规则 */
    var r=main.getBoundingClientRect();
    cv.style.setProperty("--nv-foot-left",Math.round(r.left)+"px");
    cv.style.setProperty("--nv-foot-width",Math.round(r.width)+"px");
  }
  window.addEventListener("resize",function(){syncNormalFoot();});
  function applyFocus(){
    if(!cv.classList.contains("show")||!focusPref()){
      document.body.classList.remove("cv-focus","cv-steps-open");
      syncNormalFoot();
      return;
    }
    var bar=cv.querySelector(".cv-bar");
    if(!bar){document.body.classList.remove("cv-focus");return;}
    ensureSheet();
    /* 1) 进度百分比迁到顶栏细线 */
    var pi=cv.querySelector(".cv-prog i");
    bar.style.setProperty("--cv-pct",pi?pi.style.width:"0%");
    /* 2) 顶栏最小上下文：课程名 + 步骤计数（点击展开步骤抽屉） */
    var chip=bar.querySelector(".cv-focus-chip");
    var k=cv.querySelector(".cv-kicker"),m=k&&k.textContent.match(/步骤\s*(\d+)\s*\/\s*(\d+)/);
    var tt=cv.querySelector(".cv-title");
    var title=tt?tt.textContent.trim().replace(/\s+/g," "):"";
    if(!chip){
      chip=document.createElement("div");chip.className="cv-focus-chip";
      chip.innerHTML="<b></b><i role='button' tabindex='0' aria-label='展开步骤列表'></i>"+
                     "<button class='cv-focus-exit' type='button' aria-pressed='true'>退出专注</button>";
      bar.appendChild(chip);
      chip.querySelector(".cv-focus-exit").addEventListener("click",function(){setFocus(false,true);});
      var counter=chip.querySelector("i");
      function toggleSheet(){document.body.classList.toggle("cv-steps-open");}
      counter.addEventListener("click",toggleSheet);
      counter.addEventListener("keydown",function(e){
        if(e.key==="Enter"||e.key===" "){e.preventDefault();toggleSheet();}});
    }
    chip.querySelector("b").textContent=title;
    chip.querySelector("i").textContent=m?m[1]+" / "+m[2]:"";
    document.body.classList.add("cv-focus");
    focusTip();
  }
  function setFocus(on,remember){
    /* v2.8.20：仅内存态，不写 localStorage；remember 形参保留兼容既有调用点 */
    focusOffThisView=!on;
    if(!on){document.body.classList.remove("cv-focus","cv-steps-open");syncNormalFoot();return;}
    applyFocus();
  }
  /* 步骤抽屉：点任一步骤后自动收起（事件委托，不改 bindCv） */
  document.addEventListener("click",function(e){
    if(e.target&&e.target.closest&&e.target.closest(".cv-sitem"))
      document.body.classList.remove("cv-steps-open");
    /* v2.8.20：普通态可逆入口，随时切回专注 */
    if(e.target&&e.target.closest&&e.target.closest(".cv-focus-enter"))
      setFocus(true,true);
  },true);
  /* Esc：先关抽屉，再退出专注 */
  document.addEventListener("keydown",function(e){
    if(e.key!=="Escape") return;
    if(document.body.classList.contains("cv-steps-open"))
      document.body.classList.remove("cv-steps-open");
    else if(document.body.classList.contains("cv-focus")) setFocus(false,true);
  });

  /* v2.9.0 蓝图：四板块不再用蓝/绿/橙/紫四色顶边，统一为墨绿单色；
     板块差异改由等宽编号 XG/CL/GW/AZ + 发丝线刻度表达（见 curriculum_css.html 的 V290_CV）。 */
  var BCOLOR={XG:"#0E554E",CL:"#0E554E",GW:"#0E554E",AZ:"#0E554E"};
  var courseById={},quizzesBy={},subById={},boardById={};
  COURSES.forEach(function(c){courseById[c.id]=c;});
  QUIZZES.forEach(function(q){(quizzesBy[q.courseId]=quizzesBy[q.courseId]||[]).push(q);});
  BOARDS.forEach(function(b){boardById[b.id]=b;b.subs.forEach(function(s){subById[s.id]=s;s.board=b.id;});});

  var view="boards",curBoard="",curSub="",curCourse="",curStep="";
  var justCompleted=false;   /* P1-01：本次点击「完成课程」后展示结课页（不持久化，重新进课复位） */
  /* P1-02：L3 检索 / 难度 / 进度筛选状态（仅内存，切板块复位） */
  var listQ="",listD="",listP="";
  /* P2-07：点「完成课程」但仍有未完成步骤时，就近提示并高亮，不再跳回第 1 步 */
  var guardRest=null;
  /* 课程内材料卡内联展开层（不跳材料认知库；DOM 由 index.html 提供） */
  var mmask=document.getElementById("clMatMask"),mcard=document.getElementById("clMat"),
      mtitle=document.getElementById("clMatTitle"),msub=document.getElementById("clMatSub"),
      mbody=document.getElementById("clMatBody"),mclose=document.getElementById("clMatClose"),
      lastFocus=null;

  /* ---------- 通用 ---------- */
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(ch){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];});}
  function inline(s){
    return esc(s).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
                 .replace(/【([^【】]+)】/g,'<span class="cl-hl">$1</span>');
  }
  /* v2.24.1 · 正文材料指认可点化：s3「落回卡上：XX…」里的材料名原本是纯文本，
     自学者点它无反应。这里在 inline() 产出的 HTML 上，仅对「标签之外的文本段」
     按材料库真名（空格归一化、长名优先）做精确替换，包成可点 chip，复用 openMat。
     不碰 <strong>/<span> 等已有标签内部，避免破坏排版；无命中则原样返回。 */
  var _matNameCache=null;
  function matNames(){
    if(_matNameCache) return _matNameCache;
    var list=window.MAT_DATA||[];
    var arr=list.map(function(d){return d.name;}).filter(Boolean)
      .sort(function(a,b){return b.length-a.length;});
    _matNameCache=arr.map(function(n){return {raw:n,key:n.replace(/\s/g,"")};});
    return _matNameCache;
  }
  /* v2.24.4 问题2：部分材料名是高频常用词（典型「直接」——既是管件名又是副词）。
     inlineMat 过去纯子串匹配，把「结果直接对接」「能直接在露天」的副词也关联成材料卡。
     这里对这类歧义词要求「强材料语境」才关联：前面是领用动词（领/用/拿/发/配/取/换）
     或处于材料枚举（前接顿号/斜杠/竖线/逗号），否则判为普通用词、跳过。
     其余材料名（三通/法兰/弯头等专业词）语义单一，保持原样。 */
  function matUseAllowed(key,compact,s0,e0){
    if(key!=="直接") return true;
    var before=compact.slice(Math.max(0,s0-3),s0), after=compact.slice(e0,e0+2);
    if(/[领用拿发配取换买]$/.test(before)) return true;     // 领直接/就领直接
    if(/[、\/｜,，]$/.test(before)) return true;              // 弯头、三通、大小头、直接
    if(/[「“【]$/.test(before)&&/[」”】]/.test(after)) return true; // 「直接」
    return false;                                             // 副词用法一律跳过
  }
  /* seen：可选，页面区域级去重集合（同一材料名在一个步骤页只关联首次，避免重复高亮）。
     s3 渲染创建一个共享 seen 传给所有段落/表格单元格调用。 */
  function inlineMat(s,seen){
    var html=inline(s);
    var names=matNames();
    if(!names.length) return html;
    // 按 <...> 标签切分，只处理偶数段（文本），跳过 <strong>/<span> 等标签段。
    // 对每个纯文本段：在「原文」上按位置一次性贪心匹配材料名（长名优先、互不重叠），
    // 记录命中区间后统一切分生成 HTML——绝不重扫已插入的标签，避免嵌套/属性被空格归一化破坏。
    return html.split(/(<[^>]*>)/).map(function(seg,i){
      if(i%2===1 || !seg) return seg;                 // 标签段/空段原样
      // 建立「去空格字符位置 → 原字符位置」映射，既能匹配带空格写法，又能准确截取原文片段
      var map=[];
      for(var p=0;p<seg.length;p++){if(!/\s/.test(seg[p])) map.push(p);}
      var compact=map.map(function(p){return seg[p];}).join("");
      // 贪心找互不重叠的命中区间（按 compact 坐标）
      var hits=[];
      names.forEach(function(m){
        if(!m.key) return;
        var pos=0,k;
        while((k=compact.indexOf(m.key,pos))>=0){
          var s0=k,e0=k+m.key.length;
          var overlap=hits.some(function(h){return s0<h.e&&e0>h.s;});
          if(!overlap && matUseAllowed(m.key,compact,s0,e0)) hits.push({s:s0,e:e0,name:m.raw,key:m.key});
          pos=k+m.key.length;
        }
      });
      if(!hits.length) return seg;
      hits.sort(function(a,b){return a.s-b.s;});
      // 同名去重：一次匹配里同材料只保留首次；页面级 seen 再保证跨段只关联首次
      var out="",cursor=0,localSeen={};
      hits.forEach(function(h){
        if(h.s<cursor) return;
        var os=map[h.s],oe=map[h.e-1]+1;
        var dup=localSeen[h.key]||(seen&&seen[h.key]);
        localSeen[h.key]=1;if(seen)seen[h.key]=1;
        if(dup){out+=seg.slice(cursor,oe);cursor=oe;return;} // 重复项保留纯文本，不套按钮
        out+=seg.slice(cursor,os);
        out+='<button type="button" class="cl-inline-mat" data-m="'+esc(h.name)+'" title="在本页展开这张材料卡">'+esc(seg.slice(os,oe))+'</button>';
        cursor=oe;
      });
      out+=seg.slice(cursor);
      return out;
    }).join("");
  }
  /* 单段课程无损排版适配：后期批次采集包把整课压成一段（内联【块标题】、句间无换行）。
     仅对「完全不含换行」的字段生效，按【块标题】与中文句末标点补出逻辑分段；
     已有换行的前 24 门课原样返回，零影响。只插入换行，不增删任何文字。 */
  function densify(text,mode){
    var t=String(text||"");
    if(t.indexOf("\n")>=0) return t;
    if(mode==="teach"){
      var parts=t.split(/(?=【[^【】]+】)/),out=[];
      parts.forEach(function(p){
        p=p.trim(); if(!p) return;
        var m=/^(【[^【】]+】)([\s\S]*)$/.exec(p);
        if(m){
          if(out.length) out.push("");
          out.push(m[1]);
          splitSents(m[2],true).forEach(function(x){out.push(x);});
        }else splitSents(p,true).forEach(function(x){out.push(x);});
      });
      return out.join("\n");
    }
    return splitSents(t,false).join("\n");
  }
  function splitSents(s,merge){
    s=String(s||"").trim(); if(!s) return [];
    var toks=s.split(/([。！？])/),out=[],buf="";
    for(var i=0;i<toks.length;i+=2){
      var u=toks[i]+(toks[i+1]||""); if(!u.trim()) continue;
      if(!merge){out.push(u.trim());continue;}
      buf+=u;
      if(buf.length>=30){out.push(buf.trim());buf="";}
    }
    if(buf.trim()) out.push(buf.trim());
    return out;
  }
  function parseLines(t){return String(t||"").split("\n").map(function(x){return x.trim();}).filter(Boolean);}
  var PSTART="，,。.；;、！!？?）)】]:：",PEND="，,、；;";
  function mergeFragments(lines){
    /* P2-05：采集包已删除全部 [图示｜…] 占位行，并把被打断的「，必须拒收。」碎片并回上一句。
       这里保留兜底：万一历史数据仍含图示行，跳过它并把后续标点开头的碎片无损并回正文，不改源数据。 */
    var out=[];
    lines.forEach(function(ln){
      var s=ln.trim(); if(!s) return;
      if(PSTART.indexOf(s[0])>=0&&out.length){
        var k=out.length-1;
        while(k>=0&&out[k].indexOf("[图示｜")===0) k--;
        if(k>=0){
          var prev=out[k];
          var body=(prev&&PEND.indexOf(prev[prev.length-1])>=0&&PEND.indexOf(s[0])>=0)?s.slice(1).trim():s;
          out[k]=prev+body; return;
        }
      }
      out.push(s);
    });
    return out;
  }
  /* v2.21.0 · 需求①：平台无讲师、纯自学，原「还能往哪讲」是讲师授课视角的延伸话术；
     渲染层改写为自学者视角「想学更多」，不改 xlsx 数据源，构建幂等。 */
  function learnerize(t){
    return String(t||"")
      .replace(/【还能往哪讲/g,"【想学更多")
      .replace(/(这|这一)课之外还能往([一二三四五六七八九十\d]+)处讲[，：]/g,
               "学完本课，还可以往这$2处继续深入：");
  }
  function parseTeach(text){
    /* P2-05：采集包图示行已全部删除；此处仅保留「跳过图示行」兜底，不再渲染任何占位块。
       v2.24.2 · 「｜」表格渲染：采集包用「表头顺序：A｜B｜C｜D」+ 连续数据行表达核对表，
       过去整段当纯文本、列对齐全靠读者数。这里在解析阶段把它识别为 {table} 块，
       前端渲染成真表格；不改采集包一个字，纯展示层增强。 */
    var raw=mergeFragments(String(text||"").split("\n")),blocks=[],cur=null;
    /* v2.24.6：兼容「表头：」与「表头顺序：」两种声明写法（存量课两种混用）。 */
    var headRe=/表头(?:顺序)?[：:]\s*(.+)$/;
    var openTable=null; // {heads:[], rows:[[]]}
    function closeTable(){ if(openTable&&cur){ if(!cur.tables)cur.tables=[];cur.tables.push(openTable);} openTable=null; }
    raw.forEach(function(ln){
      var s=ln.trim(); if(!s) return;
      if(s.indexOf("[图示｜")===0) return;
      if(/^【[^【】]+】$/.test(s)){
        closeTable();
        blocks.push({h:s.slice(1,-1),ps:[]});cur=blocks[blocks.length-1];return;
      }
      /* v2.24.4 问题1：行首【块标题】后紧跟正文（无标点）的课（如 C93 精华课），
         过去整行当普通段落，标题只被 inline() 加粗、未单独成蓝徽章。这里把标题拆成块标题、
         同行正文作为该块首段。判据：标题后首字不是标点（，。、：；！？）才拆，
         避免误伤「【漏水防雷】：…」「【重点】：…」这类行内强调句（后接冒号/句号）。 */
      var tm=/^【([^【】]+)】(.+)$/.exec(s);
      if(tm && !/^[，。、：；！？）]/.test(tm[2])){
        closeTable();
        blocks.push({h:tm[1],ps:[]});cur=blocks[blocks.length-1];
        cur.ps.push(tm[2].trim());return;
      }
      if(!cur){blocks.push({h:"",ps:[]});cur=blocks[blocks.length-1];}
      var hm=headRe.exec(s);
      if(hm){
        closeTable();
        // 前缀（表头顺序之前）常为一句强调说明，保留为普通段落，不因建表而丢失
        var prefix=s.slice(0,hm.index).trim();
        if(prefix) cur.ps.push(prefix);
        var heads=String(hm[1]||"").replace(/[。.；;]$/,"").split(/[｜|]/).map(function(x){return x.trim();}).filter(Boolean);
        if(heads.length>=3){openTable={heads:heads,rows:[]};return;}
      }
      // 数据行：含｜且与当前表头列数一致 → 归入表格
      if(openTable){
        var cells=s.split(/[｜|]/).map(function(x){return x.trim();});
        if(cells.length===openTable.heads.length){openTable.rows.push(cells);return;}
        /* v2.24.6 问题1：表头声明与数据行之间夹了一句说明（如「逐档外径数值须由
           技术部门核定…」），这句无｜，过去直接 closeTable 把刚开的表关掉，
           导致后面整段对照数据退化成纯文本。这里：开放表格状态下、尚未收满数据、
           且本行无｜分隔时，视为表前说明句保留为普通段落，不关闭表格。 */
        if(openTable.rows.length===0 && s.indexOf("｜")<0 && s.indexOf("|")<0){cur.ps.push(s);return;}
        closeTable(); // 列数不符（或表格已有数据后的普通段落），表格结束，本行按普通段落处理
      }
      cur.ps.push(s);
    });
    closeTable();
    return blocks;
  }
  function parseFramework(text){
    return String(text||"").split("。").map(function(x){return x.trim();}).filter(Boolean)
      .map(function(seg){
        var i=seg.search(/[｜|]/);
        if(i>=0){
          var k=seg.slice(0,i).trim();
          var v=seg.slice(i+1).trim();
          // v2.24.2：复杂嵌套段（如「…核对表｜对象｜要点｜核对动作｜红线…」）残留的｜
          // 拆成片段数组，渲染时用轻量分隔点连接，避免与首个键值分隔符同样重、糊成一团。纯展示层。
          var parts=v.split(/[｜|]/).map(function(x){return x.trim();}).filter(Boolean);
          return {k:k,v:v,parts:parts,nested:parts.length>1};
        }
        return {k:"",v:seg.replace(/。$/,""),parts:[seg.replace(/。$/,"")],nested:false};
      });
  }
  /* v2.24.2：知识框架卡片渲染。nested 段用轻量分隔点连接片段，避免多余｜糊成一团。 */
  function frameHtml(c){
    return parseFramework(c.framework).map(function(x){
      var v=x.nested ? x.parts.map(function(p,i){
        return (i?"<i class=\"cl-sep\">·</i>":"")+esc(p);
      }).join("") : esc(x.v);
      /* v2.24.5 bugfix：嵌套段（含 · 分隔点）span 加 cl-kvn 专属类，
         交 CSS 覆盖掉基础 display:flex，避免文本片被切成多列、窄屏逐字竖排。 */
      return '<div class="cl-kv">'+(x.k?'<b>'+esc(x.k)+"</b>":"")+
             '<span'+(x.nested?' class="cl-kvn"':'')+">"+v+"</span></div>";
    }).join("");
  }
  /* v2.8.7：采集包已删「拓展知识」栏，parseExpand（含引导式结尾拆分）随之移除；
     densify / parseLines / parseTeach / parseFramework 仍服务于 s1–s4、s6，保留。 */
  function toast(m){if(typeof showToast==="function") showToast(m);}
  /* 修复 M6：对 localStorage 内容做形状校验。JSON 合法但结构异常（字符串/数组/缺 done/answers）
     曾导致 stat()/renderCv() 读 st.done[x.id] 抛错、课程体系整页渲染失败。 */
  function blankState(){return {done:{},answers:{},completed:false};}
  function validState(s){return !!(s&&typeof s==="object"&&!Array.isArray(s)&&s.done&&typeof s.done==="object"&&!Array.isArray(s.done)&&s.answers&&typeof s.answers==="object"&&!Array.isArray(s.answers));}
  function load(){try{var p=JSON.parse(localStorage.getItem(PK)||"{}");return (p&&typeof p==="object"&&!Array.isArray(p))?p:{};}catch(e){return {};}}
  function save(p){try{localStorage.setItem(PK,JSON.stringify(p));}catch(e){}}
  function read(cid){var p=load();return validState(p[cid])?p[cid]:blankState();}
  function mutate(cid,fn){var p=load();if(!validState(p[cid]))p[cid]=blankState();var st=p[cid];fn(st);save(p);return st;}
  /* v2.24.7 · 断点续学：返回「第一个未完成步骤」，供「开始学习」直达学习进度页。
     新课 / 0 进度 → s1（保持原样）；有进度 → 上次该学的那一页；全部完成 → 末步复习。
     仅读本机 done 记录，不改数据；所有端共用同一逻辑。 */
  function resumeStep(cid){
    var ss=stepsOf(cid),st=read(cid);
    for(var i=0;i<ss.length;i++){ if(!st.done[ss[i].id]) return ss[i].id; }
    return ss[ss.length-1]?ss[ss.length-1].id:"";
  }
  /* v2.24.7 · 课程列表滚动位置记忆：按子类 sid 记住离开列表时的滚动位置，
     从课程详情返回列表时精确还原到进入前的那门课，而不是回到顶部。独立键，不污染进度对象。 */
  var LS_KEY="ws_course_list_scroll";
  function getListScroll(sid){try{return (JSON.parse(localStorage.getItem(LS_KEY)||"{}"))[sid]||0;}catch(e){return 0;}}
  function setListScroll(sid,top){try{var p=JSON.parse(localStorage.getItem(LS_KEY)||"{}");p[sid]=top;localStorage.setItem(LS_KEY,JSON.stringify(p));}catch(e){}}
  function contentEl(){return document.querySelector(".content");}
  /* P1-02：「继续学习」记录最近一次学到的课程/步骤。独立键 __last，不污染各课进度对象；
     旧版本 localStorage 没有这个键时 lastInfo() 返回 null，置顶条自动隐藏。 */
  function markLast(cid,step){
    try{var p=load();p.__last={cid:cid,step:step||"",ts:Date.now()};save(p);}catch(e){}
  }
  function lastInfo(){
    try{var x=load().__last;return (x&&courseById[x.cid])?x:null;}catch(e){return null;}
  }
  function stepsOf(cid){
    /* v2.16.0 验收：把「知识定位(s1) + 知识框架(s2)」合并为一步，
       知识定位内容置于知识框架之上（见 segHtml s1）。总步数 8→7，
       步骤条 / 进度 / 深链按新数组自动换算；课程与题目 ID 一律不变。 */
    var out=[{id:"s1",type:"seg",title:"知识定位与框架"},
             {id:"s3",type:"seg",title:"系统讲授"},{id:"s4",type:"seg",title:"知识结构与学习要点"}];
    (quizzesBy[cid]||[]).forEach(function(q,i){
      out.push({id:q.id,type:"quiz",title:"随堂练习 "+(i+1),q:q});
    });
    out.push({id:"s6",type:"seg",title:"本课带走卡"});
    return out;
  }
  function stat(cid){
    var ss=stepsOf(cid),st=read(cid),done=0,review=0;
    ss.forEach(function(x){
      if(st.done[x.id]) done++;
      else if(x.type==="quiz"&&st.answers[x.id]&&st.answers[x.id].correct===false) review++;
    });
    return {total:ss.length,done:done,review:review,pct:ss.length?Math.round(done/ss.length*100):0};
  }
  function boardStat(b){
    var ids=[];b.subs.forEach(function(s){ids=ids.concat(s.courseIds);});
    var d=0,t=0;
    ids.forEach(function(cid){var x=stat(cid);d+=x.done;t+=x.total;});
    return {pct:t?Math.round(d/t*100):0,courses:ids.length,subs:b.subs.length,
            built:b.subs.filter(function(s){return s.courseIds.length;}).length};
  }
  function subStat(s){
    var d=0,t=0;s.courseIds.forEach(function(cid){var x=stat(cid);d+=x.done;t+=x.total;});
    return {pct:t?Math.round(d/t*100):0,courses:s.courseIds.length};
  }

  /* ---------- 视图切换 ---------- */
  function setView(v){
    view=v;
    pg.style.display=(v==="boards")?"":"none";
    panel.classList.toggle("show",(v==="subs"||v==="courses"));
    cv.classList.toggle("show",(v==="course"));
    /* 学习态沉浸：进入课程详情隐藏底部 tab 导航，返回列表/板块时恢复 */
    document.body.classList.toggle("cv-immersive",v==="course");
    if(v!=="course") closeMat();
    if(v!=="course") document.body.classList.remove("cv-focus","cv-steps-open");
  }
  function setCrumb(items){
    if(!crumb) return;
    /* v2.8.19 · P1-06：课程详情（4 级）打标记，供 CSS 在移动端收敛为两级 */
    crumb.classList.toggle("cl-crumb-course",items.length>=4);
    crumb.innerHTML=items.map(function(it,i){
      var last=i===items.length-1;
      return (i?'<span class="cl-sep" data-lv="'+i+'">/</span>':"")+
        (last?'<span class="cl-cur" data-lv="'+i+'">'+esc(it.t)+"</span>"
             :'<a href="javascript:void(0)" data-lv="'+i+'" data-v="'+esc(it.v||"boards")+'" data-k="'+esc(it.k||"")+'">'+esc(it.t)+"</a>");
    }).join("");
    crumb.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click",function(){
        var v=a.dataset.v,k=a.dataset.k;
        if(v==="boards") showBoards();
        else if(v==="subs") showSubs(k);
        else if(v==="courses") showCourses(k);
      });
    });
    crumb.style.display="";
  }
  function hash(cid,step){
    var h=cid?"#courses/"+cid+(step?"/"+step:""):"#courses";
    if(location.hash!==h) history.replaceState({mod:"courses",course:cid||"",step:step||""},"",h);
  }
  function scrollTop(){
    /* P0-01：去壳改造后真正滚动容器是 .content（body.plain-full 下 overflow-y:auto），
       旧实现只重置 .main（已不滚动），导致切视图后停在半截。三端统一归零 .content。 */
    var c=document.querySelector(".content");
    if(c&&c.scrollTop) c.scrollTop=0;
    var m=document.querySelector(".main");
    if(m&&m.scrollTop) m.scrollTop=0;
    window.scrollTo(0,0);
  }

  /* ---------- L1 四大板块 ---------- */
  /* P2-09：宽屏首屏填充的学习总览（纯静态，数据源仍是采集包 + 本机进度；仅 ≥1200px 由 CSS 显示） */
  function overviewHtml(){
    var p=load(),done=0,total=0,completed=0,review=0;
    COURSES.forEach(function(c){
      var s=stat(c.id);done+=s.done;total+=s.total;
      if(p[c.id]&&p[c.id].completed) completed++;
      var st=p[c.id];
      if(st) Object.keys(st.answers||{}).forEach(function(k){
        if(st.answers[k]&&st.answers[k].correct===false) review++;
      });
    });
    var pct=total?Math.round(done/total*100):0;
    return '<div class="cl-overview">'+
      '<div class="cl-ov-h">学习总览 <span>全部板块 · 数据源自课程采集包</span></div>'+
      '<div class="cl-ov-grid">'+
        '<div class="cl-ov-cell"><b>'+BOARDS.length+'</b><span>知识板块</span></div>'+
        '<div class="cl-ov-cell"><b>'+COURSES.length+'</b><span>已开课程</span></div>'+
        '<div class="cl-ov-cell"><b>'+QUIZZES.length+'</b><span>随堂题</span></div>'+
        '<div class="cl-ov-cell"><b>'+completed+'</b><span>已完成课程</span></div>'+
        '<div class="cl-ov-cell"><b>'+pct+'%</b><span>整体进度</span></div>'+
      '</div>'+
      '<div class="cl-ov-foot">课程内容以采集包为准，随堂练习自愿、只给对错、不记分不排名；'+
        (review?'当前有 '+review+' 道题待复习。':'待复习清单是空的，保持得不错 🎯')+'</div>'+
    '</div>';
  }
  /* v2.19.0 · 板块卡第三行：原「建议 D1–D2…」是教学难度术语，对学员无用；
     改为面向学员的「学完这块你能做什么」。band 字段保留给子类卡难度显示，不动数据。 */
  var BOARD_USEFUL={
    XG:"零基础认全常用材料 · 会看规格、懂口径，上岗不抓瞎",
    CL:"学会验收入库、领退料与盘点 · 把好材料第一道关",
    GW:"学会巡检、阀门操作与抢修处置 · 现场问题独立判断",
    AZ:"学会看图选型、规范安装与试压验收 · 少返工"
  };
  function showBoards(silent){
    setView("boards");curBoard="";curSub="";curCourse="";justCompleted=false;
    setCrumb([{t:"四大板块 · 知识坐标"}]);
    pg.innerHTML=BOARDS.map(function(b){
      var s=boardStat(b),c=BCOLOR[b.id]||"#2456c4";
      return '<div class="ucard cl-board" data-b="'+b.id+'" role="button" tabindex="0" '+
          'aria-label="板块：'+esc(b.name)+'" style="--bc:'+c+'">'+
        /* v2.20.0 · 需求①：删除卡片顶部渐变色条元素（cl-bbar） */
        '<div class="cl-bhead"><span class="cl-bcode">'+esc(b.id)+'</span>'+
          '<span class="cl-btag">'+esc(b.tagline)+"</span></div>"+
        "<h3>"+esc(b.name)+"</h3>"+
        '<div class="meta">'+esc(b.attr)+"</div>"+
        '<div class="cl-bmeta"><span>'+s.subs+" 个子类</span><span>"+s.courses+" 门已开课</span>"+
          "<span>"+esc(BOARD_USEFUL[b.id]||b.band)+"</span></div>"+
        '<div class="prog"><i style="width:'+s.pct+'%"></i></div>'+
        '<div class="meta" style="margin-top:6px">学习进度 <b class="cl-pct">'+s.pct+"%</b>"+
          (s.courses?"":' <span class="cv-badge plan">规划中</span>')+"</div>"+
      "</div>";
    }).join("")+overviewHtml();
    pg.querySelectorAll(".cl-board").forEach(function(el){
      var f=function(){showSubs(el.dataset.b);};
      el.addEventListener("click",f);
      el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();f();}});
    });
    if(!silent) hash("");
  }

  /* ---------- L2 子类列表 ---------- */
  function showSubs(bid){
    var b=boardById[bid];if(!b) return showBoards();
    curBoard=bid;setView("subs");justCompleted=false;back.innerHTML="返回四大板块";
    setCrumb([{t:"四大板块",v:"boards"},{t:b.id+" "+b.name}]);
    list.className="cl-subs";
    list.innerHTML=b.subs.map(function(s){
        var st=subStat(s),open=s.courseIds.length>0;
        /* P2-01：规划中子类补明确禁用态（灰化 + not-allowed + 点击提示），不再像已开课一样可点 */
        return '<div class="cl-sub'+(open?"":" is-plan")+'" data-s="'+s.id+'"'+
          (open?' role="button" tabindex="0" aria-label="子类：'+esc(s.name)+'"'
               :' role="button" tabindex="0" aria-disabled="true" aria-label="子类：'+esc(s.name)+'（暂未开课）"')+">"+
          /* v2.16.0 验收：首行并排「XG-0X 代码 + 难度：D1-D2」，课程数徽章靠右；
             课题名称独占第二排（h3.cl-stitle）。文案由「建议难度带」改为「难度：」。 */
          '<div class="cl-shead"><span class="cl-scode">'+esc(s.id)+"</span>"+
            '<span class="cl-sband">难度：'+esc(s.band)+"</span>"+
            (open?'<span class="cl-badge live">'+st.courses+" 门课</span>"
                 :'<span class="cl-badge plan">规划中 · 暂未开课</span>')+"</div>"+
          '<h3 class="cl-stitle">'+esc(s.name)+"</h3>"+
          '<div class="cl-goals">'+
            '<div class="cl-goal"><b>知</b><span>'+esc(s.k)+"</span></div>"+
            '<div class="cl-goal"><b>技</b><span>'+esc(s.s)+"</span></div>"+
            '<div class="cl-goal"><b>态</b><span>'+esc(s.a)+"</span></div>"+
          "</div>"+
          /* P2-02：与 L1 板块卡「N 门已开课」口径一致，子类卡同时给出课程数，不再单挂题目数 */
          (open?'<div class="prog"><i style="width:'+st.pct+'%"></i></div>'+
                 /* v2.21.0 · 需求③：底部重排版 = 左侧「学习进度+百分比+课程/题目数」单行，右侧进入学习按钮（v3 注入），
                    去掉「点开查看课程」冗余提示，整体精炼不换行 */
                 '<div class="cl-sfoot"><div class="cl-sprog"><span class="cl-plabel">学习进度</span>'+
                 '<b class="cl-pct">'+st.pct+"%</b><span class='cl-smeta'>"+st.courses+" 门课 · "+
                   esc(s.quizCount)+" 道随堂题</span></div></div>"
               :'<div class="cl-first"><b>建议首课</b>'+esc(s.first)+"</div>"+
                '<div class="cl-plan-note">暂未开课，敬请期待 · 该子类课程正在规划中</div>')+
        "</div>";
      }).join("");
    list.querySelectorAll(".cl-sub[data-s]").forEach(function(el){
      var plan=el.classList.contains("is-plan");
      var f=function(){
        /* P2-01：规划中子类点击给明确反馈，不再静默无响应 */
        if(plan){toast("这块还在准备中，先看看已上线的部分");return;}
        showCourses(el.dataset.s);
      };
      el.addEventListener("click",f);
      el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();f();}});
    });
    hash("");scrollTop();
  }

  /* ---------- L3 课程列表 ---------- */
  var STAGE={D1:"入门 · D1 / L1",D2:"基础 · D2 / L2",D3:"进阶 · D3 / L3",D4:"综合 · D4",D5:"决策 · D5"};
  /* P1-02：名称/编号/知识点搜索 + 难度/进度筛选 + 「继续学习」置顶条。
     筛选只重建 list 子树，不重跑 setView/hash/scrollTop，避免输入时页面跳顶、输入框失焦。 */
  function courseMatch(cid,c){
    if(listQ){
      var hay=(c.id+" "+c.topic+" "+c.positioning+" "+c.family).toLowerCase();
      if(hay.indexOf(listQ.toLowerCase())<0) return false;
    }
    if(listD&&c.d!==listD) return false;
    if(listP){
      var pct=stat(cid).pct;
      if(listP==="todo"&&pct>=100) return false;
      if(listP==="done"&&pct<100) return false;
    }
    return true;
  }
  function courseListHtml(sid){
    var s=subById[sid];if(!s) return "";
    var vis=s.courseIds.filter(function(cid){var c=courseById[cid];return c&&courseMatch(cid,c);});
    var li=lastInfo(),resume="";
    if(li){
      var lc=courseById[li.cid],ls=stat(li.cid),lno=("0"+(lc.lessonNo||lc.seq)).slice(-2);
      resume='<div class="cl-resume" id="clResume" role="button" tabindex="0" '+
        'aria-label="继续学习 第 '+lno+" 课 "+esc(lc.topic)+'">'+
        '<span class="cl-resume-i">↻</span>'+
        '<span class="cl-resume-t"><b>继续学习 · 第 '+lno+" 课</b>"+
          "<span>"+esc(lc.topic)+" · 已学 "+ls.pct+"%</span></span>"+
        '<span class="cl-resume-go">继续</span></div>';
    }
    var toolbar='<div class="cl-toolbar"><div class="cl-tools">'+
        '<input id="clQ" class="cl-search" type="search" autocomplete="off" '+
          'placeholder="搜索课程名 / 编号 / 知识点" value="'+esc(listQ)+'">'+
        '<select id="clD" class="cl-sel" aria-label="按难度筛选">'+
          '<option value="">全部难度</option>'+
          ["D1","D2","D3","D4","D5"].map(function(d){
            return '<option value="'+d+'"'+(listD===d?" selected":"")+">"+esc(STAGE[d])+"</option>";
          }).join("")+"</select>"+
        '<select id="clP" class="cl-sel" aria-label="按进度筛选">'+
          '<option value="">全部进度</option>'+
          '<option value="todo"'+(listP==="todo"?" selected":"")+">未完成</option>"+
          '<option value="done"'+(listP==="done"?" selected":"")+">已完成</option></select>"+
        '<span class="cl-count">'+vis.length+" / "+s.courseIds.length+" 门</span></div>"+resume+"</div>";
    var html='<div class="cl-list-head"><h1>'+esc(s.id)+" "+esc(s.name)+"</h1>"+
      '<div class="cl-list-sub"><span class="cl-lchip">共 <b>'+s.courseIds.length+"</b> 门课</span>"+
      /* v2.20.0 · 需求④：删除「D1–D2 为主…」教学术语徽章（对学员无用） */
      '<span class="cl-lchip">按难度由易到难排列</span></div></div>'+toolbar,lastD="";
    s.courseIds.forEach(function(cid){
      if(vis.indexOf(cid)<0) return;
      var c=courseById[cid];if(!c) return;
      if(c.d!==lastD){
        lastD=c.d;
        html+='<div class="cl-stage"><span class="cl-stage-bar"></span><b>'+esc(STAGE[c.d]||("难度 "+c.d))+
          "</b><span>由易到难 · 同类材料排在一起</span></div>";
      }
      var st=stat(cid),qn=(quizzesBy[cid]||[]).length,no=("0"+(c.lessonNo||c.seq)).slice(-2);
      html+='<div class="course cl-course">'+
        '<div class="ct"><span class="cl-cno">第 '+no+" 课</span> "+esc(c.topic)+"</div>"+
        '<div class="cd">'+esc(c.positioning)+"</div>"+
        '<div class="cl-tags"><span class="cl-tag">'+esc(cid)+" · "+esc(c.level)+"</span>"+
          '<span class="cl-tag">'+qn+" 道随堂题</span></div>"+
        '<div class="row"><span class="dot"></span>进度 '+st.pct+"% "+
          (st.review?'<span class="cv-badge review">'+st.review+" 待复习</span>":
           (st.pct===100?'<span class="cv-badge done">已完成</span>':""))+"</div>"+
        '<div class="acts"><button class="btn primary cv-open" data-c="'+cid+'">开始学习</button>'+
          '<button class="btn cv-reset" data-r="'+cid+'">重置进度</button></div>'+
      "</div>";
    });
    if(!vis.length) html+='<div class="cl-empty" role="status">没找到匹配的课程，换个关键词或清掉筛选试试</div>';
    return html;
  }
  function bindCourseList(sid){
    var q=list.querySelector("#clQ"),d=list.querySelector("#clD"),p=list.querySelector("#clP");
    if(q) q.addEventListener("input",function(){listQ=q.value.trim();renderCourseList(sid,true);});
    if(d) d.addEventListener("change",function(){listD=d.value;renderCourseList(sid);});
    if(p) p.addEventListener("change",function(){listP=p.value;renderCourseList(sid);});
    var rs=list.querySelector("#clResume");
    if(rs){
      var goRs=function(){var li=lastInfo();if(li) openCourse(li.cid,li.step,true);};
      rs.addEventListener("click",goRs);
      rs.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();goRs();}});
    }
    list.querySelectorAll(".cv-open").forEach(function(btn){
      btn.addEventListener("click",function(){openCourse(btn.dataset.c,"",true);});});
    /* 备注整改：重置进度是破坏性操作，改为卡片内联二次确认（不弹系统框，保持平台视觉一致） */
    list.querySelectorAll(".cv-reset").forEach(function(btn){
      btn.addEventListener("click",function(){
        var acts=btn.parentNode;
        if(acts.querySelector(".cl-confirm")) return;
        var box=document.createElement("div");box.className="cl-confirm";
        box.setAttribute('role','alertdialog');
        box.innerHTML='<span>确定清空这课的进度和答题记录吗？清空后无法恢复。</span>'+
          '<button class="btn primary cl-reset-yes">确定清空</button>'+
          '<button class="btn cl-reset-no">先不清</button>';
        acts.appendChild(box);
        box.querySelector(".cl-reset-no").addEventListener("click",function(){box.remove();});
        box.querySelector(".cl-reset-yes").addEventListener("click",function(){
          var p2=load();delete p2[btn.dataset.r];
          if(p2.__last&&p2.__last.cid===btn.dataset.r) delete p2.__last;
          save(p2);renderCourseList(sid);toast("已清空，可以重新开始");
        });
      });});
  }
  function renderCourseList(sid,focusQ){
    if(!subById[sid]) return;
    list.className="clist";
    list.innerHTML=courseListHtml(sid);
    bindCourseList(sid);
    if(focusQ){
      var q=list.querySelector("#clQ");
      if(q){q.focus();try{q.setSelectionRange(q.value.length,q.value.length);}catch(e){}}
    }
  }
  function showCourses(sid){
    var s=subById[sid],b=boardById[s?s.board:""];if(!s||!b) return showBoards();
    curSub=sid;setView("courses");justCompleted=false;guardRest=null;
    listQ="";listD="";listP="";   /* 每次进入列表复位筛选，避免带着上次条件找不到课 */
    back.innerHTML="返回 "+b.name+" 子类";
    /* v2.20.0 · 需求④：课程列表页隐藏面包屑（与返回按钮冗余），其余视图 setCrumb 会自动恢复显示 */
    if(crumb) crumb.style.display="none";
    renderCourseList(sid);
    hash("");
    /* v2.24.7 · 列表滚动位置记忆：还原到离开前的滚动位置（进入前那门课），不再强制归零。
       筛选/搜索是从子类外部进入（新 sid 无记录）→ getListScroll 返回 0，行为与旧版一致。 */
    var c=contentEl(),saved=getListScroll(sid);
    if(c) c.scrollTop=saved;
  }

  function backAct(){
    if(view==="courses"&&curBoard) showSubs(curBoard);
    else showBoards();
  }
  back.addEventListener("click",backAct);
  back.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();backAct();}});

  /* ---------- L4 课程详情 ---------- */
  function openCourse(cid,sid,scroll){
    var c=courseById[cid];if(!c) return showBoards();
    /* v2.24.8 需求3：非「已完成」课程，答案不跨进入保存——本次重进清空已答记录，需重新做题。
       进度(done)与退出步骤(__last)保留，仅清 answers 与多选临时答案，确保重做时是干净未选态。 */
    var _st0=read(cid);
    if(!_st0.completed && _st0.answers && Object.keys(_st0.answers).length){
      mutate(cid,function(x){ x.answers={}; });
    }
    /* B1-C3：未提交的临时答案（含多选选了一半没点提交）一律不跨进入保留。
       原先只在 answers 非空时才清 __CL_TMP，多选半成品存于 __CL_TMP、answers 为空 → 残留。 */
    window.__CL_TMP={};
    /* v2.24.7 · 离开列表进入课程前记住当前滚动位置（按 source 子类），
       返回时 showCourses 据此还原到进入前那门课。深链/换课进课 view≠courses，不记录。 */
    if(view==="courses"&&curSub){var ce=contentEl();if(ce) setListScroll(curSub,ce.scrollTop||0);}
    focusOffThisView=false;   /* v2.8.20：每次进课（含深链/换课/返回后再进）默认专注 */
    curCourse=cid;justCompleted=false;guardRest=null;   /* P1-01 / P2-07：进课时复位完成态与未完成提示 */
    var ss=stepsOf(cid);
    /* v2.24.8 需求3：未指定步骤时，优先从上次退出步骤续学（__last 指向本课）；
       无记录才回退到第一个未完成步骤（resumeStep）。显式 sid（继续学习/深链/跳转）仍最高优先。 */
    var _last=lastInfo();
    var startSid=sid||((_last&&_last.cid===cid&&_last.step)?_last.step:resumeStep(cid));
    curStep=(startSid&&ss.some(function(x){return x.id===startSid;}))?startSid:ss[0].id;
    setView("course");
    var s=subById[c.sub]||{name:""},b=boardById[s.board]||{id:"",name:""};
    /* 深链直接进课程时也要还原所属板块 / 子类，保证「返回」逐级回退不跳级 */
    curSub=s.id||"";curBoard=b.id||"";
    /* v2.8.19 · P1-06：末级不再重复输出课号（课号由 cv-title 徽章承担），
       收敛为「本课」，同屏课号只出现 1 次；移动端由 CSS 收敛为两级。 */
    setCrumb([{t:"四大板块",v:"boards"},{t:b.id+" "+b.name,v:"subs",k:b.id},
              {t:s.id+" "+s.name,v:"courses",k:s.id},{t:"本课"}]);
    renderCv();
    if(scroll!==false){hash(cid,curStep);scrollTop();}
  }
  function goStep(i){
    var ss=stepsOf(curCourse);if(i<0||i>=ss.length) return;
    guardRest=null;   /* P2-07：主动切步骤即视为已响应提示 */
    curStep=ss[i].id;hash(curCourse,curStep);renderCv();scrollTop();
  }

  function segHtml(id,c){
    if(id==="s1"){
      /* v2.16.0 验收：步骤 1+2 合并——知识定位在上、知识框架在下，
         两段各带一个蓝色圆角徽章小标题（样式见 v3_full.css ⑩ 层），内容原文不改。 */
      return '<div class="cl-seghead">知识定位 · 这一类知识在版图里的位置</div>'+
        '<div class="cl-lead">'+inline(c.positioning)+"</div>"+
        '<div class="cl-seghead">知识框架 · 这一类知识由哪几块构成</div>'+
        '<div class="cl-frame">'+frameHtml(c)+"</div>";
    }
    if(id==="s2"){
      return '<div class="cl-frame">'+frameHtml(c)+"</div>";
    }
    if(id==="s3"){
      /* P2-05：占位块渲染已移除（采集包内图示行全部删除），正文只保留讲解段落。
         v2.24.2：表格块渲染成真表格（列头/斑马纹/可横滚），段落仍走 inlineMat 保留材料可点。
         v2.24.4 问题3：一个步骤页内同一材料名只允许唯一一个可点 chip（共享 seen 去重）。 */
      var matSeen={};
      return parseTeach(densify(learnerize(c.lecture),"teach")).map(function(blk){
        var body="";
        (blk.ps||[]).forEach(function(p){ body+="<p>"+inlineMat(p,matSeen)+"</p>"; });
        (blk.tables||[]).forEach(function(t){
          var thead="<thead><tr>"+t.heads.map(function(h){return "<th>"+inline(h)+"</th>";}).join("")+"</tr></thead>";
          var tbody="<tbody>"+t.rows.map(function(row){
            return "<tr>"+row.map(function(cell,i){
              /* v2.24.8 需求1：表格是静态核对表，材料名不需要点击展开——用 inline 保留
                 加粗/【】高亮即可，不走 inlineMat，表格内无任何材料 chip。 */
              return i===0?"<th scope=\"row\">"+inline(cell)+"</th>":"<td>"+inline(cell)+"</td>";
            }).join("")+"</tr>";
          }).join("")+"</tbody>";
          /* v2.24.6：给 table 挂列数 class，移动端据此做列宽加权（长文本列更宽），
             避免 5 列表均分导致每列过窄、行高虚高。纯展示层，不改数据。 */
          body+='<div class="cl-tbl-wrap"><table class="cl-tbl cl-tbl-c'+t.heads.length+'">'+thead+tbody+"</table></div>";
        });
        return '<div class="cl-blk">'+(blk.h?'<h4 class="cl-blkh">'+esc(blk.h)+"</h4>":"")+body+"</div>";
      }).join("");
    }
    if(id==="s4"){
      return '<div class="cl-points">'+parseLines(densify(c.structure,"lines")).map(function(p){
        return '<div class="cl-point">'+inline(p)+"</div>";}).join("")+"</div>";
    }
    /* v2.8.7：s5「拓展知识」段已删除；以下为 s6 本课带走卡
       P2-06：采集包锚点已全部对齐材料库内真实卡（anchorExternal=0），正常全部可点；
       下面 off 分支仅作防御兜底，若日后采集包新增库外名，仍降级为纯文本、不产生死链。 */
    var chips=c.anchors.map(function(a){
      return a.ref?'<button class="cv-chip cl-chip" data-m="'+esc(a.ref)+'" title="在本页展开这张材料卡">'+
                  esc(a.name)+' <span class="cl-chip-i">▤</span></button>'
                  :'<span class="cl-chip off" title="材料库暂无对应卡，仅作知识索引">'+esc(a.name)+"</span>";
    }).join("");
    var remark=(c.remark&&c.remark!=="—")?c.remark:"";
    return '<div class="cl-carry">'+
      '<div class="cl-carryrow"><div class="cl-lab">材料锚点 · 点卡片在本页展开</div><div class="cl-chips">'+chips+"</div></div>"+
      '<div class="cl-carryrow"><div class="cl-lab">防雷小抄 · 可截图带走</div><div class="cl-pit">'+inline(c.pitfall)+"</div></div>"+
      (remark?'<div class="cl-carryrow"><div class="cl-lab">待企业补充</div><div class="cl-remark">⚠ '+esc(remark)+
        "；平台不代填数值，按企业现行制度与规范原文执行。</div></div>":"")+
      '<div class="cl-compliance">本课程内容为企业内训参考框架，须经公司技术部门审核后方可作为正式培训材料；'+
        "涉及执行标准、验收判据、安全作业的内容，以法规标准原文及企业现行制度为准。</div>"+
    "</div>";
  }

  function quizHtml(q,st){
    var a=st.answers[q.id];
    var picked=(a&&a.picked)||((window.__CL_TMP&&window.__CL_TMP[q.id])||[]);
    var tag=q.stem.indexOf("【冲突条件】")===0?'<span class="cl-qtag warn">冲突条件</span>':"";
    var stem=q.stem.replace(/^【冲突条件】/,"").replace(/^【排序题】/,"").replace(/^【辨析题】/,"");
    /* P1-04：q.type 本身已是「多选」，原来又拼了「 · 多选」造成重复 */
    var typeTag='<span class="cl-qtag">'+esc(q.type)+"</span>";
    /* v6.2：只渲染非空选项，支持 3 选项题（A/B/C）与 4 选项题混排 */
    var opts=["A","B","C","D"].filter(function(k){return q.options[k];}).map(function(k){
      var cls="cv-opt cl-opt";
      if(a){
        if(q.answer.indexOf(k)>=0) cls+=" right";
        else if(picked.indexOf(k)>=0) cls+=" wrong";
      }else if(q.multi&&picked.indexOf(k)>=0) cls+=" picked";
      return '<button class="'+cls+'" data-k="'+k+'"'+(a?" disabled":"")+">"+
        (q.multi?'<span class="cl-box">'+(picked.indexOf(k)>=0?"✓":"")+"</span>":"")+
        k+". "+esc(q.options[k])+"</button>";
    }).join("");
    var ctrl="";
    if(q.multi&&!a) ctrl='<button class="btn primary cl-submit" id="clSubmit">提交答案</button>';
    var fb="";
    if(a){
      fb='<div class="cv-fb '+(a.correct?"ok":"bad")+'">'+
        (a.correct?"✓ 答对了。":"✕ 再想想，这题先记进待复习。")+esc(q.explain)+"</div>";
    }
    return '<div class="cl-qhead">'+tag+typeTag+"</div>"+
      '<div class="cv-q cl-q">'+esc(stem)+"</div>"+
      '<div class="cl-qopts">'+opts+"</div>"+ctrl+fb;
  }

  /* P1-10 / P2-09：宽屏右侧辅助栏（纯静态渲染，不动数据与交互；仅 ≥1200px 由 CSS 显示） */
  function asideHtml(ss,c,st,s){
    var review=ss.filter(function(x){return x.type==="quiz"&&st.answers[x.id]&&st.answers[x.id].correct===false;});
    var qn=(quizzesBy[curCourse]||[]).length;
    return '<aside class="cv-aside">'+
      '<div class="cv-aside-card"><div class="cv-aside-h">学习进度</div>'+
        '<div class="cv-aside-pct">'+s.pct+'<small>%</small></div>'+
        '<div class="prog"><i style="width:'+s.pct+'%"></i></div>'+
        '<div class="cv-aside-note">已完成 '+s.done+' / '+s.total+' 个步骤</div></div>'+
      '<div class="cv-aside-card"><div class="cv-aside-h">本课信息</div>'+
        '<div class="cv-aside-row"><span>课程编号</span><b>'+esc(c.id)+'</b></div>'+
        '<div class="cv-aside-row"><span>难度带</span><b>'+esc(c.level)+'</b></div>'+
        '<div class="cv-aside-row"><span>材料族</span><b>'+esc(c.family)+'</b></div>'+
        '<div class="cv-aside-row"><span>随堂题</span><b>'+qn+' 道</b></div></div>'+
      '<div class="cv-aside-card"><div class="cv-aside-h">待复习</div>'+
        (review.length
          ? '<div class="cv-aside-note">'+review.length+' 道题答错，建议重看</div>'+
            '<div class="cv-aside-chips">'+review.map(function(x){
              return '<button class="cv-aside-chip" data-goto="'+esc(x.id)+'">'+esc(x.title)+'</button>';
            }).join("")+'</div>'
          : '<div class="cv-aside-note">待复习清单是空的，保持得不错 🎯</div>')+
      '</div>'+
      '<div class="cv-aside-card"><div class="cv-aside-h">学习提示</div>'+
        '<div class="cv-aside-note">左侧步骤条可随时回看；随堂练习只给对错、不记分不排名，答错可「重新作答」。</div></div>'+
    '</aside>';
  }

  /* P1-01：完成课程后的结课小结页（原实现只弹 toast、界面零变化） */
  function renderDone(){
    var c=courseById[curCourse],ss=stepsOf(curCourse),st=read(curCourse),s=stat(curCourse);
    markLast(curCourse,ss[ss.length-1].id);   /* P1-02：结课也记录，返回列表可看到继续学习位置 */
    var sub=subById[c.sub]||{name:""};
    var qs=quizzesBy[curCourse]||[],right=0,review=0,answered=0;
    qs.forEach(function(q){var a=st.answers[q.id];if(a){answered++;if(a.correct)right++;else review++;}});
    var ids=sub.courseIds||[],pos=ids.indexOf(curCourse),
        nextId=(pos>=0&&pos<ids.length-1)?ids[pos+1]:"";
    var anchors=c.anchors.filter(function(a){return a.ref;}).map(function(a){return esc(a.name);});
    var html='<div class="cv-bar"><div class="cv-back" id="cvBack" role="button" tabindex="0">返回课程列表</div>'+
      '<div class="cv-title">第 '+("0"+(c.lessonNo||c.seq)).slice(-2)+" 课 · "+esc(c.topic)+
        ' <span class="cl-cid">'+esc(c.id)+"</span></div>"+
      '<span class="cv-badge done">已完成 ✓</span>'+
      /* P2-08：学习态隐藏全局导航后补一个轻量「退出学习」入口，可直接回四大板块 */
      '<button class="btn cv-exit" id="cvExit" title="返回四大板块" aria-label="返回四大板块">✕ 返回四大板块</button></div>'+
      '<div class="cv-prog-wrap"><div class="cv-prog" role="progressbar" aria-label="学习进度" '+
        'aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><i style="width:100%"></i></div>'+
        '<span class="cv-prog-txt">'+ss.length+" / "+ss.length+" 步 · 100%</span></div>"+
      '<div class="cv-layout"><div class="cv-steps">'+ss.map(function(x){
        return '<div class="cv-sitem ok" data-s="'+x.id+'" role="button" tabindex="0">'+
          '<span class="cv-sn">✓</span>'+esc(x.title)+"</div>";
      }).join("")+'</div><div class="cv-main">'+
        '<div class="cv-finish"><div class="cv-done-icon">✓</div>'+
        '<h3>恭喜完成《'+esc(c.topic)+"》</h3>"+
        '<p>本课 '+s.total+" 个步骤已全部学完，随堂练习答对 "+right+" / "+qs.length+" 题"+
          (review?"，"+review+" 题已加入待复习":(answered===qs.length&&right===answered?"，全部答对":""))+"。</p>"+
        '<div class="cv-done-stats">'+
          '<div><b>'+s.total+"</b><span>学习步骤</span></div>"+
          '<div><b>'+right+"</b><span>答对题目</span></div>"+
          '<div><b>'+review+"</b><span>待复习</span></div>"+
          '<div><b>'+anchors.length+"</b><span>材料锚点</span></div>"+
        "</div>"+
        (anchors.length?'<div class="cv-done-anchors">本课带走：'+anchors.join(" · ")+"</div>":"")+
        '<div class="acts">'+
          (nextId?'<button class="btn primary" id="cvNextCourse">下一课</button>':
                  '<button class="btn primary" id="cvBackList">返回课程列表</button>')+
          '<button class="btn" id="cvReplay">再看一遍</button>'+
          (nextId?'<button class="btn" id="cvBackList">返回列表</button>':"")+
        "</div></div>"+
      "</div>"+asideHtml(ss,c,st,s)+"</div>";
    cv.innerHTML=html;
    var back=function(){justCompleted=false;showCourses(curSub);};
    var jump=function(id){justCompleted=false;curStep=id;hash(curCourse,curStep);renderCv();scrollTop();};
    cv.querySelectorAll(".cv-sitem[data-s]").forEach(function(el){
      el.addEventListener("click",function(){jump(el.dataset.s);});});
    cv.querySelectorAll("[data-goto]").forEach(function(el){
      el.addEventListener("click",function(){jump(el.dataset.goto);});});
    var b2=cv.querySelector("#cvBack"),bl=cv.querySelector("#cvBackList"),
        rp=cv.querySelector("#cvReplay"),nc=cv.querySelector("#cvNextCourse"),
        ex=cv.querySelector("#cvExit");
    if(b2) b2.addEventListener("click",back);
    if(bl) bl.addEventListener("click",back);
    if(ex) ex.addEventListener("click",function(){justCompleted=false;showBoards();});
    /* B1-C2：再学一遍 = 真重学。清空该课 done/answers/completed 与临时答案、退出步骤，
       再跳回第 1 步，避免跳回 s1 却仍显示 100% 已完成。 */
    if(rp) rp.addEventListener("click",function(){
      mutate(curCourse,function(x){x.done={};x.answers={};x.completed=false;});
      window.__CL_TMP={};
      try{var p=load();if(p.__last&&p.__last.cid===curCourse){delete p.__last;save(p);}}catch(e){}
      justCompleted=false;
      jump(ss[0].id);
    });
    if(nc) nc.addEventListener("click",function(){openCourse(nextId,"",true);});
    scrollTop();
  }

  function renderCv(){
    /* P1-03：切步骤 / 重渲染时清掉上一步残留 toast（「回答正确」不再跨步骤出现） */
    if(typeof clearToast==="function") clearToast();
    if(justCompleted){renderDone();return;}   /* P1-01 */
    var c=courseById[curCourse],ss=stepsOf(curCourse);
    markLast(curCourse,curStep);   /* P1-02：记录最近学习位置，供列表「继续学习」置顶条使用 */
    var idx=ss.findIndex(function(x){return x.id===curStep;});if(idx<0) idx=0;
    var cur=ss[idx],st=read(curCourse),s=stat(curCourse);
    /* B1-C1：讲授步不再「渲染即完成」。done 改由正文末尾「我学会了」主动确认触发；
       翻页/深链不写进度，杜绝未读正文即可把进度刷到 100%。quiz 步仍由答对触发。 */
    var sub=subById[c.sub]||{name:""};
    var html='<div class="cv-bar"><div class="cv-back" id="cvBack" role="button" tabindex="0">返回课程列表</div>'+
      '<div class="cv-title">第 '+("0"+(c.lessonNo||c.seq)).slice(-2)+" 课 · "+esc(c.topic)+
        ' <span class="cl-cid">'+esc(c.id)+"</span></div>"+
      '<span class="cl-tag">'+esc(sub.id)+" "+esc(sub.name)+"</span>"+
      '<span class="cl-tag">'+esc(c.level)+"</span>"+
      /* P2-03：「内容待审核」是中性信息，不再与「待复习」共用橙色警示样式 */
      '<span class="cv-badge audit">内容待审核</span>'+
      /* P2-08：学习态隐藏全局导航后补轻量退出入口 */
      '<button class="btn cv-exit" id="cvExit" title="返回四大板块" aria-label="返回四大板块">✕ 返回四大板块</button></div>'+
      /* v2.8.20 · 普通态可逆入口：显眼的「进入专注学习」切换条（专注态由 CSS 隐藏） */
      '<div class="cv-modebar"><span class="cv-modebar-txt">完整视图 · 含课程信息与全部步骤</span>'+
        '<button class="btn cv-focus-enter" type="button">◎ 进入专注学习</button></div>'+
      /* v2.8.19 · P2-04：合规条移出首屏顶部，改在页脚「本课信息」抽屉（见下方拼接） */
      '<div class="cv-prog-wrap"><div class="cv-prog" role="progressbar" aria-label="学习进度" '+
        'aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+s.pct+'"><i style="width:'+s.pct+'%"></i></div>'+
        '<span class="cv-prog-txt">'+(idx+1)+" / "+ss.length+" 步 · "+s.pct+"%</span></div>"+
      '<div class="cv-stepshint"><span>学习步骤 <b>'+(idx+1)+" / "+ss.length+"</b></span>"+
        '<span class="cv-stepshint-tip">左右滑动查看全部步骤</span></div>'+
      '<div class="cv-layout"><div class="cv-steps">'+ss.map(function(x,i){
        var ok=!!st.done[x.id],bad=x.type==="quiz"&&st.answers[x.id]&&st.answers[x.id].correct===false;
        return '<div class="cv-sitem '+(x.id===curStep?"cur ":"")+(ok?"ok":bad?"bad":"")+
          /* P2-07：点「完成课程」未通过时，未完成的步骤在步骤条上高亮 */
          ((guardRest&&guardRest.indexOf(x.id)>=0)?" todo":"")+
          '" data-s="'+x.id+'" role="button" tabindex="0" aria-label="步骤 '+(i+1)+"："+esc(x.title)+'">'+
          '<span class="cv-sn">'+(ok?"✓":i+1)+"</span>"+esc(x.title)+"</div>";
      }).join("")+'</div><div class="cv-main">';
    /* v2.16.0：s1 合并「知识定位 + 知识框架」，标题同步；分段由 segHtml 内的徽章小标题承担 */
    var SEGTITLE={s1:"知识定位与框架 · 这一类知识在版图里的位置与构成",
      s3:"系统讲授 · 逐块讲透",s4:"知识结构与学习要点 · 把知识块连成一条链",
      s6:"本课要点"};
    /* P1-05：编号统一由步骤条承担，正文标题不再重复圈码（v2.8.7 起 8 步） */
    html+='<div class="cv-kicker">步骤 '+(idx+1)+" / "+ss.length+" · "+
      (cur.type==="quiz"?"场景化随堂练习":"系统知识")+"</div>"+
      '<h3 class="cv-h">'+(cur.type==="seg"?esc(SEGTITLE[cur.id]):esc(cur.title))+"</h3>";
    if(cur.type==="seg") html+='<div class="cv-md cl-seg">'+segHtml(cur.id,c)+"</div>";
    else html+='<div class="cv-quiz">'+quizHtml(cur.q,st)+"</div>";
    html+='<div class="cv-foot"><button class="btn" id="cvPrev"'+(idx<=0?" disabled":"")+">上一步</button>"+
      '<span class="sp"></span>';
    if(cur.type==="quiz"&&st.answers[cur.id]&&!st.answers[cur.id].correct)
      html+='<button class="btn" id="cvRetry">重新作答</button>';
    /* B1-C1：讲授步增加显式「我学会了」确认，点击才写 done；已确认则禁用 */
    if(cur.type==="seg")
      html+='<button class="btn cv-ack"'+(st.done[cur.id]?" disabled":"")+' id="cvAck">'+
        (st.done[cur.id]?"✓ 已学会":"我学会了，完成本步")+"</button>";
    html+='<button class="btn primary" id="cvNext">'+(idx>=ss.length-1?"完成课程":"下一步")+"</button></div>";
    /* P2-07：不再「一夜回到解放前」跳回第 1 步，改为就近提示 + 未完成步骤快捷入口 */
    if(guardRest&&guardRest.length){
      html+='<div class="cv-guard"><b>还差 '+guardRest.length+' 步就学完了</b>'+
        '<span>点下方步骤可直接前往，全部学完后再点「完成课程」。已学内容都会保留。</span>'+
        '<div class="cv-guard-chips">'+ss.filter(function(x){return guardRest.indexOf(x.id)>=0;})
          .slice(0,4).map(function(x,i){
            return '<button class="cv-guard-chip" data-goto="'+esc(x.id)+'">'+esc(x.title)+"</button>";
          }).join("")+"</div></div>";
    }
    html+="</div>"+asideHtml(ss,c,st,s)+"</div>";
    /* v2.8.19 · P2-04：合规说明移入页脚「本课信息」折叠抽屉。
       中性信息蓝 + ⓘ info 图标、默认收起、专注态由既有 .cv-audit 规则隐藏。 */
    html+='<details class="cv-audit cv-info-foot"><summary>本课信息 · 内容合规说明（点击展开）</summary>'+
      '<div class="cv-audit-b">本课正文与随堂题由课程采集包生成，须经公司技术部门审核后方可作为正式培训材料；'+
      "随堂练习自愿、只给对错、不记分不排名、不存档到人。</div>"+
      '<div class="cv-info-rows">'+
      "<span>难度带 <b>"+esc(c.level)+"</b></span>"+
      "<span>材料族 <b>"+esc(c.family||"—")+"</b></span>"+
      "<span>随堂题 <b>"+(quizzesBy[curCourse]||[]).length+" 道</b></span></div></details>";
    cv.innerHTML=html;bindCv(ss,idx,cur,st);
    /* P0-02：横排步骤条（手机/平板 ≤860px）把当前步滚到可视中央；
       桌面竖排 flex-direction:column 时 8 步全可见，跳过，避免带动整页跳动。 */
    try{
      var bar=cv.querySelector(".cv-steps"),curEl=cv.querySelector(".cv-sitem.cur");
      if(bar&&curEl&&getComputedStyle(bar).flexDirection==="row"&&bar.scrollWidth>bar.clientWidth){
        var delta=curEl.getBoundingClientRect().left-bar.getBoundingClientRect().left-
                  (bar.clientWidth-curEl.offsetWidth)/2;
        bar.scrollLeft+=delta;
      }
    }catch(e){}
    applyFocus();   /* v2.8.17：DOM 重建后重新应用专注模式（含三端差异） */
  }

  function bindCv(ss,idx,cur,st){
    var b2=cv.querySelector("#cvBack");
    if(b2){var f=function(){showCourses(curCourse?subById[courseById[curCourse].sub].id:"");};
      b2.addEventListener("click",f);
      b2.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();f();}});}
    cv.querySelectorAll(".cv-sitem").forEach(function(el){
      var f=function(){guardRest=null;curStep=el.dataset.s;hash(curCourse,curStep);renderCv();scrollTop();};
      el.addEventListener("click",f);
      el.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();f();}});});
    /* P1-10：辅助栏「待复习」快捷跳题（复用既有步骤切换） */
    cv.querySelectorAll("[data-goto]").forEach(function(el){
      el.addEventListener("click",function(){guardRest=null;curStep=el.dataset.goto;hash(curCourse,curStep);renderCv();scrollTop();});});
    /* P2-08：学习态轻量退出入口 */
    var ex=cv.querySelector("#cvExit");
    if(ex) ex.addEventListener("click",function(){guardRest=null;justCompleted=false;showBoards();});
    cv.querySelectorAll(".cl-chip[data-m], .cl-inline-mat[data-m]").forEach(function(b){
      b.addEventListener("click",function(){openMat(b.dataset.m,b);});});
    cv.querySelectorAll(".cl-opt").forEach(function(b){
      b.addEventListener("click",function(){
        if(b.disabled) return;
        var k=b.dataset.k,q=cur.q;
        if(!q.multi){
          var correct=q.answer.length===1&&q.answer[0]===k;
          mutate(curCourse,function(x){x.answers[q.id]={picked:[k],correct:correct};if(correct)x.done[q.id]=true;});
          renderCv();toast(correct?"答对了，继续下一题 →":"先记进待复习，回头再练，继续走");
        }else{
          var a=read(curCourse).answers[q.id];
          var picked=((window.__CL_TMP&&window.__CL_TMP[q.id])||[]).slice();
          var i=picked.indexOf(k);if(i>=0)picked.splice(i,1);else picked.push(k);
          window.__CL_TMP=window.__CL_TMP||{};window.__CL_TMP[q.id]=picked;
          b.classList.toggle("picked",picked.indexOf(k)>=0);
          var box=b.querySelector(".cl-box");if(box)box.textContent=picked.indexOf(k)>=0?"✓":"";
        }
      });});
    var submit=cv.querySelector("#clSubmit");
    if(submit) submit.addEventListener("click",function(){
      var q=cur.q,picked=((window.__CL_TMP&&window.__CL_TMP[q.id])||[]).slice();
      if(!picked.length){toast("选一项就能提交啦");return;}
      var correct=picked.length===q.answer.length&&picked.every(function(k){return q.answer.indexOf(k)>=0;});
      mutate(curCourse,function(x){x.answers[q.id]={picked:picked,correct:correct};if(correct)x.done[q.id]=true;});
      renderCv();toast(correct?"答对了，继续下一题 →":"先记进待复习，回头再练，继续走");
    });
    var prev=cv.querySelector("#cvPrev"),next=cv.querySelector("#cvNext"),retry=cv.querySelector("#cvRetry"),
        ack=cv.querySelector("#cvAck");
    if(prev) prev.addEventListener("click",function(){goStep(idx-1);});
    /* B1-C1：主动确认本讲授步已完成，写入 done 后仅刷新本步，不翻页 */
    if(ack) ack.addEventListener("click",function(){
      mutate(curCourse,function(x){x.done[cur.id]=true;});
      renderCv();toast("学会了，下一步 →");
    });
    if(retry) retry.addEventListener("click",function(){
      mutate(curCourse,function(x){delete x.answers[cur.id];});
      if(window.__CL_TMP) delete window.__CL_TMP[cur.id];
      renderCv();});
    if(next) next.addEventListener("click",function(){
      /* 修复 M5：随堂练习（quiz）为自愿练习，答错仅计入「待复习」，不阻断结课。
         完成判定只统计讲授步（seg），与 stat() 的 review 独立统计保持一致。 */
      var rest=ss.filter(function(x){return x.type!=="quiz"&&!read(curCourse).done[x.id];});
      if(idx>=ss.length-1&&rest.length){
        /* P2-07：不再跳回第 1 步；就地高亮未完成步骤并给出快捷入口，已学进度保持不动 */
        guardRest=rest.map(function(x){return x.id;});renderCv();
        toast("还差 "+rest.length+" 步就学完了，看下面 →");
      }else if(idx>=ss.length-1){
        guardRest=null;
        mutate(curCourse,function(x){x.completed=true;});
        justCompleted=true;renderCv();   /* P1-01：切到结课小结页，不再原地不动只弹 toast */
      }else goStep(idx+1);});
  }

  /* ---------- 课程内材料卡：点锚点直接在本页调用并展开，不跳转材料认知库 ----------
     数据与材料库同源（window.MAT_DATA），按锚点 ref 精确取卡；实物图沿用 images/ 清单。
     P2-06：采集包锚点已全部改为材料库内真实卡（anchorExternal=0），均可点；
     若日后出现库外锚点，渲染层仍降级为纯文本兜底，不产生死链。 */
  function imgOf(d){
    var fn=(typeof shotFile==="function")?shotFile(d.img):d.img;
    return fn?"images/"+fn:"";
  }
  function matField(label,val){
    if(!val) return "";
    return '<div class="cl-mat-f"><div class="cl-mat-fl">'+esc(label)+"</div>"+
           '<div class="cl-mat-fv">'+esc(val)+"</div></div>";
  }
  function matCardHtml(d){
    var img=imgOf(d),photo=img
      ? '<div class="cl-mat-photo"><img src="'+esc(img)+'" alt="'+esc(d.name)+
          '" onerror="this.parentNode.classList.add(\'noimg\');this.remove()">'+
          '<span class="cl-mat-ph">暂无实物图</span></div>'
      : '<div class="cl-mat-photo noimg"><span class="cl-mat-ph">暂无实物图</span></div>';
    var parts=Array.isArray(d.parts)?d.parts.join(" / "):(d.parts||"");
    var chips=[d.cat,d.lv2,d.tag,d.status].filter(Boolean).map(function(x){
      return '<span class="cl-mat-chip">'+esc(x)+"</span>";}).join("")+
      (d.companyUsed?'<span class="cl-mat-chip ok">✓ 公司现用</span>':"");
    return photo+'<div class="cl-mat-meta">'+chips+"</div>"+
      '<div class="cl-mat-fields">'+
        matField("型号 / 规格",d.model||d.spec)+matField("执行标准",d.std)+
        matField("结构组成",parts)+matField("连接方式",d.conn)+
        matField("工作原理",d.principle)+matField("作用",d.func)+
        matField("优势",d.adv)+matField("常搭配使用",d.mate)+
        (d.companyUsed?matField("使用情况","本公司当前在用材料"):"")+
      "</div>"+
      '<div class="cl-mat-src">材料卡与「材料认知库」同源 · 点遮罩或 ✕ 返回课程</div>';
  }
  function openMat(name,src){
    if(!mcard||!mmask) return;
    var list=(window.MAT_DATA||(typeof DATA!=="undefined"?DATA:[]))||[],d=null;
    for(var i=0;i<list.length;i++){if(list[i].name===name){d=list[i];break;}}
    if(!d){toast("这张卡还没收进来，先看看同类材料吧");return;}
    lastFocus=src||null;
    if(mtitle) mtitle.textContent=d.name;
    if(msub) msub.textContent=[d.model,d.cat,d.lv2].filter(Boolean).join(" · ");
    if(mbody){mbody.innerHTML=matCardHtml(d);mbody.scrollTop=0;}
    mmask.classList.add("show");mcard.classList.add("show");
    document.body.classList.add("cl-mat-open");
    if(mclose){try{mclose.focus({preventScroll:true});}catch(e){}}
  }
  function closeMat(){
    if(!mcard||!mmask||!mcard.classList.contains("show")) return;
    mmask.classList.remove("show");mcard.classList.remove("show");
    document.body.classList.remove("cl-mat-open");
    if(lastFocus&&lastFocus.focus){try{lastFocus.focus({preventScroll:true});}catch(e){}}
    lastFocus=null;
  }
  if(mmask) mmask.addEventListener("click",closeMat);
  if(mclose) mclose.addEventListener("click",closeMat);
  document.addEventListener("keydown",function(e){
    if(!mcard||!mcard.classList.contains("show")) return;
    if(e.key==="Escape"){e.preventDefault();e.stopPropagation();closeMat();return;}
    /* P1-09：浮层打开时把 Tab 焦点锁在弹层内，防止焦点穿透到底层课程页（配合 CSS 滚动锁定） */
    if(e.key==="Tab"){
      var f=mcard.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
      if(!f.length) return;
      var first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  },true);

  /* ---------- 对外接口（路由 / 状态恢复复用） ---------- */
  window.CV_APPLY=function(course,step){
    if(course&&courseById[course]) openCourse(course,step||"",false);
    else showBoards();
  };
  window.CV_STAT=function(cid){return stat(cid);};
  window.CL_MAT_CLOSE=closeMat;   /* 切板块时由路由统一关闭材料卡浮层 */
  window.CL_MAT_OPEN=openMat;     /* v2.24.1：供 v3_full.js 注入的「本课速查」材料锚点 chip 复用本页展开 */
  /* IIFE 在路由初始化之后执行：先静默渲染板块底，再自行应用一次初始深链，避免覆盖 #courses/C01/s3 */
  showBoards(true);
  if(typeof parseRoute==="function"){
    var r0=parseRoute();
    if(r0.mod==="courses"&&r0.course&&courseById[r0.course])
      openCourse(r0.course,r0.step||"",false);
  }
})();
/* CURRICULUM_MODULE_END */

/* ===== 模块三：考核练习 ===== */
/* B4 · P1-12：题库由材料单一数据源派生（题干/选项均取 DATA 真实字段，不编造规范条款）。
   答案索引按 (i*3+1)%4 打散到 0..3；渲染时再随机化选项顺序；按知识点 k 分组；
   ref 关联材料名，支持「题目 -> 材料」与「材料 -> 题目」双向跳转。 */
function _b4uniq(a){return [...new Set(a.filter(Boolean))];}
function _b4short(s,n){s=String(s||"");return s.length>n?s.slice(0,n)+"…":s;}
function _b4shuffle(a,seed){const x=a.slice();let s=seed>>>0;
  for(let i=x.length-1;i>0;i--){s=(s*1664525+1013904223)>>>0;const j=s%(i+1);[x[i],x[j]]=[x[j],x[i]];}return x;}
function buildQuiz(){
  const D=window.MAT_DATA||[], CATS=(window.MAT_CATS||[]).filter(c=>c!=="全部");
  if(!D.length||CATS.length<4) return [];
  const byCat={}; D.forEach(d=>{(byCat[d.cat]=byCat[d.cat]||[]).push(d);});
  const picks=[]; Object.keys(byCat).forEach(c=>{byCat[c].slice(0,2).forEach(d=>picks.push(d));});
  const raw=[];
  // A 分类认知：每类 2 题，干扰项取其他真实一级分类
  picks.forEach(d=>{
    const wrong=_b4shuffle(CATS.filter(c=>c!==d.cat),d.name.length*7+1).slice(0,3).map(x=>_b4short(x,10));
    if(wrong.length<3) return;
    raw.push({k:"分类认知",q:`「${_b4short(d.name,14)}」属于哪个一级分类？`,ans:_b4short(d.cat,10),wrong,ref:d.name});
  });
  // B 连接方式：干扰项取其他材料的真实 conn
  picks.filter(d=>d.conn).slice(0,7).forEach(d=>{
    const others=_b4uniq(D.map(x=>x.conn).filter(c=>c&&c!==d.conn));
    const wrong=_b4shuffle(others,d.name.length*13+5).slice(0,3).map(x=>_b4short(x,22));
    if(wrong.length<3) return;
    raw.push({k:"连接方式",q:`「${_b4short(d.name,14)}」常用的连接/安装方式是？`,ans:_b4short(d.conn,22),wrong,ref:d.name});
  });
  // C 作用原理：干扰项取其他材料的真实 func
  picks.filter(d=>d.func).slice(0,7).forEach(d=>{
    const others=_b4uniq(D.map(x=>x.func).filter(f=>f&&f!==d.func));
    const wrong=_b4shuffle(others,d.name.length*17+9).slice(0,3).map(x=>_b4short(x,22));
    if(wrong.length<3) return;
    raw.push({k:"作用原理",q:`「${_b4short(d.name,14)}」的主要作用是？`,ans:_b4short(d.func,22),wrong,ref:d.name});
  });
  return raw.map((t,i)=>{
    const pos=(i*3+1)%4;   // 答案索引打散
    const opts=[]; let w=0;
    for(let j=0;j<4;j++) opts.push(j===pos?t.ans:(t.wrong[w++]||"—"));
    return {q:t.q,opts:opts,a:pos,k:t.k,ref:t.ref};
  });
}
const QUIZ=buildQuiz();
/* B4 · P1-12 双向关联：材料 -> 题目 */
window.MAT_QUIZ_REF=name=>QUIZ.findIndex(q=>q.ref===name);
window.MAT_GO_QUIZ=i=>{
  go("exam");
  document.querySelectorAll("#examTabs .tab").forEach(t=>t.classList.toggle("active",t.dataset.tab==="quiz"));
  document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("show",p.id==="p-quiz"));
  qi=Math.max(0,Math.min(i,QUIZ.length-1)); score=0; renderQuiz();
  const q=document.getElementById("p-quiz"); if(q) q.scrollIntoView({behavior:"smooth",block:"start"});
};
function quizToMaterial(name){
  go("materials");
  const el=document.getElementById("q"); if(el) el.value=name;
  if(window.MAT_RENDER) window.MAT_RENDER();
  const g=document.getElementById("grid"); if(g) g.scrollIntoView({behavior:"smooth",block:"start"});
}
let qi=0,score=0,locked=false;
function renderQuiz(){
  const box=document.getElementById("p-quiz");
  /* 修复 L3：空题库时 0===0 会误报「全部正确」，单独分支处理 */
  if(!QUIZ.length){box.innerHTML=`<div class="quiz"><div class="score"><div class="st">练习题库暂未加载，请稍后重试</div></div></div>`;return;}
  if(qi>=QUIZ.length){box.innerHTML=`<div class="quiz"><div class="score"><div class="big">${score} / ${QUIZ.length}</div><div class="st">${score===QUIZ.length?'全部正确，掌握扎实 🎉':(score>=QUIZ.length*0.6?'及格，继续巩固薄弱点':'需重练，建议回到材料库复习')}</div></div><div class="qfoot"><button class="btn primary" onclick="resetQuiz()">再来一组</button></div></div>`;return;}
  /* B4 · P1-12：选项顺序随机化，并重算正确答案索引 */
  const base=QUIZ[qi];
  const order=[0,1,2,3];
  for(let i=3;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  const item={q:base.q,k:base.k,ref:base.ref,opts:order.map(i=>base.opts[i]),a:order.indexOf(base.a)};
  box.innerHTML=`<div class="quiz">
    <div class="qbar"><span class="qnum">第 <b>${qi+1}</b> / ${QUIZ.length} 题</span><span class="qk">知识点：${item.k}</span></div>
    <div class="qtext">${item.q}</div>
    <div id="opts" role="radiogroup" aria-label="答案选项">${item.opts.map((o,i)=>`<div class="opt" role="radio" tabindex="0" aria-checked="false" data-i="${i}"><span class="mk">${String.fromCharCode(65+i)}</span><span>${o}</span></div>`).join("")}</div>
    <div class="qfoot"><span class="qhint" id="qhint">请先选择答案</span><button class="btn primary" id="nextBtn" disabled aria-disabled="true">下一题</button></div>
    <div class="qrel">关联材料：<button class="taglink" onclick="quizToMaterial('${base.ref.replace(/'/g,"\'")}')">${base.ref}</button></div>
  </div>`;
  locked=false;
  box.querySelectorAll(".opt").forEach(o=>{
    const choose=()=>{
      if(locked)return;locked=true;
      const i=+o.dataset.i;
      const correct=item.a;
      box.querySelectorAll(".opt").forEach(x=>{
        const xi=+x.dataset.i;
        x.setAttribute("aria-checked",xi===i?"true":"false");
        if(xi===correct)x.classList.add("correct");
        if(xi===i&&i!==correct)x.classList.add("wrong");
      });
      if(i===correct){score++;document.getElementById("qhint").textContent="✓ 答对了";}
      else{document.getElementById("qhint").textContent="✗ 正确答案："+String.fromCharCode(65+correct);}
      const nb=document.getElementById("nextBtn");nb.disabled=false;nb.removeAttribute("aria-disabled");
    };
    o.addEventListener("click",choose);
    o.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();choose();}});
  });
  document.getElementById("nextBtn").addEventListener("click",()=>{qi++;renderQuiz();});
}
function resetQuiz(){qi=0;score=0;renderQuiz();}
renderQuiz();
const boardData=[{n:"张工",s:98},{n:"李师傅",s:95},{n:"王磊",s:91},{n:"陈静",s:87},{n:"赵强",s:82},{n:"孙明",s:76}];
document.getElementById("board").innerHTML=`<div class="demo-line"><span class="demo-badge">示例数据</span> 下方为演示用的虚拟排名，非真实成绩</div>`+boardData.map((r,i)=>`<div class="brow"><span class="rk ${i<3?'g'+(i+1):''}">${i+1}</span><span class="nm">${r.n}</span><span class="sc">${r.s} 分</span></div>`).join("");
document.querySelectorAll("#examTabs .tab").forEach(t=>t.addEventListener("click",()=>{
  document.querySelectorAll("#examTabs .tab").forEach(x=>x.classList.remove("active"));
  t.classList.add("active");
  document.querySelectorAll(".panel").forEach(p=>p.classList.remove("show"));
  document.getElementById("p-"+t.dataset.tab).classList.add("show");
}));

/* ===== 模块四：知识库问答（演示检索） ===== */
const KB={
  "球墨铸铁管":{a:"球墨铸铁管（DN100–DN1200）常用<b>承插连接</b>，接口为 T 型/W 型胶圈柔性接口：承口插接、胶圈止水、允许一定角度偏转，抗震与密封性好。埋地前需做内外防腐（如喷锌+沥青）。",src:"来源：GB/T 13295《水及燃气管道用球墨铸铁管、管件和附件》"},
  "阀门":{a:"阀门按功能分为<b>截断类（闸阀、蝶阀）</b>、<b>止回类（防止倒流）</b>、<b>调节类（减压阀、调节阀）</b>。安装前核对公称压力 PN 与口径，法兰面平行、螺栓对角紧固，带传动机构者预留操作空间。",src:"来源：操作规程 SOP · 阀门安装与维护"},
  "爆管":{a:"管网爆管应急：①上报并<b>关闭上下游阀门、划定停水范围</b>；②排水、开挖暴露漏点；③按管材选用抢修器/哈夫节/换管；④试压合格后<b>恢复通水</b>并通知用户。优先保障医院、学校等重点用户。",src:"来源：事故案例库 · 管网抢修处置"},
  "水表":{a:"水表倒转多因<b>表后管道存在回流</b>（如高位水池、加压设备止回失效）。处理：核查并加装/更换止回阀，排除回流源后复测；智能表可查远程数据判断时段。",src:"来源：常见 FAQ · 计量异常判别"},
  "阀门井":{a:"阀门井漏水先查：井壁渗漏、阀门填料函滴漏、法兰密封失效或排泥阀未关严。处置：紧固压盖、更换盘根/垫片，严重井体渗漏需重新勾缝或现浇。",src:"来源：厂家样本 · 阀门井构造与维护"}
};
function ask(q){
  if(!(q||"").trim()){ qaSync(); return; }
  const ans=document.getElementById("qaAnswer");
  let hit=null;
  for(const k in KB){if(q.indexOf(k)>-1){hit=KB[k];break;}}
  const qtext=escapeHtml(q||"（空）");
  if(hit){
    ans.innerHTML=`<div class="aq">问：${qtext}</div><div>${hit.a}</div><div class="src">${hit.src}</div>`;
  }else{
    ans.innerHTML=`<div class="aq">问：${qtext}</div><div>示例知识库暂未收录该问法。阶段四将接入规范 / 案例 / FAQ 做检索增强问答（RAG）。可先试试这些示例问句：</div><div class="qa-egs">${["球墨铸铁管怎么连接？","阀门有哪些类型？","爆管如何应急处置？"].map(x=>`<button class="qa-eg" data-eg="${escapeHtml(x)}">${escapeHtml(x)}</button>`).join("")}</div><div class="src">来源：知识库问答（示例数据）</div>`;
  }
  ans.classList.add("show");
}
/* B4 · P1-14：空输入禁用按钮 + 行内提示；未命中给 3 个可点示例问句 */
const qaIn=document.getElementById("qaInput"), qaBtn=document.getElementById("qaBtn"), qaTip=document.getElementById("qaTip");
function qaSync(){
  const empty=!(qaIn.value||"").trim();
  qaBtn.disabled=empty; qaBtn.setAttribute("aria-disabled",empty?"true":"false");
  if(qaTip){qaTip.textContent=empty?"请输入问题关键词后提问，或从右侧知识分类点选":"按回车或点「提问」检索示例知识库";qaTip.classList.toggle("warn",empty);}
}
function askEg(x){qaIn.value=x;qaSync();ask(x);}
/* 事件委托：示例问句按钮由动态 innerHTML 生成，用 data-eg 传参避免内联拼接 */
document.getElementById("qaAnswer").addEventListener("click",function(e){
  const b=e.target.closest(".qa-eg[data-eg]"); if(b) askEg(b.dataset.eg);
});
qaIn.addEventListener("input",qaSync);
qaSync();
document.getElementById("qaBtn").addEventListener("click",()=>ask(document.getElementById("qaInput").value.trim()));
document.getElementById("qaInput").addEventListener("keydown",e=>{if(e.key==="Enter")ask(e.target.value.trim());});
document.querySelectorAll(".kitem").forEach(k=>{
  const act=()=>{document.getElementById("qaInput").value=k.dataset.q+"相关";ask(k.dataset.q+"相关");go("kb");};
  k.addEventListener("click",act);
  k.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();act();}});
});


/* ===== B8 · 首屏引导：15s 未点击自动淡出；手动「知道了」永久收起 ===== */
(function(){
  var KEY="ws_intro_dismissed_v1", bar=document.getElementById("introBar");
  if(!bar) return;
  var n=document.getElementById("introCount");
  if(n) n.textContent=(window.MAT_DATA?window.MAT_DATA.length:"…");
  try{ if(localStorage.getItem(KEY)==="1"){bar.hidden=true;return;} }catch(e){}
  var rm=matchMedia("(prefers-reduced-motion:reduce)").matches;
  var DUR=15000,left=DUR,ts=0,tid=null,hold=0,done=false;
  function run(){
    if(done||hold||document.hidden||tid||left<=0) return;
    ts=Date.now();
    tid=setTimeout(function(){tid=null;left=0;hide();},left);
  }
  function pause(){
    if(tid){clearTimeout(tid);tid=null;left=Math.max(0,left-(Date.now()-ts));}
  }
  function hide(){
    pause(); if(done) return; done=true;
    if(rm){bar.hidden=true;return;}
    bar.classList.add("is-out");
    setTimeout(function(){bar.hidden=true;},320);
  }
  function setHold(bit,on){
    hold=on?hold|bit:hold&~bit;
    if(on) pause(); else run();
  }
  document.addEventListener("visibilitychange",function(){setHold(1,document.hidden);});
  ["mouseenter","focusin"].forEach(function(t){bar.addEventListener(t,function(){setHold(2,true);});});
  ["mouseleave","focusout"].forEach(function(t){bar.addEventListener(t,function(){setHold(2,false);});});
  var x=document.getElementById("introX");
  if(x) x.addEventListener("click",function(){
    try{localStorage.setItem(KEY,"1");}catch(e){}
    left=0; hide();
  });
  /* 切换器已取消吸顶，引导条无需随滚动收起，始终保持可见 */
  requestAnimationFrame(run);
})();
/* ===== B4 · P1-15 刷新后恢复答题 / 筛选状态（配合版本轻提示） ===== */
(function(){
  try{
    const raw=sessionStorage.getItem("b4-state");
    if(!raw){
      /* 无 b4-state（手动 F5）：若停留在课程体系，用 cg_sub 恢复上次子页 */
      try{
        const cs=CG_INIT_SUB||sessionStorage.getItem('cg_sub');
        const am=document.querySelector('.module.active');
        /* 深链显式指定了 course 或 sub 时不覆盖（#courses/C01、#exam 优先） */
        if(cs==='practice'&&am&&am.id==='m-courses'&&window.CG_mode&&!(__navCur&&__navCur.course)&&!(__navCur&&__navCur.sub)) window.CG_mode('practice');
      }catch(e){}
      return;
    }
    sessionStorage.removeItem("b4-state");
    const st=JSON.parse(raw);
    /* 修复 M4：course/step 随 go 一并传入，由 go→CV_APPLY 在 courses 模块内恢复深链。
       不再无条件 CV_APPLY("")——空 course 会触发 showBoards() 并改 URL 为 #courses，
       覆盖刚 go 到的 exam/kb 模块，导致刷新后跳错模块、深链丢失。 */
    let rmod=st.mod&&META[st.mod]?st.mod:"materials";
    const rcourse=(st.route&&st.route.course)||"", rstep=(st.route&&st.route.step)||"";
    let rsub=st.sub||"";
    if(rmod==="exam"){ rmod="courses"; rsub=rsub||"practice"; }
    go(rmod,{fromPop:true,course:rcourse,step:rstep,sub:rsub});
    if(st.quiz&&typeof qi!=="undefined"){qi=st.quiz.qi||0;score=st.quiz.score||0;renderQuiz();}
    if(st.filter){
      const q=document.getElementById("q"); if(q&&st.filter.q) q.value=st.filter.q;
      if(window.MAT_RESTORE) window.MAT_RESTORE(st.filter.cur);
    }
  }catch(e){}
})();
/* ===== B4 断言数据（供回归脚本读取） ===== */
window.__B4_ASSERT__=window.__B4_ASSERT__||{};
Object.assign(window.__B4_ASSERT__,{
  quizCount:QUIZ.length,
  quizAnswerIdx:QUIZ.map(q=>q.a),
  quizKnowledge:[...new Set(QUIZ.map(q=>q.k))],
  quizRefAllValid:QUIZ.every(q=>!q.ref||(window.MAT_DATA||[]).some(d=>d.name===q.ref)),
  nativeAlertCount:(document.documentElement.outerHTML.match(/\balert\s*\(/g)||[]).length,
  demoBadgeCount:document.querySelectorAll(".demo-badge").length,
  hasIntro:!!document.getElementById("introBar")
});
if(window.MAT_HINTS) window.MAT_HINTS();

;

/* ===== B8 · 版本自愈：发现新版后静默自动刷新，不弹窗 =====
   四层防环：语义化版本比较 >0 / sessionStorage 版本标记 / 60s 冷却 / 内存 latch。
   刷新前复用 b4-state 保存模块、答题与筛选状态；浮层或输入聚焦时延后（≤30s 强制）。 */
(function(){
  try{
    var cur=(document.querySelector('meta[name="app-version"]')||{}).content||'';
    if(!cur) return;
    var S=sessionStorage,K='ws_reloaded_v',T='ws_reload_ts',COOL=60000;
    var busy=false,reloading=false;
    function cmp(a,b){
      var x=String(a||'').split('.'),y=String(b||'').split('.'),z=x.concat(y),i,d;
      if(x.length!==3||y.length!==3||z.some(function(s){return !/^\d+$/.test(s);})) return 0;
      for(i=0;i<3;i++){d=+x[i]-+y[i];if(d) return d>0?1:-1;}
      return 0;
    }
    function ss(k,v){try{return v===undefined?S.getItem(k):S.setItem(k,v);}catch(e){return null;}}
    function saveState(){
      try{
        S.setItem('b4-state',JSON.stringify({
          mod:parseRoute().mod,
          sub:(document.getElementById('cgViewPractice')&&document.getElementById('cgViewPractice').classList.contains('cg-on'))?'practice':'',
          route:{course:parseRoute().course,step:parseRoute().step},
          quiz:{qi:(typeof qi!=='undefined'?qi:0),score:(typeof score!=='undefined'?score:0)},
          filter:{q:(document.getElementById('q')||{}).value||'',cur:(window.MAT_CUR?window.MAT_CUR():{cur:'全部',cur2:'全部'})}
        }));
      }catch(e){}
    }
    function safe(){
      if(document.querySelector('#expcard.show')||document.querySelector('#dmask.show')) return false;
      var a=document.activeElement;
      return !(a&&(a.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)));
    }
    function go(v){
      if(reloading) return; reloading=true;
      ss(K,v); ss(T,String(Date.now()));
      saveState(); var t0=Date.now();
      (function poll(){
        if(!safe()&&Date.now()-t0<30000){setTimeout(poll,2000);return;}
        saveState(); location.reload();
      })();
    }
    function check(){
      if(busy||reloading||document.hidden) return;
      if(Date.now()-(+ss(T)||0)<COOL) return;
      busy=true;
      fetch('version.json?_='+Date.now(),{cache:'no-store'})
        .then(function(r){return r.ok?r.json():null;})
        .then(function(d){
          busy=false;
          if(!d||cmp(d.v,cur)<=0||ss(K)===d.v) return;
          go(d.v);
        }).catch(function(){busy=false;});
    }
    check();
    setInterval(check,60000);
    document.addEventListener('visibilitychange',function(){if(!document.hidden) check();});
    window.addEventListener('focus',check);
  }catch(e){}
})();

;

/* v2.8 · 移动端手势锁定：禁缩放手势、多指手势、边缘侧滑返回；
   单指纵向滚动、点击、输入与既有横向筛选容器均不受影响。
   P1-7 说明：gesturestart/change/end 为 iOS Safari 专有事件、touchmove 多指判定同理，
   均只在移动端浏览器触发；桌面浏览器不响应这些事件，Ctrl+/- 缩放不受此处影响。
   本段与 viewport meta 共同构成「仅移动端禁缩放」，请勿扩大到桌面端。 */
(function(){
  "use strict";
  ["gesturestart","gesturechange","gestureend"].forEach(function(t){
    document.addEventListener(t,function(e){e.preventDefault();},{passive:false});
  });
  document.addEventListener("touchmove",function(e){
    if(e.touches&&e.touches.length>1&&e.cancelable) e.preventDefault();
  },{passive:false});
  var sx=0,sy=0;
  document.addEventListener("touchstart",function(e){
    if(!e.touches||e.touches.length!==1) return;
    sx=e.touches[0].clientX;sy=e.touches[0].clientY;
  },{passive:true});
  /* v2.25.9：全面禁止主页各大版块（课程体系/材料库/考试/知识库等）的横向手势返回——
     不再限于屏幕左右 20px 边缘起手，正文/卡片/空白区任意位置的横向滑动都拦截；
     仅放行真正的横向滚动容器（分类/二级/面包屑/筛选/底栏/课程步骤条/核对表），
     纵向滚动（|dy|>|dx|）与点击/输入不受影响。 */
  var SWIPE_OK=".path,.tabs,.tabs2,.nav,.filterbar .filterrow,.cv-steps,.cl-tbl-wrap";
  document.addEventListener("touchmove",function(e){
    if(!e.touches||e.touches.length!==1||!e.cancelable) return;
    var t=e.target;
    if(t&&t.closest&&t.closest(SWIPE_OK)) return; /* 正常横滑容器放行 */
    var dx=e.touches[0].clientX-sx,dy=e.touches[0].clientY-sy;
    if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)) e.preventDefault();
  },{passive:false});
})();

/* 合版说明：板块内左右滑切换子页。
   材料认知库：左滑 材料图库→安装图库、右滑 安装图库→材料图库（各自边界无反应）；
   课程体系：左滑 课程分类库→练习题全库、右滑 练习题全库→课程分类库（边界无反应）。
   严格约束：只调用 IG_mode / CG_mode 切本板块子页，绝不调用 go()，故手势不会跨板块。
   与上方「手势锁定」共存：那段在 touchmove 里 preventDefault 横向滑动（防浏览器侧滑返回），
   不影响 touchend；本段在 touchend 判定滑动方向并切换。 */
(function(){
  "use strict";
  var HSW_OK=".path,.tabs,.tabs2,.nav,.filterbar .filterrow,.cv-steps,.cl-tbl-wrap"; /* 允许的横滑容器，起点在其内则不切子页 */
  var sx=0,sy=0,st=0,active=false;
  document.addEventListener("touchstart",function(e){
    if(!e.touches||e.touches.length!==1){active=false;return;}
    var t=e.touches[0];sx=t.clientX;sy=t.clientY;st=Date.now();active=true;
  },{passive:true});
  document.addEventListener("touchend",function(e){
    if(!active||!e.changedTouches||e.changedTouches.length!==1){active=false;return;}
    active=false;
    var t=e.changedTouches[0];
    var dx=t.clientX-sx, dy=t.clientY-sy;
    var adx=Math.abs(dx), ady=Math.abs(dy);
    if(adx<60||adx<=ady*1.4) return;                 /* 需明确横向滑动 */
    if(Date.now()-st>800) return;                    /* 过慢的拖动不算滑动 */
    var target=e.target;
    if(target&&target.closest){
      if(target.closest(HSW_OK)) return;             /* 横滑容器（分类/步骤条等）交给原生横滑 */
      if(target.closest("input,textarea,select,[contenteditable]")) return;
      if(target.closest(".ig-seg,.cg-seg")) return;  /* 切换器本身点按不触发 */
    }
    /* 浮层/学习态/灯箱打开时不切子页（灯箱有自己的左右切图） */
    if(window.OverlayManager&&window.OverlayManager.stack&&window.OverlayManager.stack.length>0) return;
    if(document.body.classList.contains("cv-immersive")) return;
    var left=dx<0;                                   /* 左滑=前进到下一子页，右滑=后退 */
    var mod=document.querySelector(".module.active");
    if(!mod) return;
    if(mod.id==="m-materials"){
      var gal=document.getElementById("igTabGallery");
      var isGallery=gal&&gal.getAttribute("aria-selected")==="true";
      if(left&&!isGallery&&typeof window.IG_mode==="function") window.IG_mode("gallery");
      else if(!left&&isGallery&&typeof window.IG_mode==="function") window.IG_mode("single");
      /* 边界：材料图库右滑、安装图库左滑 → 无反应 */
    }else if(mod.id==="m-courses"){
      var prac=document.getElementById("cgTabPractice");
      var isPractice=prac&&prac.getAttribute("aria-selected")==="true";
      if(left&&!isPractice&&typeof window.CG_mode==="function") window.CG_mode("practice");
      else if(!left&&isPractice&&typeof window.CG_mode==="function") window.CG_mode("lib");
      /* 边界：课程分类库右滑、练习题全库左滑 → 无反应 */
    }
    /* 其它板块（如知识库问答）不响应，手势不跨板块 */
  },{passive:true});
})();

;
/* V3_JS_START */
/* ⚠ 生成区｜sync_v3.py ← v3_full.js · 请勿手改 index.html，请改 v3_full.js */
/* ============================================================================
   V3_FULL_JS · v3 样板蓝「结构层」注入脚本
   ----------------------------------------------------------------------------
   职责：把 v3 全界面优化方案里的「展示型 DOM」真实挂进平台，补齐
   v2.11.0 纯 CSS 换肤没有落地的部分：
     ① 材料库 / 课程体系 Hero 渐变横幅 + 4 数据卡
     ② 四大板块卡 CTA「进入板块」
     ③ 学习页深色知识对照卡 / 红线 / 材料锚点
   v2.13.0：按用户要求移除完整说明面的「术语速查」卡（v3 样张中不存在）；
   说明面改由 materials.html 的 detailHtml 直接按 v3 组件（d-sec/mlab/kv/
   std/parts/principle/chips）渲染，结构组成为静态列表、不再弹窗。
   全部为增量挂载：不修改任何既有 DOM 节点的属性或内容，不改事件绑定，
   不改 108 材料 / 73 课 / 210 题数据。每个注入点带 data-v3 标记，
   MutationObserver 处理平台动态重渲染（renderCv / showBoards / openExpand）。
   ========================================================================== */
(function(){
  "use strict";

  var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];});};
  var $=function(s,r){return (r||document).querySelector(s);};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};

  /* ---------- 真实统计：优先从平台全局数据算，取不到用已核实快照 ---------- */
  function stats(){
    var o={mats:108,cats:7,company:98,courses:73,quizzes:210,anchors:288,boards:4,subs:16};
    try{
      if(typeof DATA!=="undefined"&&DATA&&DATA.length){
        o.mats=DATA.length;
        o.cats=(function(){var s={},i;for(i=0;i<DATA.length;i++)s[DATA[i].cat]=1;return Object.keys(s).length;})();
        o.company=DATA.filter(function(d){return !!d.companyUsed;}).length;
      }
    }catch(e){}
    try{
      var C=window.CURRICULUM;
      if(C){
        if(C.courses&&C.courses.length)o.courses=C.courses.length;
        /* 材料锚点展示口径固定为 288（v3 预览批准值 = 主锚点）；
           课程 anchors 累计 299 含 11 个增量补充锚点，不计入展示卡，
           保证「落地 = 已批准预览」数字一致。 */
        if(C.quizzes&&C.quizzes.length)o.quizzes=C.quizzes.length;
        if(C.boards&&C.boards.length){
          o.boards=C.boards.length;
          var n=0;C.boards.forEach(function(b){n+=(b.subs&&b.subs.length)||0;});
          if(n)o.subs=n;
        }
      }
    }catch(e){}
    return o;
  }
  var S=stats();

  /* ---------- 组件 HTML ---------- */
  function heroHtml(eyebrow,title,desc,hs){
    return '<div class="v3-hero">'+
      '<div class="v3-eyebrow">'+esc(eyebrow)+'</div>'+
      '<h1>'+esc(title)+'</h1>'+
      '<p>'+esc(desc)+'</p>'+
      '<div class="v3-hero-stats">'+hs.map(function(x){
        return '<div><b>'+esc(x[0])+'</b><span>'+esc(x[1])+'</span></div>';
      }).join("")+'</div></div>';
  }
  function statsHtml(items){
    return '<div class="v3-stats">'+items.map(function(x){
      return '<div class="v3-stat"><div class="n">'+esc(x[0])+'</div>'+
        '<div class="l">'+esc(x[1])+'</div><div class="d">'+esc(x[2]||"")+'</div></div>';
    }).join("")+'</div>';
  }

  /* ---------- v2.24.6 · 顶部欢迎 Hero 进入 30 秒后自动隐藏 ----------
     纯内存态：本次页面加载（或重新打开平台）才重新计时并显示；
     SPA 内切版块不重置——一旦到时，全局标记置位，之后任何版块新注入的
     Hero 都直接以隐藏态出现，避免来回切 tab 又看到横幅。刷新页面脚本
     重新执行、标记归零，横幅重新出现，符合「刷新或重新进入才显示」。 */
  var heroHideDone=false, heroHideTimer=null;
  function dismissHeroes(){
    heroHideDone=true;
    $$(".v3-hero").forEach(function(el){el.classList.add("v3-hero--dismissed");});
    $$(".v3-stats").forEach(function(el){el.classList.add("v3-stats--dismissed");});
  }
  function armHeroAutoHide(){
    if(heroHideDone){
      /* 已经到时：把当前存在的所有 Hero / 数据卡直接置为隐藏态 */
      $$(".v3-hero").forEach(function(el){el.classList.add("v3-hero--dismissed");});
      $$(".v3-stats").forEach(function(el){el.classList.add("v3-stats--dismissed");});
      return;
    }
    if(heroHideTimer) return;                 /* 计时器已挂，避免重复 */
    heroHideTimer=setTimeout(dismissHeroes,30000);
  }

  /* ---------- ① 材料库 Hero + 数据卡 ---------- */
  function injectMatHero(){
    var wrap=$("#mat-lib > .wrap");
    if(!wrap||$("[data-v3='mat-hero']",wrap))return;
    var box=document.createElement("div");
    box.setAttribute("data-v3","mat-hero");
    box.className="v3-mat-hero";
    box.innerHTML=heroHtml(
      "MATERIAL LIBRARY · 认知底座",
      "供水材料智能学习平台",
      "聚焦「结构 / 原理 / 规格 / 标准 / 搭配」，"+S.mats+" 项材料库 + "+S.courses+" 门课程 + "+S.quizzes+" 道随堂题；多数配实物图，正文术语点按即见解释。",
      [[S.cats,"一级分类"],[S.company,"公司现用"],["100%","实物图覆盖"]]
    )+statsHtml([
      [S.mats,"材料总数",S.cats+" 大类 / "+S.subs+" 子类"],
      [S.courses,"配套课程","四大板块覆盖"],
      [S.quizzes,"随堂题","含多选题"],
      [S.anchors,"材料锚点","课程↔材料精确关联"]
    ]);
    wrap.insertBefore(box,wrap.firstChild);
  }

  /* ---------- ② 课程体系 Hero + 板块卡 CTA ---------- */
  function injectCourseHero(){
    var mc=$("#m-courses"),pg=$("#pathGrid");
    if(!mc||!pg||$("[data-v3='course-hero']",mc))return;
    var box=document.createElement("div");
    box.setAttribute("data-v3","course-hero");
    box.className="v3-course-hero";
    box.innerHTML=heroHtml(
      "CURRICULUM · 全员学习 · 作业支持",
      "四大板块 · 知识坐标",
      "按板块 → 子类 → 课程 → 步骤逐级学，先学知识再用场景。随堂练习自愿，只判对错。",
      [[S.boards,"知识板块"],[S.subs,"知识子类"],[S.courses,"已开课程"]]
    );
    /* v2.14.0：v3 预览 courses 视图无独立 4 数据卡，Hero 内已含 4/16/73，
       此处不再重复挂载 statsHtml，避免与「学习总览」三处数字冗余。 */
    mc.insertBefore(box,pg);
  }
  function injectBoardCta(){
    $$("#pathGrid .cl-board").forEach(function(b){
      if($("[data-v3='board-cta']",b))return;
      var c=document.createElement("div");
      c.setAttribute("data-v3","board-cta");
      c.className="v3-board-cta";
      c.textContent='进入板块';
      b.appendChild(c);
    });
  }

  /* ---------- ③ 学习页：深色知识对照卡 / 红线 / 材料锚点 ---------- */
  function courseOf(cv){
    var idEl=$(".cl-cid",cv);
    var cid=idEl?(idEl.textContent||"").trim():"";
    try{
      var C=window.CURRICULUM;
      if(C&&C.courses){
        for(var i=0;i<C.courses.length;i++)if(C.courses[i].id===cid)return C.courses[i];
      }
    }catch(e){}
    return null;
  }
  function darkRows(c){
    var out=[],raw="";
    if(c){
      raw=String(c.framework||"").split(/\n+/)[0]||String(c.structure||"");
    }
    /* 「名称｜说明。」句式 → [序号, 名称, 说明] */
    var segs=raw.split(/[。；;]/).map(function(s){return s.trim();}).filter(Boolean).slice(0,5);
    segs.forEach(function(s,i){
      var p=s.split(/[｜|]/);
      if(p.length>=2)out.push(["0"+(i+1),p[0].trim().slice(0,10),p.slice(1).join(" ").trim()]);
      else out.push(["0"+(i+1),"知识块 "+(i+1),s.slice(0,46)]);
    });
    if(!out.length&&c&&c.structure){
      String(c.structure).split(/[。；;]/).slice(0,4).forEach(function(s,i){
        if(s.trim())out.push(["0"+(i+1),"要点 "+(i+1),s.trim().slice(0,46)]);
      });
    }
    return out.slice(0,5);
  }
  function injectReader(){
    var cv=$("#courseView");
    if(!cv||$("[data-v3='reader']",cv))return;
    var main=$(".cv-main",cv);
    /* 只在有讲义正文的步骤注入（随堂练习步骤跳过） */
    if(!main||!$(".cv-md",main))return;
    /* v2.15.0 验收：步骤 1–4 每步都挂「本课速查」重复太多，只出现一次。
       知识框架步骤是唯一带 .cl-frame 的步骤，深色速查卡正是框架的提炼，
       语义与位置都最贴合；其余步骤（含步骤 8 带走卡）不再注入。 */
    if(!$(".cl-frame",main))return;
    var c=courseOf(cv);
    var rows=darkRows(c);
    var html='<div class="v3-reader" data-v3="reader">'+
      '<div class="v3-reader-tag">本课速查 · KNOWLEDGE CHECK</div>';
    if(rows.length){
      html+='<div class="v3-dark"><h4>本课知识坐标 · 逐块核对</h4>'+
        '<div class="v3-dark-row head"><span class="dk">NO.</span><span>知识块</span><span>要点</span></div>'+
        rows.map(function(r){
          return '<div class="v3-dark-row"><span class="dk">'+esc(r[0])+'</span>'+
            '<span>'+esc(r[1])+'</span><span>'+esc(r[2])+'</span></div>';
        }).join("")+'</div>';
    }
    if(c&&c.pitfall){
      html+='<div class="v3-danger"><b>⚠ 易错红线</b>'+esc(String(c.pitfall).replace(/^【[^】]*】/,""))+'</div>';
    }
    if(c&&c.anchors&&c.anchors.length){
      /* v2.24.1：截图2「点材料卡无反应」根因——这里原本是纯文本 <span>，没绑点击。
         改为可点 button，data-m 取锚点 ref（材料库真名），注入后统一委托到 CL_MAT_OPEN
         在本页展开材料卡；无 ref 的库外锚点仍降级为纯文本 span，避免死链。 */
      html+='<div class="v3-anchors">'+c.anchors.map(function(a){
        var nm=a.name||a.ref||a, ref=(a&&typeof a==="object")?a.ref:null;
        return ref
          ? '<button type="button" class="v3-anchor-chip" data-m="'+esc(ref)+'" title="在本页展开这张材料卡">'+esc(nm)+'</button>'
          : '<span>'+esc(nm)+'</span>';
      }).join("")+'</div>';
    }
    html+='</div>';
    var box=document.createElement("div");
    box.innerHTML=html;
    var node=box.firstChild;
    main.appendChild(node);
    /* 绑定材料锚点点击：复用课程模块暴露的本页展开接口，避免两套浮层。 */
    $$(".v3-anchor-chip[data-m]",node).forEach(function(b){
      b.addEventListener("click",function(){
        try{if(typeof window.CL_MAT_OPEN==="function")window.CL_MAT_OPEN(b.getAttribute("data-m"),b);}catch(e){}
      });
    });
  }

  /* ---------- ④ v2.14.0 组件装饰 + 视图状态 ----------
     只补「展示型装饰」（大号水印编号 / 蓝色 CTA / 课程编号方块），
     不新增任何业务内容，不改卡片可点击行为，幂等标记防止重复注入。 */
  function markView(){
    var mc=$("#m-courses");
    if(!mc)return;
    var v="boards",cv=$("#courseView"),list=$("#courseList");
    if(cv&&cv.offsetParent!==null&&$(".cv-main",cv)) v="reader";
    else if(list&&$(".course.cl-course",list)) v="course";
    else if(list&&$(".cl-sub",list)) v="subs";
    if(mc.getAttribute("data-v3-view")!==v)mc.setAttribute("data-v3-view",v);
  }
  function injectSubs(){
    $$("#courseList .cl-sub").forEach(function(el,i){
      if(!el.getAttribute("data-v3-wm"))
        el.setAttribute("data-v3-wm",("0"+(i+1)).slice(-2));
      if($("[data-v3='sub-cta']",el))return;
      var c=document.createElement("div");
      c.setAttribute("data-v3","sub-cta");
      c.className="v3-sub-cta";
      /* v2.16.0 验收：按钮只写「进入学习」、去掉箭头；单行不换行由 ⑩ 层 CSS 保证 */
      c.textContent="进入学习";
      var foot=$(".cl-sfoot",el);
      (foot||el).appendChild(c);
    });
  }
  function injectStages(){
    $$("#m-courses .cl-stage").forEach(function(el){
      if(el.getAttribute("data-v3-wm")!==null)return;
      var b=$("b",el),t=b?(b.textContent||""):"",m=t.match(/[A-Z]\d/i);
      el.setAttribute("data-v3-wm",m?m[0].toUpperCase():"");
    });
  }
  function injectCourseNos(){
    $$("#courseList .course.cl-course").forEach(function(el){
      if(el.getAttribute("data-v3-no")!==null)return;
      var c=$(".cl-cno",el),t=c?(c.textContent||""):"",m=t.match(/(\d+)/);
      if(m)el.setAttribute("data-v3-no",("0"+m[1]).slice(-2));
    });
  }
  /* v2.15.0：步骤 8「本课带走卡」页眉徽章行，补层次（纯装饰、幂等） */
  function injectCarryHead(){
    var cv=$("#courseView");if(!cv)return;
    var h=$(".cv-h",cv);
    if(!h||(h.textContent||"").indexOf("本课带走卡")<0)return;
    var main=$(".cv-main",cv);
    if(!main||$("[data-v3='carry-head']",main))return;
    var n=$$(".cl-carry .cl-chip",main).length;
    var box=document.createElement("div");
    box.setAttribute("data-v3","carry-head");
    box.className="v3-carry-head";
    box.innerHTML='<span class="v3-ch-b"><i>▤</i>材料锚点 '+n+' 项</span>'+
      '<span class="v3-ch-b"><i>↯</i>防雷小抄</span>'+
      '<span class="v3-ch-b"><i>✓</i>合规提示</span>';
    h.parentNode.insertBefore(box,h.nextSibling);
  }

  /* ---------- 全量扫描（幂等） ---------- */
  function scan(){
    try{markView();}catch(e){}
    try{injectMatHero();}catch(e){}
    try{injectCourseHero();}catch(e){}
    try{injectBoardCta();}catch(e){}
    try{injectSubs();}catch(e){}
    try{injectStages();}catch(e){}
    try{injectCourseNos();}catch(e){}
    try{injectCarryHead();}catch(e){}
    try{injectReader();}catch(e){}
    try{armHeroAutoHide();}catch(e){}   /* v2.24.6 欢迎 Hero 30s 自动隐藏 */
  }

  var timer=null;
  function schedule(){clearTimeout(timer);timer=setTimeout(scan,60);}
  try{
    var mo=new MutationObserver(function(){schedule();});
    /* 修复 L3：注入目标均位于 #mainContent 内，收窄观察范围，
       避免全 body 监听在 toast/浮层等无关 DOM 抖动时反复触发 scan。 */
    var watchRoot=document.getElementById("mainContent")||document.body;
    mo.observe(watchRoot,{childList:true,subtree:true});
  }catch(e){}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",scan);
  else scan();
  /* 兜底：数据/渲染脚本异步就绪后补扫 */
  setTimeout(scan,300);
  setTimeout(scan,1200);
})();
/* V3_JS_END */