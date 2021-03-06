import 'semantic-ui-css/semantic.min.css';
import './App.css';

import React, { useState, useEffect } from 'react';
import {Dropdown, Loader, Table, Container, Form, Button} from 'semantic-ui-react';

import { bloxyHolders } from './query/bloxyHolders';
import { etherscanHolders } from './query/etherscanHolders';
import {getContractLabels, SPREADSHEET_ID} from './query/contractLabels';
import { getTokenPrice } from './query/tokenPrice';

const contractsGoogleSheet = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit?usp=sharing`;

const tokenOptions = [
  {
    network: 'ethereum',
    key: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    text: 'WETH',
    value: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    coingeckoId: 'ethereum'
  },
  {
    network: 'ethereum',
    key: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    text: 'USDC',
    value: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    coingeckoId: 'usd-coin'
  },
  {
    network: 'ethereum',
    key: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    text: 'WBTC',
    value: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    coingeckoId: 'wrapped-bitcoin'
  },
  {
    network: 'ethereum',
    key: '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d',
    text: 'renBTC',
    value: '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d',
    coingeckoId: 'renbtc'
  },
  {
    network: 'bsc',
    key: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    text: 'bsc: BUSD',
    value: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    coingeckoId: 'binance-usd'
  },
  {
    network: 'bsc',
    key: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    text: 'bsc: USDC',
    value: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    coingeckoId: 'usd-coin'
  },
  {
    network: 'bsc',
    key: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    text: 'bsc: WBNB',
    value: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    coingeckoId: 'binance-coin'
  },
  {
    network: 'bsc',
    key: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    text: 'bsc: BTCB',
    value: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    coingeckoId: 'binance-bitcoin'
  }
];

const tokenDetailsByAddress = {};
for (let i = 0; i < tokenOptions.length; i++) {
  const details = tokenOptions[i];
  tokenDetailsByAddress[details.key.toLowerCase()] = details;
}

function App() {
  const [tokenDetails, setTokenDetails] = useState(tokenOptions[0]);
  const [contracts, setContracts] = useState(null);
  const [labels, setLabels] = useState(null);
  const [tokenPrice, setTokenPrice] = useState(null);
  useEffect(() => {
    const queryTopContracts = async () => {
      setContracts(null);
      const res = tokenDetails.network === 'ethereum' ?
        await bloxyHolders(tokenDetails.value) :
        await etherscanHolders(tokenDetails.network, tokenDetails.value);
      setContracts(res);
    }
    const queryLabels = async () => {
      setLabels(null);
      const res = await getContractLabels(tokenDetails.network);
      setLabels(res);
    }
    const queryTokenPrice = async () => {
      setTokenPrice(null);
      const res = await getTokenPrice(tokenDetails);
      setTokenPrice(res);
    }
    queryTopContracts();
    queryLabels();
    queryTokenPrice();
  }, [tokenDetails]);
  return (
    <div className="App">
      <Form style={{margin: '20px'}}>
        <Dropdown
            button
            selection
            className='icon'
            floating
            labeled
            icon='world'
            options={tokenOptions}
            defaultValue={tokenOptions[0].value}
            value={tokenDetails.value}
            search
            onChange={(_, data) => {
              setTokenDetails(tokenDetailsByAddress[data.value.toLowerCase()]);
            }}
        />
      </Form>
      <Container>
      {contracts === null || labels === null || tokenPrice === null ?
        <Loader active inline='centered' /> :
        renderTable(tokenDetails.network, contracts, labels, tokenPrice, (contract) => {
          const c = {
              network: tokenDetails.network,
              key: contract.address.toLowerCase(),
              text: labels[contract.address]?.label || "",
              value: contract.address,
              coingeckoId: 'ethereum'
          }
          tokenDetailsByAddress[c.key] = c;
          tokenOptions.push(c);
          setTokenDetails(c);
        })
      }
      </Container>
    </div>
  );
}

function renderTable(network, contracts, labels, tokenPrice, onClickHolders) {
  const etherscanDomain = network === 'ethereum' ? 'etherscan.io' : 'bscscan.com';
  return (
    <Table textAlign='left' celled padded compact collapsing style={{margin: 'auto'}}>
      <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Address</Table.HeaderCell>
        <Table.HeaderCell>Label</Table.HeaderCell>
        <Table.HeaderCell>Amount</Table.HeaderCell>
        <Table.HeaderCell>Holders</Table.HeaderCell>
      </Table.Row>
      </Table.Header>
      <Table.Body>
        {
          contracts.map((item) => (
            <Table.Row>
              <Table.Cell><a href={`https://${etherscanDomain}/address/${item.address}`}
                             target="_blank"
                             rel="noreferrer">{item.address}</a>
              </Table.Cell>
              <Table.Cell><a href={
                labels[item.address] ?
                labels[item.address].website :
                contractsGoogleSheet
              } target="_blank" rel="noreferrer">{
                labels[item.address] ?
                labels[item.address].label :
                `<please add>`
              }</a></Table.Cell>
              <Table.Cell>{formatTVL(item.amount * tokenPrice)}</Table.Cell>
              <Table.Cell>
                <Button onClick={() => onClickHolders(item)}>Holders</Button>
              </Table.Cell>
            </Table.Row>
          ))
        }
      </Table.Body>
    </Table>
  );
}

function formatTVL(amount) {
  if (amount > 1e9) return '$' + Math.round(amount/1e9) + 'B';
  if (amount > 1e6) return '$' + Math.round(amount/1e6) + 'M';
  if (amount > 1e3) return '$' + Math.round(amount/1e3) + 'K';
  return '$' + Math.round(amount);
}

export default App;
