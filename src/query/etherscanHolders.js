import cheerio from 'cheerio';

// network: ethereum / bsc
export async function etherscanHolders(network, token) {
  const domain = network === 'ethereum' ? 'etherscan.io' : 'bscscan.com';
  const response = await fetch(`https://thingproxy.freeboard.io/fetch/https://${domain}/token/tokenholderchart/${token}?range=500`);
  const html = await response.text();
  const page = cheerio.load(html);
  const res = [];
  const cells = page('table').find('tr td');
  let data;
  for (let i = 0; i < cells.length; i++) {
    const cell = cells.eq(i);
    switch (i % 4) {
      case 0:
        data = {};
        data.rank = Number(cell.text());
        break;
      case 1:
        data.label = cell.text().trim();
        data.contract = cell.has('i').length > 0;
        data.address = '0x' + cell.find('a').attr('href').split('0x').pop().toLowerCase();
        break;
      case 2:
        data.amount = Number(cell.text().replaceAll(',', ''));
        break;
      case 3:
        data.percent = Number(cell.text().replaceAll('%', ''));
        if (data.contract) res.push(data);
        break;
      default:
    }
  }
  return res;
}