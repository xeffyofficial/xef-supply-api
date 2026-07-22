/**
 * XEF 토큰 베스팅 계산 로직
 * Google Sheet "XEF_Tokenomics" Summary 탭 수식과 100% 동일하게 검증됨.
 */

const TGE_DATE = new Date("2026-06-15T00:00:00Z");
const TOTAL_SUPPLY = 6_000_000_000;

// cliffEndDate: null이면 TGE + cliffMonths로 자동 계산, 값이 있으면 고정값 사용
// vestUnit: "days" | "months"
const CATEGORIES = [
  { name: "Private Sale", alloc: 0.15, tgePct: 0.0, cliffMonths: 0, cliffEndDate: "2026-01-15", vestLength: 365, vestUnit: "days" },
  { name: "Strategic DAO Treasury Backers", alloc: 0.15, tgePct: 0.0, cliffMonths: 0, cliffEndDate: null, vestLength: 365, vestUnit: "days" },
  { name: "Incentives & Campaigns", alloc: 0.18, tgePct: 0.05, cliffMonths: 12, cliffEndDate: null, vestLength: 12, vestUnit: "months" },
  { name: "Liquidity & Market Making", alloc: 0.10, tgePct: 0.30, cliffMonths: 0, cliffEndDate: null, vestLength: 24, vestUnit: "months" },
  { name: "Core Contributors & Development", alloc: 0.07, tgePct: 0.0, cliffMonths: 6, cliffEndDate: null, vestLength: 24, vestUnit: "months" },
  { name: "Foundation / Treasury Reserve", alloc: 0.04, tgePct: 0.0, cliffMonths: 12, cliffEndDate: null, vestLength: 48, vestUnit: "months" },
  { name: "Marketing & Growth", alloc: 0.05, tgePct: 0.10, cliffMonths: 0, cliffEndDate: null, vestLength: 36, vestUnit: "months" },
  { name: "Ecosystem & Strategic Partnerships", alloc: 0.06, tgePct: 0.06, cliffMonths: 0, cliffEndDate: null, vestLength: 48, vestUnit: "months" },
  { name: "Angel Investor", alloc: 0.20, tgePct: 0.0, cliffMonths: 0, cliffEndDate: "2026-01-15", vestLength: 365, vestUnit: "days" },
];

function addMonths(date, months) {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function getCliffEndDate(cat) {
  if (cat.cliffEndDate) return new Date(cat.cliffEndDate + "T00:00:00Z");
  return addMonths(TGE_DATE, cat.cliffMonths);
}

function getVestingEndDate(cliffEnd, cat) {
  return cat.vestUnit === "days"
    ? addDays(cliffEnd, cat.vestLength)
    : addMonths(cliffEnd, cat.vestLength);
}

/** asOfDate 기준 각 카테고리의 언락된 토큰 수 계산 */
function calcCirculating(asOfDate) {
  let total = 0;
  const breakdown = [];

  for (const cat of CATEGORIES) {
    const catTotal = TOTAL_SUPPLY * cat.alloc;
    const tgeUnlocked = catTotal * cat.tgePct;

    if (asOfDate < TGE_DATE) {
      breakdown.push({ name: cat.name, circulating: 0 });
      continue;
    }

    const cliffEnd = getCliffEndDate(cat);
    const vestEnd = getVestingEndDate(cliffEnd, cat);

    const totalMs = vestEnd - cliffEnd;
    const elapsedMs = asOfDate - cliffEnd;
    const fraction =
      totalMs === 0 ? 1 : Math.min(1, Math.max(0, elapsedMs / totalMs));

    const circulating = tgeUnlocked + (catTotal - tgeUnlocked) * fraction;
    total += circulating;
    breakdown.push({ name: cat.name, circulating: Math.round(circulating) });
  }

  return { total: Math.round(total), breakdown };
}

module.exports = { TGE_DATE, TOTAL_SUPPLY, calcCirculating };
