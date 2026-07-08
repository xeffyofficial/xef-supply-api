/**
 * XAX Token Supply API
 * CoinGecko / CMC 등에서 요구하는 형식으로 total_supply, circulating_supply를 반환합니다.
 *
 * 실행: node server.js
 * 확인: curl http://localhost:3000/api/supply
 *
 * 로직은 XAX_Tokenomics.xlsx의 Summary 시트 수식과 동일합니다:
 *   circulating = TGE언락량 + (배분량 - TGE언락량) * min(1, max(0, (오늘 - 클리프종료일) / (베스팅종료일 - 클리프종료일)))
 */

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// ---------- 1. 기본 파라미터 (엑셀 Summary!B3, E3와 동일) ----------
const TGE_DATE = new Date("2026-06-15T00:00:00Z");
const TOTAL_SUPPLY = 6_000_000_000;

// ---------- 2. 카테고리별 베스팅 설정 (엑셀 표와 동일) ----------
// cliffEndDate: null이면 TGE + cliffMonths로 자동 계산, 값이 있으면 고정값 사용
// vestUnit: "days" | "months"
const CATEGORIES = [
  {
    name: "Private Sale",
    alloc: 0.15,
    tgePct: 0.0,
    cliffMonths: 0,
    cliffEndDate: "2026-01-15", // 고정 클리프 종료일
    vestLength: 365,
    vestUnit: "days",
  },
  {
    name: "Strategic DAO Treasury Backers",
    alloc: 0.15,
    tgePct: 0.0,
    cliffMonths: 0,
    cliffEndDate: null,
    vestLength: 365,
    vestUnit: "days",
  },
  {
    name: "Incentives & Campaigns",
    alloc: 0.18,
    tgePct: 0.05,
    cliffMonths: 12,
    cliffEndDate: null,
    vestLength: 12,
    vestUnit: "months",
  },
  {
    name: "Liquidity & Market Making",
    alloc: 0.10,
    tgePct: 0.30,
    cliffMonths: 0,
    cliffEndDate: null,
    vestLength: 24,
    vestUnit: "months",
  },
  {
    name: "Core Contributors & Development",
    alloc: 0.07,
    tgePct: 0.0,
    cliffMonths: 6,
    cliffEndDate: null,
    vestLength: 24,
    vestUnit: "months",
  },
  {
    name: "Foundation / Treasury Reserve",
    alloc: 0.04,
    tgePct: 0.0,
    cliffMonths: 12,
    cliffEndDate: null,
    vestLength: 48,
    vestUnit: "months",
  },
  {
    name: "Marketing & Growth",
    alloc: 0.05,
    tgePct: 0.10,
    cliffMonths: 0,
    cliffEndDate: null,
    vestLength: 36,
    vestUnit: "months",
  },
  {
    name: "Ecosystem & Strategic Partnerships",
    alloc: 0.06,
    tgePct: 0.06,
    cliffMonths: 0,
    cliffEndDate: null,
    vestLength: 48,
    vestUnit: "months",
  },
  {
    name: "Angel Investor",
    alloc: 0.20,
    tgePct: 0.0,
    cliffMonths: 0,
    cliffEndDate: "2026-01-15", // 고정 클리프 종료일
    vestLength: 365,
    vestUnit: "days",
  },
];

// ---------- 3. 계산 유틸 ----------
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

// ---------- 4. API 엔드포인트 ----------
// 코인게코 요구 형식: 인증 없음, HTTPS, JSON, decimals 포함
app.get("/api/supply", (req, res) => {
  const now = new Date();
  const { total } = calcCirculating(now);

  res.json({
    total_supply: TOTAL_SUPPLY,
    circulating_supply: total,
  });
});

// 참고용: 카테고리별 상세 내역 (코인게코에 락업 지갑 대신 제출할 근거자료로 활용 가능)
app.get("/api/supply/breakdown", (req, res) => {
  const now = new Date();
  const { total, breakdown } = calcCirculating(now);

  res.json({
    as_of: now.toISOString(),
    tge_date: TGE_DATE.toISOString(),
    total_supply: TOTAL_SUPPLY,
    circulating_supply: total,
    circulating_pct: +(total / TOTAL_SUPPLY).toFixed(4),
    categories: breakdown,
  });
});

app.listen(PORT, () => {
  console.log(`XAX Supply API running on http://localhost:${PORT}`);
  console.log(`  GET /api/supply            -> {total_supply, circulating_supply}`);
  console.log(`  GET /api/supply/breakdown  -> 카테고리별 상세 내역`);
});
