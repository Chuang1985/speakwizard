/*
 * 故事柑仔店島：內容設定
 *
 * 要改島的位置、加橋、加居民，都只改這個檔案。
 * 故事資料來自網站的 data/index.js（POSTS），島上的故事數量與清單會自動算。
 */

// 故事連結的根網址
export const BASE = "https://chuang1985.github.io/speakwizard/";

// 外框顏色：語巫一種，之後加的居民依人神鬼妖分色
export const OUTLINE = {
  wizard: "#ffc93c", // 柑仔黃
  人: "#f08a4b",
  神: "#e8513f",
  鬼: "#7fd6e8",
  妖: "#8fd16a",
};

// 5 區圍成五角形，人物ㄤ仔標在中間（人間是人神鬼妖交會的地方）
// 每座島離中央多遠，依兩座島的實際大小決定，島緣之間只留 GAP 寬的海，橋才不會太長
const GAP = 4;
const radiusOf = (rings, size = 1.3) => rings * Math.sqrt(3) * size + size; // 六角磚島的外接半徑
const CENTER_R = radiusOf(8); // 中央人物區是 8 圈
const ring = (i, rings) => {
  const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
  const R = CENTER_R + radiusOf(rings) + GAP;
  return [Math.cos(a) * R, Math.sin(a) * R];
};

export const ZONES = [
  { id: "ang", name: "人物ㄤ仔標", cat: "人物ㄤ仔標", page: "paopao.html#ang", theme: "oldstreet", ground: "#8fa862", pos: [0, 0],
    tagline: "人世間的悲歡喜樂，一枚一枚收集",
    // 六角磚版・老街棋盤巷弄：中間一條紅磚老街穿過戲院前廣場，上下各兩條橫巷、左右兩條直巷
    // 第 3 巷是夜市（頭上掛燈泡），第 -6 巷是鐵道邊（站牌一字排開）
    layout: { kind: "tiles", plan: "grid", rings: 8, size: 1.3, seed: 11, gate: "人物ㄤ仔標", gateStyle: "town", decor: "town",
      rows: { 0: "main", 3: "night", "-3": "alley", 6: "alley", "-6": "rail" }, cols: [-4, 4],
      colors: { ground: "#8fa862", ground2: "#9ab26a", roadEdge: "#7a6a58", water: "#3a8aa8", main: "#b8a48a", flower: "#7fa058",
        roads: { main: "#b9673f", night: "#8a7a92", alley: "#b4ab9a", rail: "#9a958a", plaza: "#d2b27a" } } },
    main: { name: "ㄤ仔標戲院", model: "theaterMain", desc: "老街正中央的老戲院，招牌上的大ㄤ仔標一直轉。人物區所有故事都在這裡上映。" },
    buildings: [
      { id: "teahouse", name: "老李的茶攤", model: "teahouse", stories: [50, 280, 281], desc: "老街口的茶攤，什麼人都會坐下來喝一杯。" },
      { id: "herb", name: "老藥房", model: "herb", stories: [55, 56, 57, 58], desc: "藥櫃一格一格，學徒在後面磨藥。" },
      { id: "spice", name: "香料行", model: "spice", stories: [63, 64, 65, 66, 67, 68], desc: "門口一排麻袋，九層塔、八角、辣椒……每一袋一個故事。" },
      { id: "fireworks", name: "煙火工坊", model: "fireworks", stories: [52, 80], desc: "煙火師傅的工坊，夜裡偶爾會冒出火花。" },
      { id: "hospital", name: "醫院", model: "hospital", stories: [86, 90], desc: "失魂的人，有時會在走廊上遇見自己。" },
      { id: "temple", name: "福德祠", model: "smallTemple", stories: [87, 233, 239], desc: "老街的土地公廟，收驚、祭解都在這裡。" },
      { id: "theater", name: "老劇場", model: "stage", stories: [104, 100, 101, 102, 103], desc: "流亡系列的舞臺，街友、寡婦、富翁、異鄉人輪番上場。" },
      { id: "storyhall", name: "說書茶樓", model: "storyhall", stories: [107, 108, 283, 282, 109, 110, 111, 284], desc: "說歷史人物的茶樓，孔子、子路、豫讓、倩女都在這裡被講起。" },
      { id: "apartment", name: "城市公寓", model: "apartment", stories: [115, 116, 117, 118, 119], desc: "鐵窗、冷氣機、晾衣服，一扇窗一個城市人物。" },
      { id: "backyard", name: "柑仔店後院", model: "backyard", stories: [122, 123, 124, 125], desc: "語巫們下班後的日常，老闆娘、老闆、小二、剪溜都在這裡。" },
      { id: "cemetery", name: "老墓園", model: "cemetery", stories: [28, 39, 40, 299], where: "outer", desc: "守墓人看守的老墓園，七月半特別熱鬧。" },
      { id: "mountain", name: "山溪口", model: "mountain", stories: [93, 94, 95, 96, 97, 89], where: "outer", desc: "老街盡頭往山裡去的溪口，森林救火隊就駐在這裡。" },
      { id: "harbor", name: "漁港", model: "harbor", stories: [72], where: "water", desc: "老街外的小漁港，漁船夜裡亮著燈。" },
    ],
    series: [
      { match: "臺灣小吃系列", label: "夜市小吃攤", template: "stall", where: "row:3", desc: "夜市巷子裡的一攤，招牌寫著一道小吃，也寫著一個人。" },
      { match: "職業系列", label: "亭仔腳店面", template: "shophouse", where: "lots:0", desc: "老街亭仔腳下的店面，一間一種行業。" },
      { match: "老街人物系列", label: "亭仔腳店面", template: "shophouse", where: "lots:0", desc: "老街亭仔腳下的店面，一間一種行業。" },
      { match: "民俗系列", label: "廟埕民俗桌", template: "folk", where: "row:-3", desc: "廟埕旁擺開的供桌，寫著一樁民俗。" },
      { match: "過劫系列", label: "節慶燈架", template: "festival", where: "row:6", desc: "一年一度的節慶燈，每一盞都是一場劫。" },
      { match: "地方系列", label: "鐵道站牌", template: "station", where: "row:-6", desc: "鐵道邊的站牌，一站一個地方的故事。" },
    ],
    fallback: { label: "ㄤ仔標", template: "angbiao", where: "side", desc: "立在巷口的一張大ㄤ仔標。" } },
  { id: "shen", name: "神明集郵冊", cat: "神明集郵冊", page: "paopao.html#shen", theme: "temple", ground: "#a7a25e", pos: ring(0, 7),
    tagline: "一尊一尊collect起來的神明故事",
    // 六角磚版・進香中軸線：整座島轉向人間，一條筆直的進香道從牌樓直通天后宮
    // 兩旁的陽廊（第 3 列，光明燈）與陰廊（第 -3 列，地府眾神的小龕）平行；兩側的廟成對排列
    layout: { kind: "tiles", plan: "grid", align: "entry", entry: "ang", mirror: true, mainFace: Math.PI / 2,
      rings: 7, size: 1.3, seed: 23, gate: "神明集郵冊", gateStyle: "town", decor: "temple",
      rows: { 0: "axis", 3: "yang", "-3": "yin" }, cols: [-5, 5],
      colors: { ground: "#a9a46a", ground2: "#b4ae74", roadEdge: "#7a6a58", water: "#3a8aa8", main: "#c9b088", flower: "#8fa058",
        roads: { axis: "#d8cdb0", yang: "#d2b27a", yin: "#8a8298", alley: "#bdb49e", plaza: "#cbbf9c" } } },
    main: { name: "天后宮", model: "mazuTemple", stories: [44, 129], desc: "進香中軸線盡頭的天后宮，媽祖坐鎮。神明區所有故事都在這裡。" },
    // 第一層・地標：沒有 where 的從入口往裡、左右成對排
    buildings: [
      { id: "bell", name: "鐘樓・千里眼", model: "bellTower", stories: [308], desc: "左鐘右鼓，千里眼在鐘樓上看遍四方。" },
      { id: "drum", name: "鼓樓・聞聲救苦", model: "drumTower", stories: [309], desc: "鼓聲傳得遠，聽得見人間的求救。" },
      { id: "tudi", name: "土地公廟", model: "tudiTemple", stories: [43, 293], desc: "最親近人的神明，管的是一方土地。" },
      { id: "chenghuang", name: "城隍廟", model: "chenghuangTemple", stories: [353, 330], desc: "陰陽秩序的守護者，門上掛著大算盤。" },
      { id: "yuelao", name: "月老祠", model: "yuelaoTemple", stories: [132, 289, 290, 228], desc: "紅線牽了滿院子，定婚店也在這裡。" },
      { id: "zhusheng", name: "註生娘娘廟", model: "zhushengTemple", stories: [41, 131, 287, 288], desc: "註生也註死，娘娘們管著人的來與去。" },
      { id: "guandi", name: "關帝廟", model: "guandiTemple", stories: [42, 321], desc: "門口立著大刀，關平捧印守在一旁。" },
      { id: "wenchang", name: "文昌祠", model: "wenchangTemple", stories: [317, 318], desc: "考生最愛拜的地方，旁邊還有一座惜字亭。神職考試也在這裡舉行。" },
      { id: "wangye", name: "王爺府", model: "wangyeTemple", stories: [310], desc: "王爺維安部隊的總部，令旗插滿門口。" },
      { id: "church", name: "教堂", model: "church", stories: [76], desc: "神明區裡也有一座小教堂，大家各拜各的，相安無事。" },
      { id: "shanshen", name: "山神祠", model: "shanshenShrine", stories: [130, 314], desc: "山腳下的石祠，山神、魔神仔和人在這裡碰面。" },
      { id: "heshen", name: "河神廟", model: "heshenShrine", stories: [133, 315], desc: "水邊的小廟，河神的尾牙每年都辦得很熱鬧。" },
      { id: "dashiye", name: "大士爺祭壇", model: "dashiye", stories: [197], desc: "普渡時立起的大士爺，看管著好兄弟。" },
      { id: "patrol", name: "日夜巡守亭", model: "patrol", stories: [348, 349], desc: "日遊神、夜遊神輪班的地方，舉頭三尺都看得到。" },
      { id: "wangchuan", name: "王船", model: "wangchuan", stories: [311, 214], where: "water", desc: "靠在水邊的王船，押煞出海的日子快到了。" },
    ],
    series: [
      { match: "地府系列", label: "陰廊小龕", template: "yinkan", where: "row:-3", desc: "陰廊上的小龕，供著來神明區作客的地府眾神。" },
    ],
    fallback: { label: "光明燈", template: "lightlamp", where: "row:3", desc: "陽廊上的一座光明燈，點亮一篇故事。" } },
  { id: "hun", name: "幽魂綿綿冰", cat: "幽魂綿綿冰", page: "paopao.html#hun", theme: "underworld", ground: "#56507a", pos: ring(1, 7),
    tagline: "沁涼入骨的鬼與地府故事",
    // 六角磚版・地府旅程：一條黃泉路從外緣盤旋到中央森羅殿
    // 第 6 圈黃泉路（黃石）→ 第 4 圈審判之路 → 第 2 圈森羅殿前廣場；每圈在河的那一側斷開，往內轉
    layout: { kind: "tiles", plan: "spiral", rings: 7, size: 1.3, seed: 7, gate: "鬼門關", entry: "ang",
      colors: { ground: "#5c547c", ground2: "#685f8a", roadEdge: "#80769e", water: "#2a8a9a", main: "#3e3858", flower: "#4c4470",
        roads: { 6: "#cdb57c", 4: "#b4aad0", 2: "#9a90b8" } } },
    main: { name: "酆都森羅殿", model: "main", desc: "地府的總殿，也是地府旅程的終點。這一區所有鬼與地府故事都收在殿裡。" },
    // 第一層・地標：沒有 where 的照陣列順序排成旅程的一站一站
    buildings: [
      { id: "bianhua", name: "彼岸花田", model: "bianhua", stories: [182], desc: "黃泉路旁開滿的紅花，旅程從這裡開始。" },
      { id: "wangxiang", name: "望鄉臺", model: "wangxiang", stories: [183], desc: "登上去，可以最後看一眼家鄉。" },
      { id: "waiting", name: "審判等待室", model: "waiting", stories: [184, 181, 295], desc: "叫號燈一直閃，排隊等審判的地方。" },
      { id: "qinguang", name: "第一殿・秦廣王殿", model: "qinguang", stories: [185, 328], desc: "亡者進地府的第一站，殿前孽鏡照出一生功過。" },
      { id: "guizu", name: "鬼卒營", model: "guizu", stories: [338, 339, 332], desc: "鬼卒們的營房與操練場。" },
      { id: "wangsi", name: "枉死城", model: "wangsi", stories: [343, 347, 350, 351], desc: "枉死者暫住的城，保安工作不好當。" },
      { id: "yanluo", name: "第五殿・閻羅殿", model: "yanluo", stories: [189, 331, 300], desc: "閻羅王坐鎮的大殿，文判在旁記錄。" },
      { id: "jike", name: "饑渴廠", model: "jike", stories: [187], desc: "煙囪整天冒煙的地府工廠。" },
      { id: "gongyang", name: "供養閣", model: "gongyang", stories: [188], desc: "陽間燒來的供品，都先送到這裡。" },
      { id: "luoyin", name: "觀落陰壇", model: "luoyin", stories: [190], desc: "蒙上紅巾，活人也能下來走一趟。" },
      { id: "mengpo", name: "孟婆亭", model: "mengpo", stories: [335], desc: "喝一碗湯，前塵往事都放下。" },
      { id: "zhuanjie", name: "轉劫所", model: "zhuanjie", stories: [191], desc: "輪迴大輪轉個不停，下一世從這裡出發。" },
      { id: "ice", name: "綿綿冰攤", model: "ice", stories: [19, 29, 30, 31, 296], where: "entrance", desc: "鬼門關口的招牌冰店，七月半的故事都在這裡。" },
      { id: "ferry", name: "三途河渡口", model: "ferry", stories: [32, 33, 34, 37, 294, 329], where: "water", desc: "引渡人撐船渡亡魂的碼頭，黃泉路在這裡轉進內圈。" },
    ],
    // 第二層・系列街坊、第三層・路標：沒被地標收走的故事，依系列自動放
    series: [
      { match: "地方系列", label: "有應公小祠", template: "shrine", where: "outer", desc: "地方傳說的小祠。島外緣一整排，都是陽間流傳的鬼故事。" },
      { match: "民俗系列", label: "禁忌告示", template: "notice", where: "side:6", desc: "黃泉路邊的禁忌告示，陽間的老規矩寫在這裡。" },
      { match: "過劫系列", label: "劫數石碑", template: "stele", where: "side:4", desc: "記下一場劫數的石碑。" },
    ],
    fallback: { label: "黃泉路燈", template: "lantern", where: "side", desc: "黃泉路上的一盞紙燈籠，照著一篇故事。" } },
  { id: "yao", name: "妖怪作業簿", cat: "妖怪作業簿", page: "paopao.html#yao", theme: "yokai", ground: "#5e8a4c", pos: ring(2, 6),
    tagline: "純妖怪的生態觀察簿",
    // 六角磚版・會迷路的山徑：每個路口一條彎彎曲曲的小徑走到中央空地，途中岔出很多支線，
    // 支線盡頭多半是妖怪的家，也有走到底什麼都沒有的死路。地形有高有低。
    layout: { kind: "tiles", plan: "trails", rings: 6, size: 1.3, seed: 31, branches: 16, gate: "妖怪作業簿", gateStyle: "forest", decor: "forest", entry: "ang",
      colors: { ground: "#5e8a4c", ground2: "#6a9656", roadEdge: "#6a5a40", water: "#2a8a8a", main: "#7a6a4a", flower: "#4f7a40",
        roads: { trail: "#b89a6a", branch: "#a88a5c", clearing: "#c4a878", exit: "#b89a6a" } } },
    main: { name: "作業簿大樟樹", model: "bookTree", desc: "森林中央一本攤開的巨大作業簿，老樟樹從書頁中間長出來。妖怪區所有觀察紀錄都寫在這裡。" },
    buildings: [
      { id: "lostsign", name: "迷路告示牌", model: "lostSign", stories: [126], desc: "指向四面八方的告示牌，黑貓常蹲在這裡發呆。" },
      { id: "bamboo", name: "竹竿鬼竹林", model: "bambooGrove", stories: [139], desc: "竹子一根比一根高，其中一根其實是竹竿鬼。" },
      { id: "cave", name: "魔神仔山洞", model: "cave", stories: [140], desc: "洞口紅紅的，進去的人常常繞不出來。" },
      { id: "strike", name: "金魅罷工棚", model: "strikeTent", stories: [138, 301, 302], desc: "金魅要加薪，罷工的布條拉了一整排。" },
      { id: "dream", name: "食夢貘夢枕屋", model: "dreamHouse", stories: [143, 305], desc: "枕頭形狀的小屋，屋頂飄著被吃掉的夢。" },
      { id: "tiger", name: "虎姑婆小屋", model: "tigerCottage", stories: [150], desc: "虎紋屋頂的小屋，煙囪冒著煙，窗台放著一罐糖。" },
      { id: "peony", name: "牡丹燈籠亭", model: "peonyPavilion", stories: [151, 303, 304], desc: "骨女提著牡丹燈籠的地方，她也有自己的煩惱。" },
      { id: "pond", name: "青蛇水潭", model: "snakePond", stories: [148], desc: "林子深處的水潭，青蛇盤在石頭上。" },
      { id: "treasury", name: "金銀鬼寶庫", model: "treasury", stories: [149], desc: "金元寶、銀元寶堆成小山，兩個鬼搶來搶去。" },
      { id: "nest", name: "妖獸巢", model: "beastNest", stories: [144], desc: "樹枝堆成的大巢，裡面有幾顆還沒孵化的蛋。" },
      { id: "junk", name: "破破妖垃圾山", model: "junkHill", stories: [147], desc: "壞掉的東西都被破破妖撿來堆在這裡。" },
      { id: "dept", name: "百貨公司", model: "deptStore", stories: [75, 2, 177], desc: "森林邊上的百貨公司，買買妖和信用卡妖怪最愛在這裡作祟。" },
      { id: "toll", name: "收費站", model: "tollBooth", stories: [73], desc: "山路口的收費站，夜裡的收費亭好像有人。" },
    ],
    series: [
      { match: "現代妖怪系列", label: "觀察紀錄牌", template: "obsPost", where: "side", desc: "插在小徑旁的觀察紀錄，記下一種現代妖怪的習性。" },
      { match: "地方系列", label: "地方古樹", template: "oldTree", where: "side", desc: "綁著紅布的老樹，守著一則地方妖怪傳說。" },
    ],
    fallback: { label: "妖怪出沒注意", template: "warning", where: "side", desc: "小徑邊的警告牌：此處有妖怪出沒。" } },
  { id: "yoyo", name: "長篇溜溜球", cat: "長篇溜溜球", page: "yoyo.html", theme: "longroad", ground: "#b39a5c", pos: ring(3, 8),
    tagline: "引渡人日記、玄墨行者，一放一收欲罷不能",
    // 六角磚版・溜溜球線般的長路：中央一顆大溜溜球，兩條「線」從它放出去，在半座島上來回折
    // 北半邊是引渡人日記的黃土路（-2、-4、-6 列），南半邊是玄墨行者的墨石路（2、4 列）
    layout: { kind: "tiles", plan: "string", rings: 8, size: 1.3, seed: 41, gate: "長篇溜溜球", gateStyle: "forest", decor: "wild", entry: "yao",
      strings: {
        yd: { rows: [-2, -4, -6], dir: 1, style: "ydr", line: "#ffb04a" },
        xm: { rows: [2, 4, 6], dir: -1, style: "xm", line: "#8ab0ff" },
      },
      colors: { ground: "#b39a5c", ground2: "#a88f52", roadEdge: "#7a6a48", water: "#3a8aa8", main: "#c9b088", flower: "#9a9a58",
        roads: { ydr: "#dcc283", xm: "#5a5866", plaza: "#d2b27a", alley: "#c4ac78", exit: "#c4ac78" } } },
    main: { name: "溜溜球塔", model: "yoyoTower", desc: "島中央的大溜溜球，一放一收。兩條長篇的線都從這裡放出去。" },
    buildings: [
      { id: "ferryStart", name: "引渡人渡口", model: "ferryStart", stories: [356], where: "anchor:start:yd", desc: "引渡人日記的第一天，從這座渡口開始。" },
      { id: "oldGhost", name: "老鬼的家", model: "oldGhostHome", stories: [453], where: "anchor:end:yd", desc: "黃土路走到盡頭，多年之後，老鬼住在這裡。" },
      { id: "academy", name: "玄墨書院", model: "inkAcademy", stories: [454], where: "anchor:start:xm", desc: "玄墨行者學道的書院，墨池邊插滿了毛筆。" },
      { id: "mountainGate", name: "下山山門", model: "mountainGate", stories: [483], where: "anchor:end:xm", desc: "學道二十八篇走完，從這座山門下山。" },
      { id: "prologue", name: "序章亭", model: "prologue", stories: [17], desc: "太陽緩緩下沉的黃土路邊，故事柑仔店的開場。" },
      { id: "spirit", name: "靈行者石像", model: "spiritStatue", stories: [162], desc: "披著斗篷、拄著長杖的行者石像。" },
      { id: "wuchangDiary", name: "白無常日記亭", model: "wuchangDiary", stories: [451, 484], desc: "白無常也寫日記，人間善惡都記在這裡。" },
    ],
    series: [
      { matchTitle: "引渡人", label: "引渡燈", template: "ferryLamp", where: "string:yd", desc: "黃土路邊的一盞引渡燈，一盞照著一天的引渡人日記。" },
      { match: "玄墨行者", label: "玄墨碑", template: "inkStele", where: "string:xm", desc: "墨石路邊的一塊玄墨碑，刻著一篇學道的故事。" },
    ],
    fallback: { label: "溜溜球路標", template: "yoyoMarker", where: "side", desc: "路邊一顆小溜溜球，掛著一篇故事。" } },
  // 老闆的地盤：老闆講古、老闆碎碎念、地方文化紀錄三個區塊，加上一棟裝下全部故事報的報刊樓
  { id: "laoban", name: "老闆的地盤", cats: ["老闆講古", "老闆碎碎念", "地方文化紀錄", "語巫故事報"], page: "index.html", theme: "storytelling", ground: "#9c9a58", pos: ring(4, 8),
    tagline: "白天講古、深夜碎碎念、出門踏查，還有每週出刊的故事報",
    layout: { kind: "tiles", plan: "sectors", rings: 8, size: 1.3, seed: 53, gate: "老闆的地盤", gateStyle: "town", decor: "scholar", entry: "ang",
      colors: { ground: "#9c9a62", ground2: "#a8a46c", roadEdge: "#7a6a58", water: "#3a8aa8", main: "#c9b088", flower: "#7a9a58",
        roads: { plaza: "#d2b27a", grid: "#c8bfa2", myth: "#b8a07a", night: "#6a7088", herb: "#a8784a", exit: "#c4ac78", alley: "#b4ab9a" } } },
    // 三個扇形區塊：從入口那一側開始，順時針排；plan 是這一塊自己的路型
    sectors: [
      { id: "jianggu", name: "老闆講古", cat: "老闆講古", page: "jianggu.html", plan: "grid9", tagline: "先秦諸子與上古神話的另類講堂" },
      { id: "suisui", name: "老闆碎碎念", cat: "老闆碎碎念", page: "suisui.html", plan: "alleys", tagline: "打烊前的深夜隨筆" },
      { id: "culture", name: "地方文化紀錄", cat: "地方文化紀錄", page: "culture.html", plan: "street", tagline: "百年中藥行探訪與田野紀錄" },
    ],
    // 不分區塊、直接收進一棟建築的分類
    towers: [{ id: "bao", name: "語巫故事報", cat: "語巫故事報", page: "bao.html", building: "newsTower", tagline: "每週日傍晚出刊的店內週報" }],
    main: { name: "老闆的家", model: "bossHome", stories: [7, 14, 12, 13, 21, 23, 25, 174], desc: "老闆住的透天厝，書房燈常亮到半夜。語巫們的自我介紹都收在這裡。" },
    buildings: [
      // 報刊樓：全部的語巫故事報都在這一棟，一層一層的報架
      { id: "newsTower", name: "語巫報刊樓", model: "newsTower", storiesCat: "語巫故事報", where: "inner", desc: "語巫故事報的大樓，一層一層都是報架，從創刊號到最新一期全部在這裡。" },
      // 講古區塊：先秦諸子各占一院
      { id: "xingtan", sector: "jianggu", name: "孔子杏壇", model: "xingtan", stories: [194, 199], desc: "杏花樹下的講台，孔子帶著學生到處碰壁的故事。" },
      { id: "mengzi", sector: "jianggu", name: "孟子書院", model: "mengziHall", stories: [200, 262], desc: "孟子教你辯論的書院，門口兩座辯論台。" },
      { id: "laozi", sector: "jianggu", name: "老子青牛亭", model: "laoziPavilion", stories: [246, 277], desc: "老子騎青牛出關前歇腳的亭子。" },
      { id: "xunhan", sector: "jianggu", name: "荀韓學舍", model: "xunhanSchool", stories: [268, 269], desc: "荀子和他的學生韓非子，一個壯遊、一個死於同門。" },
      { id: "zhuangzi", sector: "jianggu", name: "莊子天橋說書攤", model: "zhuangziStall", stories: [278], desc: "天橋底下的說書攤，蝴蝶飛來飛去。" },
      { id: "mozi", sector: "jianggu", name: "墨子機關工坊", model: "moziWorkshop", stories: [286, 291, 297], desc: "戰國武裝幫派的總部，齒輪一直在轉。" },
      { id: "zouyan", sector: "jianggu", name: "騶衍觀星台", model: "zouyanObservatory", stories: [307], desc: "先秦的奇異博士在這裡觀星，談五行與九州。" },
      { id: "liezi", sector: "jianggu", name: "列子射箭場", model: "liziRange", stories: [312], desc: "列子射箭體悟人生，風一吹就飄起來。" },
      { id: "kaiming", sector: "jianggu", name: "開明獸門", model: "kaimingGate", stories: [247], desc: "九頭身的守門人，守著通往神話大道的門。" },
      // 藥街區塊
      { id: "herbTreasure", sector: "culture", name: "中藥行尋寶館", model: "herbTreasure", stories: [496, 497, 498], desc: "百子櫃、藥船、炒杜仲，中藥行的寶貝都在這裡。" },
    ],
    series: [
      { match: "中國神話英雄系列", label: "神話大道雕像", template: "heroMonument", where: "sectorRoad:jianggu:myth", desc: "神話大道旁的一尊雕像，講一位上古神話英雄。" },
      { matchCat: "老闆碎碎念", label: "深夜小屋", template: "nightWindow", where: "sector:suisui", desc: "深夜窄巷裡亮著燈的小屋，一扇窗一篇老闆的碎碎念。" },
      { matchCat: "地方文化紀錄", label: "百年中藥行", template: "herbShop", where: "sector:culture", desc: "藥街上的一間百年中藥行，一間一篇田野紀錄。" },
    ],
    fallback: { label: "講古書架", template: "bookStand", where: "side", desc: "路邊一座小書架，放著一篇故事。" } },
];

// 橋：外圈相鄰的區互通，中間的人間連到神、鬼、妖與地方
export const BRIDGES = [
  ["shen", "hun"], ["hun", "yao"], ["yao", "yoyo"], ["yoyo", "laoban"], ["laoban", "shen"],
  ["ang", "shen"], ["ang", "hun"], ["ang", "yao"], ["ang", "yoyo"], ["ang", "laoban"],
];

// 語巫：model 對應 island.js 裡的造型；alias 用來找他出場的故事（POSTS 的 a 欄位）
export const WIZARDS = [
  { id: "boss", name: "老闆", role: "賣語者", model: "boss", home: "laoban", homeB: "main", page: "story/s026.html", alias: ["老闆"],
    speed: 2.1, cross: 0.35,
    desc: "肚子微凸卻滿腹經綸的中年大叔，碎碎念與講古專欄主筆。",
    lines: ["人生苦短，不如聽個故事解解悶？", "今天講哪一段古好呢……", "老闆娘沒看到我吧？"] },
  { id: "bossy", name: "老闆娘", role: "搶語者", model: "bossy", home: "ang", homeB: "backyard", page: "story/s018.html", alias: ["老闆娘"],
    speed: 2.4, cross: 0.3,
    desc: "柑仔店背後看不見的那隻手，說一老闆絕不敢說二。",
    lines: ["老闆又跑去哪裡偷懶了？", "這個故事，我收下了。", "貨架上的灰是誰的？"] },
  { id: "xiaoer", name: "店小二", role: "換語者", model: "xiaoer", home: "laoban", homeB: "newsTower", page: "story/s020.html", alias: ["小二", "店小二"],
    speed: 2.8, cross: 0.4,
    desc: "長相清秀、打扮中性的打雜擔當，替小店整理貨架。",
    lines: ["這箱故事瓶要送去哪一區？", "貨架整理好了，下一區！", "週報印好了嗎？"] },
  { id: "cat", name: "黑貓", role: "取語者", model: "cat", home: "yao", homeB: "lostsign", page: "story/s022.html", alias: ["黑貓"],
    speed: 2.6, cross: 0.6, // 常迷路，所以特別愛跨區
    desc: "蹲在舊行李箱上的一團黑毛，收故事，也常迷路。",
    lines: ["喵……這裡是哪一區？", "又迷路了。", "這個故事聞起來不錯。"] },
  { id: "jianliu", name: "剪溜", role: "偷語者", model: "jianliu", home: "hun", page: "story/s024.html", alias: ["剪溜"],
    speed: 2.3, cross: 0.45,
    desc: "外派小偷，專偷人鬼故事，《引渡人日記》當事鬼。",
    lines: ["噓，我只是路過。", "人鬼故事，剪一段帶走。", "地府那邊又在審誰？"] },
];

// 本店：會沿著橋在各區之間移動，到一區停一下
export const SHOP = {
  id: "shop", name: "故事柑仔店", role: "本店", home: "ang", page: "index.html",
  speed: 1.4, stay: [20, 32],
  desc: "太陽緩緩下沉，巷仔口浮現一塊柑仔店招牌。這裡專營「人」「神」「鬼」「妖」四類故事。",
};

// 居民：type 決定外框顏色；homeB 是住的建築；stories 是他出場的故事 id
// 目前先放幽魂區（樣品區）的 13 位，其他區等樣品確認後再加
export const RESIDENTS = [
  { id: "yanluo", name: "閻羅王", type: "神", model: "yanluo", home: "hun", homeB: "yanluo", stories: [331, 189], speed: 1.6, cross: 0.05,
    desc: "地府第五殿的主審，黑臉大鬍子，判案比誰都快。", lines: ["下一位！", "陽間的功過，都寫在簿子上。"] },
  { id: "qinguang", name: "秦廣王", type: "神", model: "qinguang", home: "hun", homeB: "qinguang", stories: [328, 185], speed: 1.6, cross: 0.05,
    desc: "第一殿的王，每天寫日記，也每天照孽鏡。", lines: ["今天的日記還沒寫。", "鏡子不會說謊。"] },
  { id: "wenpan", name: "閻羅文判", type: "神", model: "wenpan", home: "hun", homeB: "yanluo", stories: [300, 189], speed: 1.9, cross: 0.1,
    desc: "拿著判官筆的書記官，生死簿上一筆一劃都是他寫的。", lines: ["這一筆不能寫錯。", "簿子又滿了一本。"] },
  { id: "dizang", name: "地藏王", type: "神", model: "dizang", home: "hun", homeB: "zhuanjie", stories: [342], speed: 1.3, cross: 0.15,
    desc: "發願地獄不空不成佛，最常聽亡魂訴說不甘。", lines: ["世間最多是不甘。", "慢慢走，不急。"] },
  { id: "zhongkui", name: "鍾馗", type: "神", model: "zhongkui", home: "hun", homeB: "guizu", stories: [344], speed: 2.2, cross: 0.3,
    desc: "地府的反恐隊長，鬍子很兇，心很軟。", lines: ["哪裡有邪祟？", "收工後想喝一杯。"] },
  { id: "baiwuchang", name: "白無常", type: "鬼", model: "baiwuchang", home: "hun", homeB: "waiting", stories: [322, 323], speed: 2.3, cross: 0.35,
    desc: "白衣高帽，一手無常扇，常到陽間辦差。", lines: ["一見生財～", "這位，該上路囉。"] },
  { id: "heiwuchang", name: "黑無常", type: "鬼", model: "heiwuchang", home: "hun", homeB: "waiting", stories: [324, 325], speed: 2.3, cross: 0.35,
    desc: "黑衣高帽，撐著無常傘，跟白無常是老搭檔。", lines: ["別想跑。", "傘下說話。"] },
  { id: "mengpo", name: "孟婆", type: "鬼", model: "mengpo", home: "hun", homeB: "mengpo", stories: [335], speed: 1.4, cross: 0.05,
    desc: "端著湯碗的老婆婆，一碗湯讓人放下前世。", lines: ["趁熱喝。", "喝了就不痛了。"] },
  { id: "niutou", name: "牛頭將軍", type: "鬼", model: "niutou", home: "hun", homeB: "guizu", stories: [336], speed: 2.0, cross: 0.1,
    desc: "地府的門神將軍，牛角很硬，脾氣也硬。", lines: ["站好！", "誰在城門口逗留？"] },
  { id: "guizu", name: "火爆鬼卒", type: "鬼", model: "guizu", home: "hun", homeB: "guizu", stories: [338, 339], speed: 2.8, cross: 0.15,
    desc: "頭上冒火的鬼卒，鬼卒法則背得滾瓜爛熟。", lines: ["鬼卒法則第一條！", "火氣很大，別惹我。"] },
  { id: "touqi", name: "頭七阿嬤", type: "鬼", model: "touqi", home: "hun", homeB: "wangxiang", stories: [296, 30], speed: 1.5, cross: 0.4,
    desc: "頭七那天要回家看看的阿嬤，菜籃裡裝著孫子愛吃的菜。", lines: ["回去看一下孫仔。", "有沒有記得吃飯？"] },
  { id: "yinduren", name: "老鳥引渡人", type: "鬼", model: "yinduren", home: "hun", homeB: "ferry", stories: [329, 294, 32], speed: 1.8, cross: 0.25,
    desc: "撐船的資深引渡人，《引渡人日記》的老前輩。", lines: ["上船，坐穩。", "這條河我走了幾百年。"] },
  { id: "feixia", name: "黃衣小飛俠", type: "鬼", model: "feixia", home: "hun", homeB: "waiting", stories: [202], speed: 2.4, cross: 0.3,
    desc: "穿著黃色雨衣的身影，地方傳說裡的那一位。", lines: ["……", "下雨了嗎？"] },

  // ===== 人物ㄤ仔標 =====
  { id: "laoli", name: "茶攤老李", type: "人", model: "laoli", home: "ang", homeB: "teahouse", stories: [50, 280, 281], speed: 1.5, cross: 0.05,
    desc: "老街口擺茶攤的老李，什麼故事都聽過一輪。", lines: ["來，坐下喝杯茶。", "這條街我看了四十年。"] },
  { id: "zhouyeye", name: "鹹粥爺爺", type: "人", model: "zhouyeye", home: "ang", homeB: "p276", stories: [276], speed: 1.3, cross: 0.05,
    desc: "夜市裡熬鹹粥的爺爺，一碗粥熬一整晚。", lines: ["粥要慢慢熬。", "趁燒呷。"] },
  { id: "xuetu", name: "老藥房學徒", type: "人", model: "xuetu", home: "ang", homeB: "herb", stories: [56, 57, 58], speed: 2.4, cross: 0.2,
    desc: "老藥房的學徒，背藥方背到睡著。", lines: ["當歸、川芎、白芍……", "師父又出新考題了。"] },
  { id: "kongzi", name: "孔子", type: "人", model: "kongzi", home: "ang", homeB: "storyhall", stories: [107, 108, 283, 282], speed: 1.4, cross: 0.25,
    desc: "說書茶樓裡被講起的喪家狗，帶著學生到處碰壁。", lines: ["吾十有五而志於學。", "子路，走了。"] },
  { id: "tugong", name: "土公仔", type: "人", model: "tugong", home: "ang", homeB: "p245", stories: [245], speed: 1.8, cross: 0.3,
    desc: "撿骨、造墓的老師傅，常往墓園和地府那頭走。", lines: ["人走了，總要有人送。", "今天天氣適合動土。"] },
  { id: "jitong", name: "乩童", type: "人", model: "jitong", home: "ang", homeB: "temple", stories: [255], speed: 2.2, cross: 0.25,
    desc: "福德祠的乩童，坐禁的日子不吃不睡。", lines: ["神明有話要說。", "閃開，閃開！"] },
  { id: "yanhuo", name: "煙火師傅", type: "人", model: "yanhuo", home: "ang", homeB: "fireworks", stories: [52], speed: 1.9, cross: 0.1,
    desc: "老街的煙火師傅，手上永遠有火藥味。", lines: ["今晚放一場給大家看。", "火光一閃就過了。"] },
  { id: "shoumu", name: "守墓人", type: "人", model: "shoumu", home: "ang", homeB: "cemetery", stories: [39], speed: 1.3, cross: 0.15,
    desc: "提燈守著老墓園的人，跟墓裡的鄰居都很熟。", lines: ["晚安，各位。", "七月要到了。"] },
  { id: "bapu", name: "叭噗伯", type: "人", model: "bapu", home: "ang", homeB: "p51", stories: [51], speed: 1.6, cross: 0.15,
    desc: "推著叭噗車在巷子裡繞的伯伯，喇叭一按小孩就跑出來。", lines: ["叭——噗！", "芋頭口味的還有喔。"] },
  { id: "shangban", name: "上班族", type: "人", model: "shangban", home: "ang", homeB: "apartment", stories: [115], speed: 2.9, cross: 0.2,
    desc: "城市公寓裡的上班族，每天在老街和捷運之間來回。", lines: ["要遲到了！", "好煩，上班到底為了什麼。"] },

  // ===== 神明集郵冊 =====
  { id: "mazu", name: "媽祖", type: "神", model: "mazu", home: "shen", homeB: "main", stories: [129, 44], speed: 1.3, cross: 0.1,
    desc: "天后宮的主神，戴著鳳冠，海上的人都靠她平安回家。", lines: ["出海平安。", "千里眼，看到了嗎？"] },
  { id: "tudigong", name: "土地公", type: "神", model: "tudigong", home: "shen", homeB: "tudi", stories: [293, 43], speed: 1.4, cross: 0.35,
    desc: "笑咪咪的白鬍子老神明，常拄著拐杖到人間巡田。", lines: ["呷飽未？", "這塊地我顧著。"] },
  { id: "yuelao", name: "月老", type: "神", model: "yuelao", home: "shen", homeB: "yuelao", stories: [289, 132, 290], speed: 1.5, cross: 0.3,
    desc: "手上一捲紅線、一本姻緣簿，綁錯了也不太認錯。", lines: ["這條紅線綁給誰呢？", "緣分到了就到了。"] },
  { id: "zhusheng", name: "註生娘娘", type: "神", model: "zhusheng", home: "shen", homeB: "zhusheng", stories: [41, 131, 287], speed: 1.4, cross: 0.15,
    desc: "抱著嬰孩的娘娘，簿子上寫著誰要來、誰要走。", lines: ["乖，別哭。", "名字我記下了。"] },
  { id: "qianliyan", name: "千里眼", type: "神", model: "qianliyan", home: "shen", homeB: "bell", stories: [308], speed: 2.2, cross: 0.3,
    desc: "媽祖的左右將之一，手搭眉頭一望就是千里。", lines: ["看到了，在那邊！", "遠方有船。"] },
  { id: "wenchang", name: "文昌帝君", type: "神", model: "wenchang", home: "shen", homeB: "wenchang", stories: [317, 318], speed: 1.5, cross: 0.2,
    desc: "主管考運的神明，神職考試的出題官。", lines: ["考卷收回來。", "字寫端正一點。"] },
  { id: "guanping", name: "關平", type: "神", model: "guanping", home: "shen", homeB: "guandi", stories: [321], speed: 2.0, cross: 0.15,
    desc: "關帝身邊捧印的少年將軍。", lines: ["印在我這裡。", "父親交代的事，一定辦好。"] },
  { id: "xiaoluo", name: "王船小鑼", type: "神", model: "xiaoluo", home: "shen", homeB: "wangye", stories: [311, 310], speed: 3.0, cross: 0.3,
    desc: "王爺維安部隊裡敲鑼開路的小兵，跑得最快。", lines: ["鏘鏘——開路囉！", "王爺出巡！"] },
  { id: "shanshen", name: "山神", type: "神", model: "shanshen", home: "shen", homeB: "shanshen", stories: [130, 314], speed: 1.6, cross: 0.4,
    desc: "頭戴樹葉的山神，常去妖怪那邊找魔神仔聊天。", lines: ["山裡的事，我都知道。", "魔神仔又帶人迷路了。"] },
  { id: "chenghuang", name: "城隍爺", type: "神", model: "chenghuang", home: "shen", homeB: "chenghuang", stories: [353, 330], speed: 1.6, cross: 0.3,
    desc: "陰陽兩界的守門人，算盤一打，善惡分明。", lines: ["你來了。", "一筆一筆，算得清清楚楚。"] },
  { id: "heshen", name: "河神", type: "神", model: "heshen", home: "shen", homeB: "heshen", stories: [133, 315], speed: 1.8, cross: 0.2,
    desc: "披著魚鱗披風的河神，最期待每年的尾牙。", lines: ["今年尾牙吃什麼？", "水漲了，小心。"] },
  { id: "riyou", name: "日遊神", type: "神", model: "riyou", home: "shen", homeB: "patrol", stories: [349], speed: 2.4, cross: 0.6,
    desc: "白天巡視人間的神明，走到哪裡泡泡飄到哪裡。", lines: ["舉頭三尺有泡泡。", "白天的事我都看著。"] },
  { id: "yeyou", name: "夜遊神", type: "神", model: "yeyou", home: "shen", homeB: "patrol", stories: [348], speed: 2.4, cross: 0.6,
    desc: "夜裡巡視的神明，頭髮上長滿了眼睛。", lines: ["舉頭三尺有髮眼。", "晚上別亂跑。"] },

  // ===== 妖怪作業簿 =====
  { id: "jinmei", name: "金魅", type: "妖", model: "jinmei", home: "yao", homeB: "strike", stories: [301, 138, 302], speed: 2.2, cross: 0.25,
    desc: "做牛做馬的金魅，這次舉起牌子要求加薪。", lines: ["加薪！加薪！", "我也是有工會的。"] },
  { id: "hugupo", name: "虎姑婆", type: "妖", model: "hugupo", home: "yao", homeB: "tiger", stories: [150], speed: 1.7, cross: 0.25,
    desc: "老婆婆的打扮藏不住虎耳朵和尾巴。", lines: ["乖孫，來吃糖。", "誰在外面？"] },
  { id: "moshenzai", name: "魔神仔", type: "妖", model: "moshenzai", home: "yao", homeB: "cave", stories: [140, 314], speed: 3.0, cross: 0.4,
    desc: "戴紅帽的小個子，最愛帶人在山裡繞圈圈。", lines: ["這邊這邊～", "嘻嘻，又迷路了吧。"] },
  { id: "zhuganggui", name: "竹竿鬼", type: "妖", model: "zhuganggui", home: "yao", homeB: "bamboo", stories: [139], speed: 1.6, cross: 0.1,
    desc: "又高又瘦，站在竹林裡根本分不出來。", lines: ["……我是竹子。", "風一吹就晃。"] },
  { id: "shimengmo", name: "食夢貘", type: "妖", model: "shimengmo", home: "yao", homeB: "dream", stories: [143, 305], speed: 1.4, cross: 0.35,
    desc: "抱著枕頭的夢貘，夜裡去碎碎念那邊吃大家的惡夢。", lines: ["呼嚕……好吃的夢。", "做噩夢了嗎？給我。"] },
  { id: "gunv", name: "骨女", type: "妖", model: "gunv", home: "yao", homeB: "peony", stories: [303, 151, 304], speed: 1.5, cross: 0.3,
    desc: "提著牡丹燈籠的骨女，煩惱的事情跟人一樣多。", lines: ["燈籠又熄了。", "你看得見我嗎？"] },
  { id: "maimaiyao", name: "買買妖", type: "妖", model: "maimaiyao", home: "yao", homeB: "dept", stories: [2, 177], speed: 2.6, cross: 0.5,
    desc: "像影子一樣的妖怪，最擅長勾起人的購物慾，常溜去夜市。", lines: ["買一送一喔！", "最後一天特價！"] },
  { id: "yujing", name: "蘭潭魚精", type: "妖", model: "yujing", home: "yao", homeB: "pond", stories: [212], speed: 1.8, cross: 0.2,
    desc: "從蘭潭來的魚精，借住在青蛇的水潭。", lines: ["咕嚕咕嚕。", "水太淺了。"] },
  { id: "qingshe", name: "青蛇", type: "妖", model: "qingshe", home: "yao", homeB: "pond", stories: [148], speed: 1.9, cross: 0.15,
    desc: "盤在水潭邊的青蛇，修行很久了。", lines: ["嘶——", "別靠太近。"] },
  { id: "jinyingui", name: "金銀鬼", type: "妖", model: "jinyingui", home: "yao", homeB: "treasury", stories: [149], speed: 2.1, cross: 0.3,
    desc: "一半金一半銀的鬼，抱著元寶不肯放。", lines: ["這是我的！", "數到哪裡了？"] },

  // ===== 長篇溜溜球 =====
  { id: "xuanmo", name: "玄墨行者", type: "人", model: "xuanmo", home: "yoyo", homeB: "academy", stories: [454, 483], speed: 2.0, cross: 0.2,
    desc: "《玄墨行者》裡學道的行者，一身墨色，在墨石路上來回走。", lines: ["今天學到第幾篇了？", "下山的日子還沒到。"] },
  { id: "laogui", name: "老鬼", type: "鬼", model: "laogui", home: "yoyo", homeB: "oldGhost", stories: [453], speed: 1.3, cross: 0.15,
    desc: "《引渡人日記》後記裡的老鬼，在黃土路盡頭住了很多年。", lines: ["多年之後啊……", "那些日子，都記在燈上了。"] },

  // ===== 老闆的地盤 =====
  { id: "zhuangzi", name: "莊子", type: "人", model: "zhuangzi", home: "laoban", homeB: "zhuangzi", stories: [278], speed: 1.4, cross: 0.3,
    desc: "天橋底下的說書人，身邊總有一隻蝴蝶。", lines: ["不知是我夢蝶，還是蝶夢我。", "坐下來，聽我說一段。"] },
  { id: "mozi", name: "墨子", type: "人", model: "mozi", home: "laoban", homeB: "mozi", stories: [286, 291, 297], speed: 2.2, cross: 0.25,
    desc: "戰國武裝幫派的教父，最會做守城的機關。", lines: ["兼愛，非攻。", "這個齒輪再調一下。"] },
  { id: "laozi", name: "老子", type: "人", model: "laozi", home: "laoban", homeB: "laozi", stories: [246, 277], speed: 1.2, cross: 0.2,
    desc: "白眉白鬍的老人家，腰上掛著葫蘆，是人還是神說不準。", lines: ["慢慢來，比較快。", "青牛呢？"] },
  { id: "kuafu", name: "夸父", type: "神", model: "kuafu", home: "laoban", homeB: "kaiming", stories: [327], speed: 3.6, cross: 0.7,
    desc: "追著太陽跑的巨人，整座群島跑來跑去停不下來。", lines: ["哥追的不是日，是浪漫！", "太陽往那邊去了！"] },
  { id: "houyi", name: "后羿", type: "神", model: "houyi", home: "laoban", homeB: "liezi", stories: [355, 359], speed: 2.0, cross: 0.3,
    desc: "背著弓的射日英雄，最後死於非命。", lines: ["讓弓箭飛一會兒。", "天上只要一個太陽就好。"] },
  { id: "toujia", name: "藥行頭家", type: "人", model: "toujia", home: "laoban", homeB: "herbTreasure", stories: [496, 497, 498], speed: 1.5, cross: 0.15,
    desc: "藥街上的中藥行頭家，百子櫃每一格放什麼都背得出來。", lines: ["杜仲要炒過。", "百子櫃第三排第五格。"] },
];
