const { TOTAL_SUPPLY } = require("../lib/vesting");

// GET /api/total-supply -> 6000000000  (키 없이 숫자 하나만, Content-Type은 application/json)
// CMC 요구 스펙: numerical value, price와 동일한 단위(토큰 개수, wei 아님), JSON
// 숫자 하나만 있는 응답도 문법적으로 유효한 JSON입니다 — {"total_supply": ...}처럼
// 감싸지 않고 순수 숫자만 반환해야 스펙에 정확히 맞습니다.
module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(String(TOTAL_SUPPLY));
};
