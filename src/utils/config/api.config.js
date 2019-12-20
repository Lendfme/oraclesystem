// reponse is: {
//     "symbol": "ETHUSDT",
//     "price": "166.69000000"
//   }
const binanceBTCPrice = `https://api.binance.com/api/v3/ticker/price?symbol=ETHBTC`
const binanceUSDxPrice = `https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDC`
const binanceUSDTPrice = `https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT`

// response is: {
//     "ask": "1.001716",
//     "bid": "1.001496",
//     "last": "1.001157",
//     "open": "0.999976",
//     "low": "0.994415",
//     "high": "1.005020",
//     "volume": "41660.27",
//     "volumeQuote": "41672.91319781",
//     "timestamp": "2019-11-23T01:44:23.203Z",
//     "symbol": "USDTUSD"
// }
const hitbtcBTCPrice = `https://api.hitbtc.com/api/2/public/ticker/ETHBTC?limit=1`
const hitbtcUSDxPrice = `https://api.hitbtc.com/api/2/public/ticker/ETHUSDC?limit=1`
const hitbtcUSDTPrice = `https://api.hitbtc.com/api/2/public/ticker/ETHUSD?limit=1`

// response is: {
//     "status": "ok",
//     "ch": "market.ethusdt.trade.detail",
//     "ts": 1571821215747,
//     "tick": {
//       "id": 102448098634,
//       "ts": 1571821214809,
//       "data": [
//         {
//           "amount": 0.600000000000000000,
//           "trade-id": 101882484862,
//           "ts": 1571821214809,
//           "id": 10244809863452929492622,
//           "price": 166.780000000000000000,
//           "direction": "sell"
//         }
//       ]
//     }
//   }
const huobiproBTCPrice = `https://api.huobi.pro/market/trade?symbol=ethbtc`
const huobiproUSDxPrice = `https://api.huobi.pro/market/trade?symbol=ethhusd`
const huobiproUSDTPrice = `https://api.huobi.pro/market/trade?symbol=ethusdt`

// response is: {
//     "quoteVolume": "125344.748741319",
//     "baseVolume": "489016.94013183226222",
//     "highestBid": "3.8643",
//     "high24hr": "3.98",
//     "last": "3.8735",
//     "lowestAsk": "3.8722",
//     "elapsed": "3ms",
//     "result": "true",
//     "low24hr": "3.8291",
//     "percentChange": "-1.77"
// }
const gateBTCPrice = `https://data.gateio.life/api2/1/ticker/eth_btc`
const gateUSDxPrice = `https://data.gateio.life/api2/1/ticker/usdc_usdt`
const gateUSDTPrice = `https://data.gateio.life/api2/1/ticker/eth_usdt`

// response is: [
//     [
//         "tETHUSD",    // SYMBOL
//         183.9,        // BID
//         861.88578214, // BID_SIZE
//         183.91,       // ASK
//         1423.73044677,// ASK_SIZE
//         -0.15884394,  // DAILY_CHANGE
//         -0.0009,      // DAILY_CHANGE_PERC
//         183.90054091, // LAST_PRICE
//         23994.8502572,// VOLUME
//         186.92,       // HIGH
//         182.81        // LOW
//     ]
// ]
const bitfinexBTCPrice = `https://api-pub.bitfinex.com/v2/tickers/?symbols=tETHBTC`
const bitfinexUSDxPrice = `https://api-pub.bitfinex.com/v2/tickers/?symbols=tETHUSD`
const bitfinexUSDTPrice = `https://api-pub.bitfinex.com/v2/tickers/?symbols=tETHUST`

// response is: {
//     "success": true,
//     "message": "",
//     "result": {
//         "Bid": 183.00000000,
//         "Ask": 183.25000000,
//         "Last": 183.20000000
//     }
// }
const bittrexBTCPrice = `https://api.bittrex.com/api/v1.1/public/getticker?market=BTC-ETH`
const bittrexUSDxPrice = `https://api.bittrex.com/api/v1.1/public/getticker?market=USD-ETH`
const bittrexUSDTPrice = `https://api.bittrex.com/api/v1.1/public/getticker?market=USDT-ETH`

// response is: {
//     "code": "200000",
//     "data": {
//         "sequence": "1573443472717",
//         "bestAsk": "8069",
//         "size": "0.00019229",
//         "price": "8063.9",
//         "bestBidSize": "0.18720771",
//         "time": 1574320816682,
//         "bestBid": "8063.9",
//         "bestAskSize": "0.36036"
//         }
// }
const kucoinBTCPrice = `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=ETH-BTC`
const kucoinUSDxPrice = `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=ETH-USDC`
const kucoinUSDTPrice = `https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=ETH-USDT`

// {
//     "jsonrpc": "2.0",
//     "result": {
//         "timestamp": 1572577229,
//         "period": "24H",
//         "pairs": "IMBTC_ETH",
//         "lastTimestamp": 1572577022,
//         "last": 50.349932030000,
//         "high": 50.349932030000,
//         "low": 50.231062890000,
//         "ask": 0,
//         "mid": 0,
//         "bid": 0,
//         "vol": 0.003976900000,
//         "txs": 2,
//         "wallet": 2,
//         "change": 0
//     },
//     "id": 1
// }
const imBTCPrice = `https://tokenlon-core-market.tokenlon.im/rpc`
const imBTCPriceBody = {
    "jsonrpc": "2.0",
    "method": "market.getTicker",
    "params": {
        "pairs": "imBTC_ETH",
        "period": "24H"
    },
    "id": 1
}

module.exports = {
    binanceBTCPrice,
    binanceUSDxPrice,
    binanceUSDTPrice,
    bitfinexBTCPrice,
    bitfinexUSDxPrice,
    bitfinexUSDTPrice,
    bittrexBTCPrice,
    bittrexUSDxPrice,
    bittrexUSDTPrice,
    gateBTCPrice,
    gateUSDxPrice,
    gateUSDTPrice,
    hitbtcUSDxPrice,
    hitbtcBTCPrice,
    hitbtcUSDTPrice,
    huobiproBTCPrice,
    huobiproUSDxPrice,
    huobiproUSDTPrice,
    imBTCPrice,
    imBTCPriceBody,
    kucoinBTCPrice,
    kucoinUSDxPrice,
    kucoinUSDTPrice,
}
