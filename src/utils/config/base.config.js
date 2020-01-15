require('dotenv').config();

// If system havs not been set the price for 12 hours(43200s), must set a new price.
const maxFeedingPriceInterval = 43200;
// Max price difference ratio when try to compare new price with previous price.
const maxPriceSwing = 0.01;
// Expect account has minimum eth amount.
const minBalance = 0.01;
// Support net type.
const netType = 'mainnet';
// Multi-collateral currencies.
const supportAssets = ['usdx', 'usdt', 'imbtc', 'hbtc'];
// Recommended magnification.
const supposedMantissa = [0, 12, 10, 0];
// Interval time to run.
const moment = 5;
// Service name
const serviceName = '';
// Monitor url
const monitorUrl = '';
const monitorGetPriceUrl = monitorUrl + '/getprice';
const monitorPostPriceUrl = monitorUrl + '/postprice';
// Valid price strategy
const medianStrategy = {
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

// when add a new collateral asset, need to add here.
const mainnetAssets = {
  imbtc: '0x3212b29E33587A00FB1C83346f5dBFA69A458923',
  usdt:  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  usdx:  '0xeb269732ab75A6fD61Ea60b06fE994cD32a83549',
  weth:  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
};

const rinkebyAssets = {
  hbtc:  '0xcf07906CbCF9824D0caE475E8F958d48AcF1014C',
  imbtc: '0x7b054eBe1D7e003afdA8e717DAEaB05D56D5836A',
  usdt:  '0xA1e525F7d24D7cCB78A070BBd12C0BF21Fb4a848',
  usdx:  '0xAF21BB8ae7b7a5Eec37964e478583CD486FD12E2',
  weth:  '0xC8b1a5ef2e19937dd6c0f804DF2e3efE9F093B1e',
};

const assets = {
  mainnet: mainnetAssets,
  rinkeby: rinkebyAssets,
};

// price oracle contract address
const oracleContract = {
  mainnet: '0xE8a616FD9D7e82cfCaEf3f8a90c6A7EEA97E0856',
  rinkeby: '0xFdc55F9ab320819b8D4a91F50d1E78809B09eB3d',
};

/* eslint-disable */
const infuraKey = process.env.INFURA_KEY;
const privateKey = process.env.POSTER_PRIVATE_KEY;
const safetyFactor = process.env.IMPROVING_FACTOR;

const localPort = 00;
/* eslint-enable */
const localUrl = `http://127.0.0.1:${localPort}/?`;

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
  safetyFactor,
  serviceName,
  supportAssets,
  supposedMantissa,
};
