export async function getTokenPrice(tokenDetails) {
  if (!tokenDetails || !tokenDetails.coingeckoId) return null;
  const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenDetails.coingeckoId}&vs_currencies=usd`);
  const json = await response.json();
  return Number(json[tokenDetails.coingeckoId]['usd']);
}