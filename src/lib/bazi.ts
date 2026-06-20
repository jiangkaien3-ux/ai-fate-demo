import { Solar } from "lunar-javascript";

const WUXING_MAP: Record<string, string> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
};


export function getHourGanZhiIndex(dayGanZhiIndex: number, hour: number): number {
  // 时干根据日干推算: 甲己日起甲子, 乙庚日起丙子, ...
  const dayStem = dayGanZhiIndex % 10;
  const startStems = [0, 2, 4, 6, 8]; // 甲0→甲0, 乙1→丙2, 丙2→戊4, 丁3→庚6, 戊4→壬8
  // 己5→甲0(同甲), 庚6→丙2, 辛7→戊4, 壬8→庚6, 癸9→壬8
  const startStem = startStems[dayStem % 5];
  const branchIndex = Math.floor((hour + 1) / 2) % 12;
  const stemIndex = (startStem + branchIndex) % 10;
  return stemIndex * 12 + branchIndex;
}

export interface BaziOutput {
  year_pillar: { stem: string; branch: string };
  month_pillar: { stem: string; branch: string };
  day_pillar: { stem: string; branch: string };
  hour_pillar: { stem: string; branch: string };
  four_pillars: string;
  day_master: string;
  day_master_wuxing: string;
  gender: string;
  wuxing_distribution: Record<string, number>;
  wuxing_summary: string;
  zodiac: string;
  lunar_birthday: string;
  shengxiao: string;
  nayin: string[];
  shishen: string[];
  hidden_stems: string[];
}

export function calculateBazi(birthDate: Date, birthHour: number, birthMinute: number, gender: string): BaziOutput {
  const solar = Solar.fromYmd(
    birthDate.getFullYear(),
    birthDate.getMonth() + 1,
    birthDate.getDate()
  );
  const lunar = solar.getLunar();

  const lunarYear = lunar.getYear();
  const lunarMonth = lunar.getMonth();
  const lunarDay = lunar.getDay();

  // 获取年柱
  const yearGanZhi = lunar.getYearInGanZhi();
  const yearGanZhiStr = yearGanZhi;

  // 获取月柱
  const monthGanZhi = lunar.getMonthInGanZhi();
  const monthGanZhiStr = monthGanZhi;

  // 获取日柱（用生日当天的干支）
  const dayGanZhi = lunar.getDayInGanZhi();
  const dayGanZhiStr = dayGanZhi;

  // 获取日干索引
  const dayStem = lunar.getDayGan();
  const dayStemIndex = "甲乙丙丁戊己庚辛壬癸".indexOf(dayStem);

  // 计算时柱
  const hourBranchIndex = Math.floor((birthHour + 1) / 2) % 12;
  const startStems = [0, 2, 4, 6, 8];
  const startStem = startStems[dayStemIndex % 5];
  const hourStemIndex = (startStem + hourBranchIndex) % 10;
  const hourStem = "甲乙丙丁戊己庚辛壬癸"[hourStemIndex];
  const hourBranch = "子丑寅卯辰巳午未申酉戌亥"[hourBranchIndex];
  const hourGanZhiStr = hourStem + hourBranch;

  // 解析四柱的干支
  const parseGanZhi = (gz: string) => ({
    stem: gz[0],
    branch: gz.substring(1),
  });

  const year = parseGanZhi(yearGanZhiStr);
  const month = parseGanZhi(monthGanZhiStr);
  const day = parseGanZhi(dayGanZhiStr);
  const hour = { stem: hourStem, branch: hourBranch };

  const four_pillars = `${yearGanZhiStr} ${monthGanZhiStr} ${dayGanZhiStr} ${hourGanZhiStr}`;
  const day_master = day.stem;
  const day_master_wuxing = WUXING_MAP[day.stem] || "";

  // 五行统计
  const stems = [year.stem, month.stem, day.stem, hour.stem];
  const branches = [year.branch, month.branch, day.branch, hour.branch];
  const allGanZhi = [...stems, ...branches];

  const wuxing_distribution: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  allGanZhi.forEach((gz) => {
    const wx = WUXING_MAP[gz];
    if (wx && wx in wuxing_distribution) {
      wuxing_distribution[wx]++;
    }
  });

  // 五行统计文字描述
  const sorted = Object.entries(wuxing_distribution)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);
  const wuxing_summary =
    sorted.length > 0
    ? sorted.map(([wx, count]) => `${wx}${count}`).join(" ")
      : "";

  // 地支藏干（简化版，取主要藏干）
  const HIDDEN_STEMS_MAP: Record<string, string[]> = {
    子: ["癸"],
    丑: ["己", "癸", "辛"],
    寅: ["甲", "丙", "戊"],
    卯: ["乙"],
    辰: ["戊", "乙", "癸"],
    巳: ["丙", "庚", "戊"],
    午: ["丁", "己"],
    未: ["己", "丁", "乙"],
    申: ["庚", "壬", "戊"],
    酉: ["辛"],
    戌: ["戊", "辛", "丁"],
    亥: ["壬", "甲"],
  };

  // 纳音（简化映射）
  const NAYIN_MAP: Record<string, string> = {
    "甲子": "海中金", "乙丑": "海中金",
    "丙寅": "炉中火", "丁卯": "炉中火",
    "戊辰": "大林木", "己巳": "大林木",
    "庚午": "路旁土", "辛未": "路旁土",
    "壬申": "剑锋金", "癸酉": "剑锋金",
    "甲戌": "山头火", "乙亥": "山头火",
    "丙子": "涧下水", "丁丑": "涧下水",
    "戊寅": "城头土", "己卯": "城头土",
    "庚辰": "白蜡金", "辛巳": "白蜡金",
    "壬午": "杨柳木", "癸未": "杨柳木",
    "甲申": "泉中水", "乙酉": "泉中水",
    "丙戌": "屋上土", "丁亥": "屋上土",
    "戊子": "霹雳火", "己丑": "霹雳火",
    "庚寅": "松柏木", "辛卯": "松柏木",
    "壬辰": "长流水", "癸巳": "长流水",
    "甲午": "沙中金", "乙未": "沙中金",
    "丙申": "山下火", "丁酉": "山下火",
    "戊戌": "平地木", "己亥": "平地木",
    "庚子": "壁上土", "辛丑": "壁上土",
    "壬寅": "金箔金", "癸卯": "金箔金",
    "甲辰": "覆灯火", "乙巳": "覆灯火",
    "丙午": "天河水", "丁未": "天河水",
    "戊申": "大驿土", "己酉": "大驿土",
    "庚戌": "钗钏金", "辛亥": "钗钏金",
    "壬子": "桑柘木", "癸丑": "桑柘木",
    "甲寅": "大溪水", "乙卯": "大溪水",
    "丙辰": "沙中土", "丁巳": "沙中土",
    "戊午": "天上火", "己未": "天上火",
    "庚申": "石榴木", "辛酉": "石榴木",
    "壬戌": "大海水", "癸亥": "大海水",
  };

  const pillarGanZhi = [yearGanZhiStr, monthGanZhiStr, dayGanZhiStr, hourGanZhiStr];
  const nayin = pillarGanZhi.map((gz) => NAYIN_MAP[gz] || "");

  // 十神（以日干为基准）
  const getShishen = (stem: string): string => {
    if (stem === day.stem) return "日主";
    const dayWxIndex = "木火土金水".indexOf(day_master_wuxing);
    const stemWxIndex = "木火土金水".indexOf(WUXING_MAP[stem] || "");
    if (dayWxIndex === -1 || stemWxIndex === -1) return "";

    const relation = (stemWxIndex - dayWxIndex + 5) % 5;
    const stemYinYang = "甲乙丙丁戊己庚辛壬癸".indexOf(stem) % 2;
    const dayYinYang = "甲乙丙丁戊己庚辛壬癸".indexOf(day.stem) % 2;
    const sameYinYang = stemYinYang === dayYinYang;

    const relations: Record<number, { yang: string; yin: string }> = {
      0: { yang: "比肩", yin: "劫财" },
      1: { yang: "食神", yin: "伤官" },
      2: { yang: "偏财", yin: "正财" },
      3: { yang: "七杀", yin: "正官" },
      4: { yang: "偏印", yin: "正印" },
    };
    const r = relations[relation];
    return sameYinYang ? r.yang : r.yin;
  };

  const shishen = stems.map(getShishen);

  const hidden_stems = branches.map((b) => HIDDEN_STEMS_MAP[b]?.join("、") || "");

  const zodiac = solar.getXingZuo();
  const lunar_birthday = `${lunarYear}年${lunarMonth}月${lunarDay}日`;

  // 生肖
  const shengxiao = lunar.getYearShengXiao();

  return {
    year_pillar: year,
    month_pillar: month,
    day_pillar: day,
    hour_pillar: hour,
    four_pillars,
    day_master,
    day_master_wuxing,
    gender,
    wuxing_distribution,
    wuxing_summary,
    zodiac,
    lunar_birthday,
    shengxiao,
    nayin,
    shishen,
    hidden_stems,
  };
}

export function buildBaziContext(bazi: BaziOutput): string {
  return `
【命盘信息】
八字：${bazi.four_pillars}
日主：${bazi.day_master}（${bazi.day_master_wuxing}）
性别：${bazi.gender}
生肖：${bazi.shengxiao}
星座：${bazi.zodiac}
农历：${bazi.lunar_birthday}

年柱：${bazi.year_pillar.stem}${bazi.year_pillar.branch}（纳音${bazi.nayin[0]}，藏干${bazi.hidden_stems[0]}，十神${bazi.shishen[0]}）
月柱：${bazi.month_pillar.stem}${bazi.month_pillar.branch}（纳音${bazi.nayin[1]}，藏干${bazi.hidden_stems[1]}，十神${bazi.shishen[1]}）
日柱：${bazi.day_pillar.stem}${bazi.day_pillar.branch}（纳音${bazi.nayin[2]}，藏干${bazi.hidden_stems[2]}，十神${bazi.shishen[2]}）
时柱：${bazi.hour_pillar.stem}${bazi.hour_pillar.branch}（纳音${bazi.nayin[3]}，藏干${bazi.hidden_stems[3]}，十神${bazi.shishen[3]}）

五行分布：${bazi.wuxing_summary}
`.trim();
}