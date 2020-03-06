// reponse is: {
//     "symbol": "ETHUSDT",
//     "price": "166.69000000"
// }
const binanceBTCPrice = 'https://api.binance.com/api/v3/ticker/price?symbol=ETHBTC';
const binanceUSDxPrice = 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDC';
const binanceUSDTPrice = 'https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT';

// {
//   "trade_id": 295277,
//   "price": "233.57",
//   "size": "0.5458",
//   "time": "2020-03-05T12:37:50.510604Z",
//   "bid": "232.21",
//   "ask": "232.78",
//   "volume": "1509.05360000"
// }
const coinbaseDAIPrice = `https://api.pro.coinbase.com/products/ETH-DAI/ticker`;

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
const hitbtcBTCPrice = 'https://api.hitbtc.com/api/2/public/ticker/ETHBTC?limit=1';
const hitbtcUSDxPrice = 'https://api.hitbtc.com/api/2/public/ticker/ETHUSDC?limit=1';
const hitbtcUSDTPrice = 'https://api.hitbtc.com/api/2/public/ticker/ETHUSD?limit=1';

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
const huobiproBTCPrice = 'https://api.huobi.pro/market/trade?symbol=ethbtc';
const huobiproUSDxPrice = 'https://api.huobi.pro/market/trade?symbol=ethhusd';
const huobiproUSDTPrice = 'https://api.huobi.pro/market/trade?symbol=ethusdt';

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
const gateBTCPrice = 'https://data.gateio.life/api2/1/ticker/eth_btc';
const gateUSDxPrice = 'https://data.gateio.life/api2/1/ticker/usdc_usdt';
const gateUSDTPrice = 'https://data.gateio.life/api2/1/ticker/eth_usdt';

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
const bitfinexBTCPrice = 'https://api-pub.bitfinex.com/v2/tickers/?symbols=tETHBTC';
const bitfinexUSDxPrice = 'https://api-pub.bitfinex.com/v2/tickers/?symbols=tETHUSD';
const bitfinexUSDTPrice = 'https://api-pub.bitfinex.com/v2/tickers/?symbols=tETHUST';

// response is: {
//     "success": true,
//     "message": "",
//     "result": {
//         "Bid": 183.00000000,
//         "Ask": 183.25000000,
//         "Last": 183.20000000
//     }
// }
const bittrexBTCPrice = 'https://api.bittrex.com/api/v1.1/public/getticker?market=BTC-ETH';
const bittrexUSDxPrice = 'https://api.bittrex.com/api/v1.1/public/getticker?market=USD-ETH';
const bittrexUSDTPrice = 'https://api.bittrex.com/api/v1.1/public/getticker?market=USDT-ETH';


// {
//     "error": [
//     ],
//     "result": {
//         "ETHDAI": {
//             "a": [        // ask
//             "260.363000",
//             "16",
//             "16.000"
//             ],
//             "b": [        // bid
//             "258.300000",
//             "1",
//             "1.000"
//             ],
//             "c": [        // close
//             "260.221000",
//             "0.79461218"
//             ],
//             "v": [        // volumn
//             "18.07558823",
//             "533.56357472"
//             ],
//             "p": [        // average price
//             "258.745661",
//             "267.102524"
//             ],
//             "t": [        // trading amount
//             13,
//             387
//             ],
//             "l": [        // lowest price
//             "258.292000",
//             "252.634000"
//             ],
//             "h": [        // highest price
//             "261.402000",
//             "286.843000"
//             ],
//             "o": "259.407000"  // opening price
//         }
//     }
// }
const krakenDAIPrice = `https://api.kraken.com/0/public/Ticker?pair=ETHDAI`;

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
const kucoinBTCPrice = 'https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=ETH-BTC';
const kucoinUSDxPrice = 'https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=ETH-USDC';
const kucoinUSDTPrice = 'https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=ETH-USDT';

// {
//   "status": "ok",
//   "ch": "market.ethbtc.detail.merged",
//   "ts": 1579054246718,
//   "tick": {
//     "amount": 199430.8491,
//     "open": 0.017472,
//     "close": 0.019014,
//     "high": 0.019449,
//     "id": 203287206381,
//     "count": 105069,
//     "low": 0.01743,
//     "version": 203287206381,
//     "ask": [
//       0.019014,
//       2.7002
//     ],
//     "vol": 3659.0482120018,
//     "bid": [
//       0.019004,
//       4.2096
//     ]
//   }
// }
const hbtcPrice = 'https://api.huobi.pro/market/detail/merged?symbol=ethbtc';

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
const imBTCPrice = 'https://tokenlon-core-market.tokenlon.im/rest/get_ticker?period=24H&pairs=imBTC_ETH';

// {
//     "best_ask": "260.21",
//     "best_bid": "257.49",
//     "instrument_id": "ETH-DAI",
//     "product_id": "ETH-DAI",
//     "last": "260.5",
//     "last_qty": "0",
//     "ask": "260.21",
//     "best_ask_size": "1.063452",
//     "bid": "257.49",
//     "best_bid_size": "0.668172",
//     "open_24h": "272.09",
//     "high_24h": "284.1",
//     "low_24h": "260.5",
//     "base_volume_24h": "60.18",
//     "timestamp": "2020-02-20T02:22:05.555Z",
//     "quote_volume_24h": "16567.69"
// }
const okexDAIPrice = `https://www.okex.com/api/spot/v3/instruments/ETH-DAI/ticker`;


module.exports = {
  binanceBTCPrice,
  binanceUSDTPrice,
  binanceUSDxPrice,
  bitfinexBTCPrice,
  bitfinexUSDTPrice,
  bitfinexUSDxPrice,
  bittrexBTCPrice,
  bittrexUSDTPrice,
  bittrexUSDxPrice,
  coinbaseDAIPrice,
  gateBTCPrice,
  gateUSDTPrice,
  gateUSDxPrice,
  hbtcPrice,
  hitbtcBTCPrice,
  hitbtcUSDTPrice,
  hitbtcUSDxPrice,
  huobiproBTCPrice,
  huobiproUSDTPrice,
  huobiproUSDxPrice,
  imBTCPrice,
  krakenDAIPrice,
  kucoinBTCPrice,
  kucoinUSDTPrice,
  kucoinUSDxPrice,
  okexDAIPrice,
};
