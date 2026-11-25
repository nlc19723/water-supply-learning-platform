/* ================================================================
   供水行业行话对照 · 数据文件（单一数据源）
   ----------------------------------------------------------------
   被 index.html（材料库搜索兜底）与 slang.html（独立词典页）共用。
   全局变量：window.SLANG_DATA

   分级：A=多权威来源实证；B=行业站点/厂商资料，已经业务过目；C=存疑，不收录。
   本表只收录 A/B；C 级（如"蛇皮管"）按方案红线不入库。
   材料映射 matKw：用于搜索兜底时精确指向材料库关键词（配合 matCat 分类）。
   易混组 confuses：指向另一词条 id，词典页渲染"易混对照卡"。
   审核：数据经培训中心业务人员过目；无数值安全风险。
   ================================================================ */
(function(){
  var entries=[
    /* ---------- 抢修/堵漏类 ---------- */
    {id:"hafujie", cat:"抢修堵漏", level:"A",
     slang:["哈夫节","抱箍","抢修节","快修节","补漏卡子","哈夫接头","哈夫快接"],
     term:"哈夫节（管道堵漏器/修补器）", en:"pipe repair clamp",
     desc:"两半壳体+橡胶密封+螺栓，抱住破损点带压止水。用于管道裂缝、砂眼、接口漏水的应急堵漏。",
     matKw:"哈夫节", matCat:"管道抢修器"},
    {id:"santong_hafu", cat:"抢修堵漏", level:"A",
     slang:["三通哈夫节","三通抢修节"],
     term:"三通管道堵漏器（三通抢修器）", en:"tee repair clamp",
     desc:"专用于三通部位漏水的哈夫节，两半壳体包住三通整体堵漏。",
     matKw:"哈夫节", matCat:"管道抢修器", confuses:["maan-santong"]},
    {id:"dakou", cat:"抢修堵漏", level:"A",
     slang:["打口","捻口","打口养护"],
     term:"承插接口捻口养护", en:"caulked joint",
     desc:"传统承插接口工艺：石棉绳/油麻塞入承口，用捻子逐层打实密封。多用于老式铸铁管。",
     matKw:"", matCat:""},
    {id:"nianzi", cat:"抢修堵漏", level:"A",
     slang:["捻子","石棉绳","油麻","麻丝"],
     term:"打口填料与工具", en:"caulking / oakum",
     desc:"老式接口密封材料与工具。生料带/线麻多用于丝扣密封。",
     matKw:"生料带", matCat:"辅材类"},
    {id:"daishui", cat:"抢修堵漏", level:"A",
     slang:["带水作业","带水抢修","不停水作业"],
     term:"带压作业/带压抢修", en:"live-line repair",
     desc:"管道不停水、带压力状态下的抢修作业。哈夫节、马鞍三通均属带压作业范畴。",
     matKw:"", matCat:""},

    /* ---------- 分流/增接类（易混重点） ---------- */
    {id:"maan-santong", cat:"分流增接", level:"A",
     slang:["马鞍三通","开孔三通","两合三通","鞍形增接口","鞍型管件","法兰哈夫三通"],
     term:"带压开孔三通（鞍形旁通 / tapping tee）", en:"tapping tee / saddle tee",
     desc:"骑跨在主管外壁上，配合开孔机在带压状态下钻孔接出支管，用于不停水增接分支。注意：与堵漏用的哈夫节功能不同、不可互换。",
     matKw:"鞍型管件", matCat:"管件类", confuses:["hafujie","santong_hafu"]},
    {id:"dianrong_anxing", cat:"分流增接", level:"A",
     slang:["分水鞍","鞍型三通","鞍形三通","电熔鞍形管件"],
     term:"电熔鞍形管件（electrofusion saddle fitting）", en:"electrofusion saddle",
     desc:"PE 管道上用电熔/热熔方式熔接到主管外壁的分支管件，含鞍形旁通、鞍形修补、鞍形直通。GB/T 13663.3 术语。",
     matKw:"鞍型管件", matCat:"管件类", confuses:["maan-santong"]},

    /* ---------- 管件类 ---------- */
    {id:"daxiatou", cat:"管件", level:"B",
     slang:["大小头"], term:"异径管（同心/偏心异径管）", en:"reducer",
     desc:"连接不同口径管子的管件。同心用于同轴、偏心用于保持管顶/管底平齐。",
     matKw:"异径管", matCat:"管件类"},
    {id:"huojie", cat:"管件", level:"B",
     slang:["活接","油任","活螺丝","由任"], term:"活接头（连接螺母）", en:"union",
     desc:"可拆卸的管接头，便于检修更换。PPR、衬塑管常见。",
     matKw:"活接", matCat:"管件类"},
    {id:"wantou", cat:"管件", level:"B",
     slang:["曲尺","曲头","弯头"], term:"弯头", en:"elbow",
     desc:"改变管道方向的管件，常见 90°、45°。",
     matKw:"弯头", matCat:"管件类"},
    {id:"santong", cat:"管件", level:"B",
     slang:["三路天","丁字弯","三通"], term:"三通", en:"tee",
     desc:"管道分支处管件，分等径、异径三通。",
     matKw:"三通", matCat:"管件类"},
    {id:"sitong", cat:"管件", level:"B",
     slang:["四路天","十字接头"], term:"四通", en:"cross",
     desc:"四向连接的管件。", matKw:"", matCat:""},
    {id:"taotong", cat:"管件", level:"B",
     slang:["套筒","直接头","外接头","管箍"], term:"外接头/管箍", en:"coupling",
     desc:"连接两根同径管子的短管件。", matKw:"", matCat:""},
    {id:"sidu", cat:"管件", level:"B",
     slang:["丝堵","堵头"], term:"管堵/堵头", en:"plug",
     desc:"封堵管口或丝扣端的零件。", matKw:"", matCat:""},
    {id:"mangban", cat:"管件", level:"B",
     slang:["盲板","盲法兰"], term:"法兰盖/盲板", en:"blind flange",
     desc:"封堵法兰端部的实心板，用于管路终止或隔离。",
     matKw:"盲板", matCat:"管件类"},
    {id:"shensuojie", cat:"管件", level:"B",
     slang:["伸缩节","伸缩器"], term:"补偿器/伸缩节", en:"expansion joint",
     desc:"吸收管道热胀冷缩或位移的装置，含波纹管补偿器、铸铁伸缩节。",
     matKw:"伸缩节", matCat:"补偿器类"},

    /* ---------- 阀门/计量/辅材 ---------- */
    {id:"dieffa", cat:"阀门计量", level:"B",
     slang:["碟阀"], term:"蝶阀", en:"butterfly valve",
     desc:"启闭件为蝶板的阀门，「碟」为常见误写。",
     matKw:"蝶阀", matCat:"阀门类"},
    {id:"zhafa", cat:"阀门计量", level:"B",
     slang:["明杆闸阀","暗杆闸阀","闸板阀"], term:"闸阀（明杆式/暗杆式）", en:"gate valve",
     desc:"闸板升降启闭的截断阀。明杆手轮升降可见、暗杆阀杆不外露。",
     matKw:"闸阀", matCat:"阀门类"},
    {id:"shengliaodai", cat:"阀门计量", level:"B",
     slang:["生料带"], term:"聚四氟乙烯密封带", en:"PTFE tape",
     desc:"丝扣密封填料，顺时针缠绕 5~8 圈。",
     matKw:"生料带", matCat:"辅材类"},
    {id:"xiantong", cat:"阀门计量", level:"B",
     slang:["线麻","麻丝","铅油麻丝"], term:"丝扣密封填料（麻丝+铅油）", en:"pipe thread sealant",
     desc:"传统丝扣密封材料，与生料带同属密封填料。",
     matKw:"生料带", matCat:"辅材类"},
    {id:"filter-y", cat:"阀门计量", level:"B",
     slang:["Y型过滤器","过滤器"], term:"Y型过滤器", en:"Y-strainer",
     desc:"安装在管道上过滤杂质的装置，形似 Y。",
     matKw:"Y型过滤器", matCat:"阀门类"}
  ];

  /* 易混对照卡：这些词组功能不同，需并排提示不可互换 */
  var confuseGroups=[
    {ids:["hafujie","maan-santong"],
     title:"哈夫节 vs 马鞍三通（最易混）",
     warning:"哈夫节用于【堵漏】，马鞍三通用于【带压开孔分流】——外形相似但功能不同，不可互换。用哈夫节当分水口无法保证开孔精度；用马鞍三通堵漏则密封覆盖不足。"},
    {ids:["maan-santong","dianrong_anxing"],
     title:"马鞍三通 vs 电熔鞍形管件",
     warning:"两者都用于分支，但连接方式不同：马鞍三通多为金属抱箍+机械开孔；电熔鞍形管件用于 PE 管、靠电熔/热熔连接。按管材选择，不可混用。"}
  ];

  /* 分类展示顺序 */
  var cats=["抢修堵漏","分流增接","管件","阀门计量"];

  window.SLANG_DATA={
    version:"1.0.0",
    reviewed:"2026-11-24",
    entries:entries,
    confuseGroups:confuseGroups,
    cats:cats,
    /* 归一化：去空格、小写，供模糊匹配 */
    norm:function(s){return String(s||"").replace(/\s+/g,"").toLowerCase();}
  };
})();
