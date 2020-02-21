require('dotenv').config();

// Recommended btc magnification.
const btcMantissa = [10];
// If system havs not been set the price for 12 hours(43200s), must set a new price.
const maxFeedingPriceInterval = 43200;
// Max price difference ratio when try to compare new price with previous price.
const maxPriceSwing = 0.005;
// Expect account has minimum eth amount.
const minBalance = 0.01;
// Which btc is used as the price benchmark for all btc.
const referenceBTC = 'hbtc';
// Which stablecoin is used as the price benchmark for all stablecoins.
const referenceStableCoin = 'usdx';
// Support btcs.
const btcs = ['wbtc'];
// Recommended stable coin magnification.
const stableCoinMantissa = [0, 0, 12];
// Support stablecoins.
const stableCoins = ['pax', 'tusd', 'usdc'];
// Multi-collateral currencies.
const supportAssets = ['usdx', 'usdt', 'imbtc', 'hbtc'];
// Recommended magnification.
const supposedMantissa = [0, 12, 10, 0];
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
  hbtc:  '0xcf07906CbCF9824D0caE475E8F958d48AcF1014C',
  imbtc: '0x7b054eBe1D7e003afdA8e717DAEaB05D56D5836A',
  pax:   '0x722E6238335d89393A42e2cA316A5fb1b8B2EB55',
  tusd:  '0xe72a3181f69Eb21A19bd4Ce19Eb68FDb333d74c6',
  usdc:  '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b',
  usdt:  '0xA1e525F7d24D7cCB78A070BBd12C0BF21Fb4a848',
  usdx:  '0xAF21BB8ae7b7a5Eec37964e478583CD486FD12E2',
  wbtc:  '0x7B65B937A0f3764a7a5e29fD696C391233218E91',
  weth:  '0xC8b1a5ef2e19937dd6c0f804DF2e3efE9F093B1e',
};

const assets = {
  mainnet: mainnetAssets,
  rinkeby: rinkebyAssets,
};

// price oracle contract address
const oracleContract = {
  mainnet: '0xE8a616FD9D7e82cfCaEf3f8a90c6A7EEA97E0856',
  rinkeby: '0x48dFd33dCc114B4C3499a33C21406BB05a1A30a6',
};

/* eslint-disable */
const infuraKey = process.env.INFURA_KEY;
const localPort = process.env.RANDOM_PORT;
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
