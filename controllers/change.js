function calculateChange(amount) {
  // throw error if amount < 0
  if (amount < 0) {
    throw new Error("Invalid amount: Cannot be negative");
  }

  const denominations = [100, 50, 20, 10, 5, 1];

  // coins object to map the occurances of coins
  const coins = { 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 1: 0 };

  for (const coin of denominations) {
    while (amount >= coin) {
      amount -= coin;
      coins[coin]++;
    }
  }
  return coins;
}

module.exports = calculateChange;
