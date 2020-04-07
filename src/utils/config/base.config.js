require('dotenv').config();

// Recommended btc magnification.
const btcMantissa = [10];
// If system havs not been set the price for 12 hours(43200s), must set a new price.
const maxFeedingPriceInterval = 43200;
// Valid price strategy
const medianStrategy = {
  dsr: {
    allExchanges: 7,
    leastValidValue: 4,
    safePriceSwing: 0.04,
  },
  hbtc: {
    allExchanges: 7,      // Total number of exchanges.
    leastValidValue: 5,   // Minimum amount of valid exchange price.
    safePriceSwing: 0.01, // Max price difference ratio when try to compare median with average.
  },
  imbtc: {
    allExchanges: 7,
    leastValidValue: 5,
    safePriceSwing: 0.01,
  },
  usdt: {
    allExchanges: 7,
    leastValidValue: 5,
    safePriceSwing: 0.01,
  },
  usdx: {
    allExchanges: 7,
    leastValidValue: 5,
    safePriceSwing: 0.01,
  },
};
// Expect account has minimum eth amount.
const minBalance = 0.01;
// Which btc is used as the price benchmark for all btc.
const referenceBTC = 'hbtc';
// Which stablecoin is used as the price benchmark for all stablecoins.
const referenceStableCoin = 'usdx';
// Support btcs.
const btcs = ['wbtc'];
// Recommended stable coin magnification.
const stableCoinMantissa = [0, 10, 0, 0, 12];
// Support stablecoins.
const stableCoins = ['busd', 'husd', 'pax', 'tusd', 'usdc'];
// Multi-collateral currencies.
const supportAssets = ['usdx', 'usdt', 'imbtc', 'hbtc', 'dsr'];
// Recommended magnification.
const supposedMantissa = [0, 12, 10, 0, 0];

// when add a new collateral asset, need to add here.
const mainnetAssets = {
  busd:  '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
  dsr:   '0x06AF07097C9Eeb7fD685c692751D5C66dB49c215',
  husd:  '0xdF574c24545E5FfEcb9a659c229253D4111d87e1',
  hbtc:  '0x0316EB71485b0Ab14103307bf65a021042c6d380',
  imbtc: '0x3212b29E33587A00FB1C83346f5dBFA69A458923',
  pax:   '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
  tusd:  '0x0000000000085d4780B73119b644AE5ecd22b376',
  usdc:  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  usdt:  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  usdx:  '0xeb269732ab75A6fD61Ea60b06fE994cD32a83549',
  wbtc:  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  weth:  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
};

const rinkebyAssets = {
  busd:  '0xBB4EeFbE28440D27D18e4269962bE2506366c476',
  dsr:   '0x8a5C1BD4D75e168a4f65eB902c289400B90FD980',
  husd:  '0x0D518472330FF1D943881BBBDda03b221A7F9F74',
  hbtc:  '0xcf07906CbCF9824D0caE475E8F958d48AcF1014C',
  imbtc: '0x5Dc95A046020880b93F15902540Dbfe86489FddA',
  pax:   '0x722E6238335d89393A42e2cA316A5fb1b8B2EB55',
  tusd:  '0xe72a3181f69Eb21A19bd4Ce19Eb68FDb333d74c6',
  usdc:  '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b',
  usdt:  '0xaa74B62f737bbA1D2E520F9ec38Fc23b6E6817df',
  usdx:  '0xD96cC7f80C1cb595eBcdC072531e1799B3a2436E',
  wbtc:  '0x7B65B937A0f3764a7a5e29fD696C391233218E91',
  weth:  '0x7A967421410019044aA829746D65575325082e99',
};

const assets = {
  mainnet: mainnetAssets,
  rinkeby: rinkebyAssets,
};

// price oracle contract address
const oracleContract = {
  mainnet: '0xE171D8c7e9EE0DDAe1A9bec0c7f35294e48c28d4',
  rinkeby: '0xd75AF5Bc8e1f022002c47508C27455A20738b1F5',
  testnet: '0x61055f1dAC1436cc86433D74910487Ca5D6E5276',
};

/* eslint-disable */
const infuraKey = process.env.INFURA_KEY;
const localPort = process.env.RANDOM_PORT;
// Max price difference ratio when try to compare new price with previous price.
const maxPriceSwing = process.env.MAX_SWING;
// Interval time to run.
const moment = process.env.MOMENT;
// Monitor url
const monitorUrl = process.env.MONITOR_URL;
// Support net type.
const netType = process.env.NET;
const privateKey = process.env.POSTER_PRIVATE_KEY;
const safetyFactor = process.env.IMPROVING_FACTOR;
// Service name
const serviceName = process.env.SERVICE_NAME;
/* eslint-enable */
const localUrl = `http://127.0.0.1:${localPort}/?`;
const monitorGetPriceUrl = monitorUrl + '/getprice';
const monitorPostPriceUrl = monitorUrl + '/postprice';

function getUrl(model, param = '') {
  const url = `${localUrl}model=${model}`;
  switch (model) {
    case 'feedPrice':
      return `${url}${param ? '&currency=' + param : ''}`;
    case 'lendfMePrice':
      return `${url}${param ? '&asset=' + param : ''}`;
    case 'insertLendfMePrice':
      return url;
    default:
      break;
  }
}

module.exports = {
  assets,
  btcMantissa,
  btcs,
  getUrl,
  infuraKey,
  localPort,
  localUrl,
  maxFeedingPriceInterval,
  maxPriceSwing,
  medianStrategy,
  minBalance,
  moment,
  monitorGetPriceUrl,
  monitorPostPriceUrl,
  monitorUrl,
  netType,
  oracleContract,
  privateKey,
  referenceBTC,
  referenceStableCoin,
  safetyFactor,
  serviceName,
  stableCoinMantissa,
  stableCoins,
  supportAssets,
  supposedMantissa,
};
