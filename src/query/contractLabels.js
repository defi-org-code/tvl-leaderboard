import GoogleSheetParser from 'public-google-sheets-parser';

const SPREADSHEET_ID = '1dVakt-XR9TNiV9K0334UEo0w9lc2NIOYC_J1yiTPx6w';

// network: ethereum / bsc
export async function getContractLabels(network) {
  const parser = new GoogleSheetParser();
  const items = await parser.parse(SPREADSHEET_ID, network);
  const res = {};
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    res[item.address] = item;
  }
  return res;
}
