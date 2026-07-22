const { calcCirculating } = require("../lib/vesting");

// GET /api/circulating-supply -> 순수 숫자 텍스트 (예: 1497420246)
// 매 요청마다 현재 날짜 기준으로 자동 재계산됩니다.
// 코인게코/CMC의 "Circulating Supply API" 필드에 그대로 넣으면 되는 표준 형식입니다.
module.exports = (req, res) => {
  const now = new Date();
  const { total } = calcCirculating(now);

  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(String(total));
};
