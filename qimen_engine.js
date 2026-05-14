/**
 * 奇门遁甲引擎 (纯JS版)
 */

// ============ 常量 ============
const TIAN_GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const GATE_NAMES = ["休门", "死门", "伤门", "杜门", "中", "开门", "惊门", "生门", "景门"];
const GATE_WUXING = ["水", "土", "木", "木", "土", "金", "金", "土", "火"];
const GATE_JIXI = ["吉", "凶", "凶", "中", "中", "吉", "凶", "吉", "中"];

const DEITY_YANG = ["值符", "螣蛇", "太阴", "六合", "白虎", "玄武", "九地", "九天"];
const DEITY_YIN = ["值符", "九天", "地", "玄武", "白虎", "六合", "太阴", "螣蛇"];

const STAR_NAMES = ["天蓬", "天任", "天冲", "天辅", "天禽", "天心", "天柱", "天英", "天芮"];
const STAR_WUXING = ["水", "土", "木", "木", "土", "金", "金", "火", "土"];
const STAR_JIXI = ["凶", "吉", "吉", "吉", "中", "吉", "凶", "凶", "凶"];

const PALACE_MAP = { 1: "坎", 2: "坤", 3: "震", 4: "巽", 5: "中", 6: "乾", 7: "兑", 8: "艮", 9: "离" };
const PALACE_DIR = { 1: "北", 2: "西南", 3: "东", 4: "东南", 5: "中", 6: "西北", 7: "西", 8: "东北", 9: "南" };
const PALACE_WUXING = { 1: "水", 2: "土", 3: "木", 4: "木", 5: "土", 6: "金", 7: "金", 8: "土", 9: "火" };

const YI_MA = { 0: "寅", 1: "申", 2: "申", 3: "亥", 4: "寅", 5: "亥", 6: "申", 7: "寅", 8: "申", 9: "亥", 10: "寅", 11: "亥" };
const DZ_MAP = { 1: "子", 2: "丑", 3: "寅", 4: "卯", 5: "辰", 6: "巳", 7: "午", 8: "未", 9: "申", 10: "酉", 11: "戌", 12: "亥" };

function mod(n, m) {
  const r = n % m;
  return r >= 0 ? r : r + m;
}

function gregorianToJDN(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function getGANZHI60() {
  const gz = [];
  for (let i = 0; i < 60; i++) {
    gz.push(TIAN_GAN[mod(i, 10)] + DI_ZHI[mod(i, 12)]);
  }
  return gz;
}

function dayGZIndex(year, month, day) {
  const REF_JDN = 2415051;
  const REF_GZ = 40;
  const jdn = gregorianToJDN(year, month, day);
  return mod(REF_GZ + (jdn - REF_JDN), 60);
}

function getHourGZ(year, month, day, hour) {
  const dayIdx = dayGZIndex(year, month, day);
  const dzIdx = hour % 2 === 0 ? Math.floor(hour / 2) : Math.floor((hour + 1) / 2);
  const dzIdx12 = mod(dzIdx, 12);
  const tgIdx = mod(mod(dayIdx % 10 * 2 + dzIdx12, 10), 10);
  const gz = getGANZHI60();
  const hourIdx = mod(tgIdx * 12 + dzIdx12, 60);
  return gz[hourIdx];
}

function getDayGZ(year, month, day) {
  const gz = getGANZHI60();
  return gz[dayGZIndex(year, month, day)];
}

function getYearGZ(year) {
  const gz = getGANZHI60();
  // 简化年干支
  const yearTy = mod(year - 4, 10);
  const yearDz = mod(year - 4, 12);
  return gz[mod(yearTy - yearDz, 60)];
}

function calcYinYangDun(year, month, day, hour) {
  const monthDay = month * 100 + day;
  const yinYang = (monthDay >= 621 && monthDay <= 1122) ? "阳遁" : "阴遁";
  const dayIdx = dayGZIndex(year, month, day);
  const hourGZ = getHourGZ(year, month, day, hour);
  const hourDzIdx = DI_ZHI.indexOf(hourGZ[1]);
  const juNumber = mod(dayIdx + hourDzIdx, 9) + 1;
  const dun = yinYang === "阳遁" ? juNumber : 10 - juNumber;
  const yuan = yinYang === "阳遁"
    ? ({ 1: "上元", 7: "中元", 4: "下元" })[juNumber] || "中元"
    : ({ 9: "上元", 3: "中元", 6: "下元" })[juNumber] || "中元";
  return { yinYang, dun, juNumber, yuan };
}

function calculateQimen(dtStr, plateType = "event") {
  // 解析时间 "YYYY-MM-DD HH:MM"
  const [datePart, timePart] = dtStr.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour] = timePart.split(":").map(Number);

  const dayGZ = getDayGZ(year, month, day);
  const hourGZ = getHourGZ(year, month, day, hour);
  const yearGZ = getYearGZ(year);
  const monthGZ = getDayGZ(year, month, 1); // 简化

  const { yinYang, dun, juNumber, yuan } = calcYinYangDun(year, month, day, hour);

  // 值符星 & 值使门
  const zhiFuStarIdx = mod(dun - 1, 9);
  const zhiFuPalace = mod(10 - dun, 9) || 9;
  const zhiFuStar = STAR_NAMES[zhiFuStarIdx];
  const zhiShiGate = GATE_NAMES[mod(dun - 1, 9)];

  // 空亡
  const dayIdx = dayGZIndex(year, month, day);
  const kongIdx1 = mod(dayIdx + 1, 12);
  const kongIdx2 = mod(dayIdx + 2, 12);
  const kong1 = DI_ZHI[kongIdx1];
  const kong2 = DI_ZHI[kongIdx2];

  // 驿马
  const hourDzIdx = DI_ZHI.indexOf(hourGZ[1]);
  const yiMaBranch = YI_MA[hourDzIdx] || "寅";
  const yiMaDzIdx = DI_ZHI.indexOf(yiMaBranch);
  const yiMaPalace = Math.floor(yiMaDzIdx / 2) + 1;

  // 地盘排法
  const diGanOrder = yinYang === "阳遁"
    ? ["戊", "己", "庚", "辛", "壬", "癸", "丁", "丙", "乙"]
    : ["戊", "乙", "丙", "丁", "癸", "壬", "辛", "庚", "己"];

  // 九宫
  const palaces = [];
  for (let p = 1; p <= 9; p++) {
    const diGan = diGanOrder[p - 1];

    // 天盘
    const tianGanIdx = yinYang === "阳遁"
      ? mod(dun - 1 + p - 1, 9)
      : mod(9 - dun + p - 1, 9);
    const tianGan = TIAN_GAN[mod(tianGanIdx, 10)];

    // 九星
    const starIdx = yinYang === "阳遁"
      ? mod(zhiFuStarIdx + p - zhiFuPalace, 9)
      : mod(zhiFuStarIdx - (p - zhiFuPalace), 9);
    const starFixed = starIdx >= 0 ? starIdx : starIdx + 9;

    // 八门
    const gateIdx = yinYang === "阳遁"
      ? mod(dun - 1 + p - zhiFuPalace, 9)
      : mod(9 - dun + p - zhiFuPalace, 9);
    const gateFixed = mod(gateIdx, 9);

    // 八神
    const deityIdx = yinYang === "阳遁"
      ? mod(p - zhiFuPalace, 8)
      : mod(zhiFuPalace - p, 8);
    const deityFixed = deityIdx >= 0 ? deityIdx : deityIdx + 8;
    const deity = yinYang === "阳遁"
      ? DEITY_YANG[mod(deityFixed, 8)]
      : DEITY_YIN[mod(deityFixed, 8)];

    // 地支
    const dzNum = p;
    const dz = DZ_MAP[dzNum] || DI_ZHI[(dzNum - 1) % 12];

    // 空亡判断
    const isKong = dz === kong1 || dz === kong2;

    palaces.push({
      宫: p,
      方位: PALACE_MAP[p],
      方向: PALACE_DIR[p],
      地支: dz,
      天盘: tianGan,
      地盘: diGan,
      神: deity || DEITY_YANG[0],
      星: STAR_NAMES[starFixed],
      星吉凶: STAR_JIXI[starFixed],
      星五行: STAR_WUXING[starFixed],
      门: p === 5 ? "中" : GATE_NAMES[gateFixed],
      门吉凶: p === 5 ? "中" : GATE_JIXI[gateFixed],
      门五行: p === 5 ? "土" : GATE_WUXING[gateFixed],
      五行: PALACE_WUXING[p],
      空亡: isKong ? "空亡" : "",
      先天数: String(p),
      后天数: String(p <= 5 ? 10 - p : p - 4),
      尾数: `${mod(p, 10)},${mod(p + 5, 10)}`,
    });
  }

  return {
    四柱: { 年: yearGZ, 月: monthGZ, 日: dayGZ, 时: hourGZ },
    局: { type: yinYang, number: dun, ju: juNumber, yuan },
    值符: { 星: zhiFuStar, 宫: zhiFuPalace },
    值使: { 门: zhiShiGate, 宫: zhiFuPalace },
    空亡: { 支1: kong1, 支2: kong2 },
    驿马: { 支: yiMaBranch, 宫: yiMaPalace },
    宫位: palaces,
    datetime: dtStr,
    plate_type: plateType,
  };
}

export { calculateQimen };
