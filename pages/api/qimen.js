/**
 * 奇门遁甲排盘 API
 */

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

function mod(n, m) { return n >= 0 ? n % m : (n % m + m) % m; }

function gregorianToJDN(y, mo, d) {
  const a = Math.floor((14 - mo) / 12);
  const yy = y + 4800 - a;
  const mm = mo + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

function getGANZHI60() {
  const gz = [];
  for (let i = 0; i < 60; i++) gz.push(TIAN_GAN[mod(i, 10)] + DI_ZHI[mod(i, 12)]);
  return gz;
}

function dayGZIndex(y, mo, d) {
  return mod(40 + (gregorianToJDN(y, mo, d) - 2415051), 60);
}

function getDayGZ(y, mo, d) { return getGANZHI60()[dayGZIndex(y, mo, d)]; }

function getYearGZ(y) {
  const gz = getGANZHI60();
  return gz[mod(mod(y - 4, 10) - mod(y - 4, 12) + 60, 60)];
}

function getHourGZ(y, mo, d, hour) {
  const dayIdx = dayGZIndex(y, mo, d);
  const dzIdx = hour % 2 === 0 ? Math.floor(hour / 2) : Math.floor((hour + 1) / 2);
  const dz12 = mod(dzIdx, 12);
  const tg = mod(mod(dayIdx % 10 * 2 + dz12, 10), 10);
  return getGANZHI60()[mod(tg * 12 + dz12, 60)];
}

function calcYinYang(y, mo, d, hour) {
  const md = mo * 100 + d;
  const yinYang = (md >= 621 && md <= 1122) ? "阳遁" : "阴遁";
  const dayIdx = dayGZIndex(y, mo, d);
  const hourGZ = getHourGZ(y, mo, d, hour);
  const hDz = DI_ZHI.indexOf(hourGZ[1]);
  const ju = mod(dayIdx + hDz, 9) + 1;
  const dun = yinYang === "阳遁" ? ju : 10 - ju;
  const yuan = yinYang === "阳遁"
    ? ({ 1: "上元", 7: "中元", 4: "下元" })[ju] || "中元"
    : ({ 9: "上元", 3: "中元", 6: "下元" })[ju] || "中元";
  return { yinYang, dun, ju, yuan };
}

function calculateQimen(dtStr, plateType = "event") {
  const [dp, tp] = dtStr.replace("T", " ").split(" ");
  const [year, month, day] = dp.split("-").map(Number);
  const [hour] = tp.split(":").map(Number);

  const dayGZ = getDayGZ(year, month, day);
  const hourGZ = getHourGZ(year, month, day, hour);
  const yearGZ = getYearGZ(year);
  const monthGZ = getDayGZ(year, month, 1);

  const { yinYang, dun, ju, yuan } = calcYinYang(year, month, day, hour);
  const zfStar = mod(dun - 1, 9);
  const zfPalace = mod(10 - dun, 9) || 9;
  const zsGate = mod(dun - 1, 9);

  const dayIdx = dayGZIndex(year, month, day);
  const kong1 = DI_ZHI[mod(dayIdx + 1, 12)];
  const kong2 = DI_ZHI[mod(dayIdx + 2, 12)];
  const hDz = DI_ZHI.indexOf(hourGZ[1]);
  const yiMaBranch = YI_MA[hDz] || "寅";
  const yiMaPalace = Math.floor(DI_ZHI.indexOf(yiMaBranch) / 2) + 1;

  const diOrder = yinYang === "阳遁"
    ? ["戊", "己", "庚", "辛", "壬", "癸", "丁", "丙", "乙"]
    : ["戊", "乙", "丙", "丁", "癸", "壬", "辛", "庚", "己"];

  const palaces = [];
  for (let p = 1; p <= 9; p++) {
    const ti = yinYang === "阳遁" ? mod(dun - 1 + p - 1, 9) : mod(9 - dun + p - 1, 9);
    const si = yinYang === "阳遁" ? mod(zfStar + p - zfPalace, 9) : mod(zfStar - (p - zfPalace), 9);
    const siFixed = mod(si, 9);
    const gi = yinYang === "阳遁" ? mod(dun - 1 + p - zfPalace, 9) : mod(9 - dun + p - zfPalace, 9);
    const giFixed = mod(gi, 9);
    const di = yinYang === "阳遁" ? mod(p - zfPalace, 8) : mod(zfPalace - p, 8);
    const diFixed = mod(di >= 0 ? di : di + 8, 8);
    const deity = yinYang === "阳遁" ? DEITY_YANG[diFixed] : DEITY_YIN[diFixed];
    const dz = DZ_MAP[p] || DI_ZHI[(p - 1) % 12];
    const isKong = dz === kong1 || dz === kong2;
    const isCenter = p === 5;

    palaces.push({
      宫: p, 方位: PALACE_MAP[p], 方向: PALACE_DIR[p], 地支: dz,
      天盘: TIAN_GAN[mod(ti, 10)], 地盘: diOrder[p - 1], 神: deity || DEITY_YANG[0],
      星: STAR_NAMES[siFixed], 星吉凶: STAR_JIXI[siFixed], 星五行: STAR_WUXING[siFixed],
      门: isCenter ? "中" : GATE_NAMES[giFixed],
      门吉凶: isCenter ? "中" : GATE_JIXI[giFixed],
      门五行: isCenter ? "土" : GATE_WUXING[giFixed],
      五行: PALACE_WUXING[p], 空亡: isKong ? "空亡" : "",
      先天数: String(p), 后天数: String(p <= 5 ? 10 - p : p - 4),
      尾数: `${mod(p, 10)},${mod(p + 5, 10)}`,
    });
  }

  return {
    四柱: { 年: yearGZ, 月: monthGZ, 日: dayGZ, 时: hourGZ },
    局: { type: yinYang, number: dun, ju, yuan },
    值符: { 星: STAR_NAMES[zfStar], 宫: zfPalace },
    值使: { 门: GATE_NAMES[zsGate], 宫: zfPalace },
    空亡: { 支1: kong1, 支2: kong2 },
    驿马: { 支: yiMaBranch, 宫: yiMaPalace },
    宫位: palaces,
    datetime: dtStr,
    plate_type: plateType,
  };
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ name: '奇门遁甲 API', version: '1.0' });
  }
  if (req.method === 'POST') {
    const { datetime, type } = req.body;
    if (!datetime) return res.status(400).json({ success: false, error: 'datetime required' });
    try {
      return res.status(200).json({ success: true, data: calculateQimen(datetime, type || 'event') });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
