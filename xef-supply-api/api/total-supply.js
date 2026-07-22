const { TOTAL_SUPPLY } = require("../lib/vesting");

// GET /api/total-supply -> 순수 숫자 텍스트 (예: 6000000000)
// 코인게코/CMC의 "Total Supply API" 필드에 그대로 넣으면 되는 표준 형식입니다.
module.exports = (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(String(TOTAL_SUPPLY));
};
