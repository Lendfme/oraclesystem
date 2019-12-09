require('dotenv').config()

// Max price difference ratio when try to compare median with average.
const safePriceSwing = 0.01
// If system havs not been set the price for 12 hours(43200s), must set a new price.
const maxFeedingPriceInterval = 43200
// Max price difference ratio when try to compare new price with previous price.
const maxPriceSwing = 0.01
// Expect account has minimum eth amount.
const minBalance = 0.01
// Support net type.
const netTypes = ['mainnet', 'rinkeby']
// Multi-collateral currencies
const supportAssets = ['usdx', 'usdt']
// Recommended magnification
const supposedMantissa = [0, 12, 10]
// Service name
const serviceName = ''

// when add a new collateral asset, need to add here.
const mainnetAssets = {
    'usdx': '0xeb269732ab75A6fD61Ea60b06fE994cD32a83549',
    'usdt': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    'imbtc': '0x3212b29E33587A00FB1C83346f5dBFA69A458923',
    'weth': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
}

const rinkebyAssets = {
    'usdx': '0xAF21BB8ae7b7a5Eec37964e478583CD486FD12E2',
    'usdt': '0xA1e525F7d24D7cCB78A070BBd12C0BF21Fb4a848',
    'imbtc': '0x7b054eBe1D7e003afdA8e717DAEaB05D56D5836A',
    'weth': '0xC8b1a5ef2e19937dd6c0f804DF2e3efE9F093B1e',
}

const assets = {
    'mainnet': mainnetAssets,
    'rinkeby': rinkebyAssets,
}

// price oracle contract address
const oracleContract = {
    'mainnet': '',
    'rinkeby': '0xCe9A5bdEb6088861A99E28ec6852fCA404fE0012',
}

const infuraKey = process.env.INFURA_KEY
const privateKey = process.env.POSTER_PRIVATE_KEY
const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY
const safetyFactor = process.env.IMPROVING_FACTOR

const localPort = 30000;
const localUrl = `http://127.0.0.1:${localPort}/?`

function getUrl(model, param = '') {
    var url = `${localUrl}model=${model}`;
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
    adminPrivateKey,
    assets,
    infuraKey,
    netTypes,
    maxFeedingPriceInterval,
    maxPriceSwing,
    minBalance,
    oracleContract,
    privateKey,
    safePriceSwing,
    safetyFactor,
    serviceName,
    supportAssets,
    supposedMantissa,
    localPort,
    localUrl,
    getUrl
}
