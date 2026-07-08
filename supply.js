const { TOTAL_SUPPLY, calcCirculating } = require("../lib/vesting");

// GET /api/supply -> { total_supply, circulating_supply }
module.exports = (req, res) => {
  const now = new Date();
  const { total } = calcCirculating(now);

  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    total_supply: TOTAL_SUPPLY,
    circulating_supply: total,
  });
};
