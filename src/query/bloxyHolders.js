const BLOXY_API_KEY = 'ACCsay814xxhw';

// ethereum only
export async function bloxyHolders(token) {
  const response = await fetch(`https://api.bloxy.info/token/token_holders_list?token=${token}&limit=100&key=${BLOXY_API_KEY}&format=structure`);
  const json = await response.json();
  const res = [];
  for (let i = 0; i < json.length; i++) {
    const cell = json[i];
    const data = {};
    data.rank = i;
    data.label = cell.annotation.trim();
    data.contract = cell.address_type !== 'Wallet';
    data.address = cell.address.toLowerCase();
    data.amount = cell.balance;
    if (data.contract) res.push(data);
  }
  return res;
}
