const { TGE_DATE, TOTAL_SUPPLY, calcCirculating } = require("../../lib/vesting");

// GET /api/supply/breakdown -> 카테고리별 상세 내역
module.exports = (req, res) => {
  const now = new Date();
  const { total, breakdown } = calcCirculating(now);

  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    as_of: now.toISOString(),
    tge_date: TGE_DATE.toISOString(),
    total_supply: TOTAL_SUPPLY,
    circulating_supply: total,
    circulating_pct: +(total / TOTAL_SUPPLY).toFixed(4),
    categories: breakdown,
  });
};
