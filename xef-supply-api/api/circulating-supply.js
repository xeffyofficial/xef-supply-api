const { calcCirculating } = require("../lib/vesting");

// GET /api/circulating-supply -> 1497420246  (키 없이 숫자 하나만, Content-Type은 application/json)
// CMC 요구 스펙: numerical value, price와 동일한 단위(토큰 개수, wei 아님), JSON
// 매 요청마다 현재 날짜 기준으로 자동 재계산됩니다.
module.exports = (req, res) => {
  const now = new Date();
  const { total } = calcCirculating(now);

  res.setHeader("Content-Type", "application/json");
  res.status(200).send(String(total));
};
