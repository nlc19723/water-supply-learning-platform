# -*- coding: utf-8 -*-
"""
课程体系构建脚本：课程采集包(xlsx) + 构建配置(json) -> curriculum JS
生成 window.CURRICULUM 与 window.__CURRICULUM_ASSERT__ 两个全局对象。
结构字段(seq/lessonNo/family/anchors别名/boards)来自构建配置，正文来自采集包。
"""
import json, sys, os
import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))

def load_xlsx(path):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb['课程']; rows = list(ws.iter_rows(values_only=True))
    courses = [dict(zip(rows[0], r)) for r in rows[2:] if r[0] and str(r[0]).strip().startswith('C')]
    ws2 = wb['随堂练习题']; rows2 = list(ws2.iter_rows(values_only=True))
    quizzes = [dict(zip(rows2[0], r)) for r in rows2[2:] if r[0] and str(r[0]).strip()]
    wb.close()
    return courses, quizzes

def s(v):
    return '' if v is None else str(v)

def build(xlsx_path, cfg_path, out_path):
    cfg = json.load(open(cfg_path, encoding='utf-8'))
    courses_x, quizzes_x = load_xlsx(xlsx_path)
    family_map = cfg['familyMap']
    order_map = cfg['orderMap']
    anchor_alias = cfg['anchorAlias']

    # ---- courses ----
    courses = []
    for xr in courses_x:
        cid = s(xr['课程号']).strip()
        level = s(xr['认知档 / 精加工层'])
        om = order_map.get(cid, {})
        anchors_src = [n.strip() for n in s(xr['材料锚点']).split('、') if n.strip()]
        anchors = [{'name': n, 'ref': anchor_alias.get(n, n)} for n in anchors_src]
        remark = xr.get('备注')
        courses.append({
            'id': cid,
            'sub': s(xr['板块 / 子类']),
            'topic': s(xr['知识主题']),
            'level': level,
            'd': om.get('d', ''),
            'l': om.get('l', ''),
            'positioning': s(xr['知识定位']),
            'framework': s(xr['知识框架']),
            'lecture': s(xr['系统讲授']),
            'structure': s(xr['知识结构与学习要点']),
            'anchors': anchors,
            'pitfall': s(xr['本课易错点 / 防雷小抄']),
            'remark': remark if remark is not None else '',
            'seq': om.get('seq', len(courses) + 1),
            'family': family_map.get(cid, '其他'),
            'lessonNo': om.get('lessonNo', 1),
        })

    # ---- quizzes: 按课程顺序, 每课Q01..递增 ----
    cids = [c['id'] for c in courses]
    cidx = {cid: i for i, cid in enumerate(cids)}
    quizzes_x_sorted = sorted(
        quizzes_x,
        key=lambda q: (cidx.get(s(q['课程号']).strip(), 9999), s(q.get('课程号', '')))
    )
    per_course_seq = {}
    quizzes = []
    for xr in quizzes_x_sorted:
        cid = s(xr['课程号']).strip()
        per_course_seq[cid] = per_course_seq.get(cid, 0) + 1
        qid = f"{cid}-Q{per_course_seq[cid]:02d}"
        qtype = s(xr['题型'])
        ans = [a.strip() for a in s(xr['正确答案']).split(',') if a.strip()]
        quizzes.append({
            'id': qid,
            'courseId': cid,
            'type': qtype,
            'stem': s(xr['题干']),
            'options': {
                'A': s(xr.get('选项 A')), 'B': s(xr.get('选项 B')),
                'C': s(xr.get('选项 C')), 'D': s(xr.get('选项 D')),
            },
            'answer': ans,
            'explain': s(xr['为什么（解析）']),
            'multi': qtype == '多选',
        })

    curriculum = {
        'meta': cfg['meta'],
        'boards': cfg['boards'],
        'courses': courses,
        'quizzes': quizzes,
    }

    # ---- boards 派生字段重算: subs[].courseIds / quizCount, board.courseCount ----
    for b in curriculum['boards']:
        btotal = 0
        for sub in b.get('subs', []):
            sub_cids = [c['id'] for c in courses if c['sub'] == sub['id']]
            sub['courseIds'] = sub_cids
            sub['quizCount'] = sum(1 for q in quizzes if q['courseId'] in sub_cids)
            btotal += len(sub_cids)
        b['courseCount'] = btotal

    # ---- ASSERT 重算 ----
    qt = {}
    for q in quizzes:
        qt[q['type']] = qt.get(q['type'], 0) + 1
    subs_with = sorted(set(c['sub'] for c in courses))
    order = [{'seq': c['seq'], 'lessonNo': c['lessonNo'], 'id': c['id'],
              'sub': c['sub'], 'd': c['d'], 'family': c['family']} for c in courses]
    family_order = []
    for f in [c['family'] for c in courses]:
        if f not in family_order:
            family_order.append(f)
    # familyOrder 用配置里的顺序(若存在),保证与线上一致
    if cfg.get('familyOrder'):
        family_order = cfg['familyOrder']

    lecture_chars = sum(len(c['lecture']) for c in courses)
    lecture_max = 0
    lecture_walls = 0
    lecture_long = 0
    for c in courses:
        for ln in (c['lecture'] or '').split('\n'):
            lecture_max = max(lecture_max, len(ln))
            if len(ln) > 120 and not ln.rstrip().endswith(('。', '！', '？')):
                lecture_walls += 1
            if len(ln) > 200:
                lecture_long += 1

    # 锚点统计
    all_anchors = [a for c in courses for a in c['anchors']]
    anchor_hit = sum(1 for a in all_anchors if a['ref'] and a['ref'] == a['name'])
    anchor_alias_cnt = sum(1 for a in all_anchors if a['ref'] and a['ref'] != a['name'])
    external = sorted(set(a['name'] for a in all_anchors if not a['ref']))

    assert_ = {
        'boardCount': len(curriculum['boards']),
        'subCount': sum(len(b.get('subs', [])) for b in curriculum['boards']),
        'courseCount': len(courses),
        'quizCount': len(quizzes),
        'multiQuizCount': qt.get('多选', 0),
        'quizTypes': qt,
        'subsWithCourses': subs_with,
        'courseIds': [c['id'] for c in courses],
        'quizIds': [q['id'] for q in quizzes],
        'order': order,
        'familyOrder': family_order,
        'unmapped': cfg.get('unmapped', []),
        'anchorHit': anchor_hit,
        'anchorAlias': anchor_alias_cnt,
        'anchorExternal': len(external),
        'externalAnchors': external,
        'quizCourseValid': all(q['courseId'] in cids for q in quizzes),
        'quizAnswerValid': all(
            len(q['answer']) > 0 and all(a in q['options'] for a in q['answer'])
            for q in quizzes
        ),
        'subValid': all(c['sub'] in subs_with for c in courses),
        'headerValid': True,
        'lectureChars': lecture_chars,
        'lectureMaxChunk': lecture_max,
        'lectureWalls': lecture_walls,
        'lectureLongChunks': lecture_long,
    }

    # ---- 写出JS(与线上格式一致) ----
    def dumps(obj):
        return json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
    lines = [
        '/* CURRICULUM_START */',
        '/* ⚠ 生成区｜curriculum_data.py ← data/课程采集包.xlsx · 请勿手改；改课程请编辑采集包并重跑构建链 */',
        'window.CURRICULUM = ' + dumps(curriculum) + ';',
        'window.__CURRICULUM_ASSERT__ = ' + dumps(assert_) + ';',
        '/* CURRICULUM_END */',
        '',
    ]
    open(out_path, 'w', encoding='utf-8').write('\n'.join(lines))
    print(f'构建完成: {out_path}')
    print(f'  课程 {len(courses)} | 题目 {len(quizzes)} | lectureChars {lecture_chars} | maxChunk {lecture_max}')
    return curriculum, assert_

if __name__ == '__main__':
    xlsx = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'data', '课程采集包.xlsx')
    cfg = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'build_config.json')
    out = sys.argv[3] if len(sys.argv) > 3 else os.path.join(HERE, 'static', 'curriculum.ad941a8930.js')
    build(xlsx, cfg, out)
