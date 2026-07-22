const { TOTAL_SUPPLY, calcCirculating } = require("../../lib/vesting");

// GET /api/supply -> { total_supply, circulating_supply } JSON
// total-supply / circulating-supply 각각의 텍스트 엔드포인트가 메인이고,
// 이건 한 번에 둘 다 확인하고 싶을 때 참고용으로 쓰는 JSON 버전입니다.
module.exports = (req, res) => {
  const now = new Date();
  const { total } = calcCirculating(now);

  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    total_supply: TOTAL_SUPPLY,
    circulating_supply: total,
  });
};
