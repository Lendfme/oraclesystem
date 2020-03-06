/* eslint-disable camelcase */
/* eslint-disable no-prototype-builtins */
const http = require('http');
const url = require('url');

const oraclePrice = require('./src/database/oraclePrice');
const apiPriceConfig = require('./src/utils/config/apiPriceConfig');
const {
  asyncGet,
  request,
  post,
} = require('./src/helpers/request');

const {
  getMedian,
} = require('./src/helpers/getPrice');

const {
  supportAssets,
  localPort,
  serviceName,
  medianStrategy,
  monitorGetPriceUrl,
} = require('./src/utils/config/base.config');

const {
  hbtcPrice,
  imBTCPrice,
} = require('./src/utils/config/api.config');

const {
  ERROR_CODE,
  ERROR_MSG,
} = require('./src/utils/config/error.config');


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const monitorData = {
  'app': 'syncPrice',
  'data': {},
  'err_code': ERROR_CODE.NO_ERROR,
  'err_msg': ERROR_MSG.NO_ERROR,
  'server': serviceName,
  'timestamp': 0,
  'version': '0.1.0',
};

const duration = 30000;
const priceData = {};
const medianData = {};
let endflag = 0;
let time;

async function parsePriceData(priceData, currency, timestamp) {

  const data = [];
  let result;
  let price = '0';
  let endSign = false;
  console.log(`parsePriceData : ${currency} ; timestamp : ${timestamp}----------------------------\n`);
  for (let index = 0; index < priceData.length; index++) {
    price = '0';
    endSign = false;
    console.log(`exchange: ${priceData[index].sign}, ${timestamp}, length: ${data.length}`);
    console.log(`res: ${JSON.stringify(priceData[index])}`);
    console.log('\n');
    if (!priceData[index].data)
      continue;

    try {
      // eslint-disable-next-line eqeqeq
      result = priceData[index].data == String ? JSON.parse(priceData[index].data) : priceData[index].data;
      if (!(result instanceof Object))
        continue;
      switch (priceData[index].sign) {
        case apiPriceConfig.exchange[0]:
          if (result.hasOwnProperty('price') && result.price && !isNaN(result.price)) {
            price = result.price.toString();
            endSign = true;
          }
          break;
        case apiPriceConfig.exchange[1]:
          if (result.hasOwnProperty('last') && result.last && !isNaN(result.last)) {
            price = result.last.toString();
            endSign = true;
          }
          break;
        case apiPriceConfig.exchange[2]:
          if (result.hasOwnProperty('tick')
            && result.tick instanceof Object
            && result.tick.hasOwnProperty('close')
            && result.tick.close
            && !isNaN(result.tick.close)
          ) {
            price = result.tick.close.toString();
            endSign = true;
          }
          break;
        case apiPriceConfig.exchange[3]:
          if (result.hasOwnProperty('last') && result.last && !isNaN(result.last)) {
            price = result.last.toString();
            endSign = true;
          }
          break;
        case apiPriceConfig.exchange[4]:
          if (Array.isArray(result)
            && Array.isArray(result[0])
            && result[0].length > 7
            && result[0][7]
            && !isNaN(result[0][7])
          ) {
            price = result[0][7].toString();
            endSign = true;
          }
          break;
        case apiPriceConfig.exchange[5]:
          if (result.hasOwnProperty('result')
            && result.result instanceof Object
            && result.result.hasOwnProperty('Last')
            && result.result.Last
            && !isNaN(result.result.Last)
          ) {
            price = result.result.Last.toString();
            endSign = true;
          }
          break;
        case apiPriceConfig.exchange[6]:
          if (result.hasOwnProperty('data')
            && result.data instanceof Object
            && result.data.hasOwnProperty('price')
            && result.data.price
            && !isNaN(result.data.price)
          ) {
            price = result.data.price.toString();
            endSign = true;
          }
          break;
        case apiPriceConfig.exchange[7]:
          if (result.hasOwnProperty('price') && result.price && !isNaN(result.price)) {
            price = result.price.toString();
            endSign = true;
          }
          break;
        case apiPriceConfig.exchange[8]:
          if (result.error.length === 0
            && result.result instanceof Object
            && Object.values(result.result)[0].c[0]
            && !isNaN(Object.values(result.result)[0].c[0])
          ) {
            price = (Object.values(result.result)[0].c[0]).toString();
            endSign = true;
          }
          break;
        case apiPriceConfig.exchange[9]:
          if (result.hasOwnProperty('last') && result.last && !isNaN(result.last)) {
            price = result.last.toString();
            endSign = true;
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.log(error);
      monitorData.err_code = ERROR_CODE.SYNC_PRICE_PARSE_ERROR;
      monitorData.err_msg = ERROR_MSG.SYNC_PRICE_PARSE_ERROR;
      monitorData.timestamp = Math.ceil(Date.now() / 1000);
      monitorData.data = {
        'currency': currency,
        'error_msg': error,
        'exchange': priceData[index].sign,
        'info': priceData[index],
      };
      post(monitorGetPriceUrl, monitorData);
    }

    if (endSign) {
      let finalPrice = price.toString();
      if (currency === 'dsr' && (priceData[index].sign === 'bitfinex' || priceData[index].sign === 'bittrex')) {
        finalPrice = (1 / finalPrice).toFixed(6);
      }
      data.push([priceData[index].sign, currency, finalPrice, endSign, timestamp]);
    }
  }
  console.log(`currency: ${currency}, ${timestamp}, length: ${data.length}`);
  console.log(data);
  if (data.length < medianStrategy[currency].leastValidValue) {
    monitorData.err_code = ERROR_CODE.SYNC_PRICE_FILTER_ERROR;
    monitorData.err_msg = ERROR_MSG.SYNC_PRICE_FILTER_ERROR;
    monitorData.timestamp = Math.ceil(Date.now() / 1000);
    monitorData.data = {
      'currency': currency,
      'info': data,
      'length': data.length,
    };
    post(monitorGetPriceUrl, monitorData);
    return data;
  }
  oraclePrice.insertExchangePrice(data);
  await delay(200);
  oraclePrice.cleanDatabase(500);

  monitorData.err_code = ERROR_CODE.NO_ERROR;
  monitorData.err_msg = ERROR_MSG.NO_ERROR;
  monitorData.timestamp = Math.ceil(Date.now() / 1000);
  monitorData.data = {
    'currency': currency,
    'info': data,
    'length': data.length,
  };
  post(monitorGetPriceUrl, monitorData);

  return data;
}

// TODO: move out, only for imBTC
async function verifyTokenlonPrice(exchangeName, assetName, calculatingBTCPrice) {
  let huobiPrice = '';
  let tokenlonPrice = '';
  if (assetName === 'imbtc') {
    try {
      tokenlonPrice = await request(imBTCPrice);
      if (tokenlonPrice.hasOwnProperty('data')
        && tokenlonPrice.data instanceof Object
        && tokenlonPrice.data.hasOwnProperty('bid')
        && tokenlonPrice.data.bid
        && !isNaN(tokenlonPrice.data.bid)
      ) {
        let getImBTCPrice = tokenlonPrice.data.bid;
        getImBTCPrice = (10 ** 8 / getImBTCPrice).toFixed();

        const imBTCSwing = medianStrategy.imbtc.safePriceSwing;
        const btcSwing = Math.abs(calculatingBTCPrice - getImBTCPrice) / getImBTCPrice;
        if (imBTCSwing >= btcSwing) {
          monitorData.err_code = ERROR_CODE.NO_ERROR;
          monitorData.err_msg = ERROR_MSG.NO_ERROR;
          monitorData.timestamp = Math.ceil(Date.now() / 1000);
          monitorData.data = {
            'Tokenlon_price': getImBTCPrice,
            'exchange_price': calculatingBTCPrice,
          };
          post(monitorGetPriceUrl, monitorData);
        } else {
          monitorData.err_code = ERROR_CODE.IMBTC_PRICE_ERROR;
          monitorData.err_msg = ERROR_MSG.IMBTC_PRICE_ERROR;
          monitorData.timestamp = Math.ceil(Date.now() / 1000);
          monitorData.data = {
            'Tokenlon_price': getImBTCPrice,
            'exchange_price': calculatingBTCPrice,
          };
          post(monitorGetPriceUrl, monitorData);
        }
        console.log('tokenlon price', getImBTCPrice);
        console.log('exchange price', calculatingBTCPrice);
        if (calculatingBTCPrice < getImBTCPrice) {
          return {
            'exchange': exchangeName,
            'price': calculatingBTCPrice,
            'result': true,
          };
        } else {
          return {
            'exchange': 'tokenlon',
            'price': getImBTCPrice,
            'result': true,
          };
        }
      } else {
        console.log('Get tokenlon price error: ');
        monitorData.err_code = ERROR_CODE.IMBTC_API_ERROR;
        monitorData.err_msg = ERROR_MSG.IMBTC_API_ERROR;
        monitorData.timestamp = Math.ceil(Date.now() / 1000);
        monitorData.data = {
          'info': tokenlonPrice,
        };
        post(monitorGetPriceUrl, monitorData);
      }
    } catch (error) {
      console.log('Got an error: ', error);
      monitorData.err_code = ERROR_CODE.IMBTC_API_ERROR;
      monitorData.err_msg = ERROR_MSG.IMBTC_API_ERROR;
      monitorData.timestamp = Math.ceil(Date.now() / 1000);
      monitorData.data = {
        'info': error,
      };
      post(monitorGetPriceUrl, monitorData);
    }
  } else if (assetName === 'hbtc') {
    try {
      huobiPrice = await request(hbtcPrice);

      if (huobiPrice.hasOwnProperty('tick')
        && huobiPrice.tick instanceof Object
        && huobiPrice.tick.hasOwnProperty('bid')
        && Array.isArray(huobiPrice.tick.bid)
        && huobiPrice.tick.bid[0]
        && !isNaN(huobiPrice.tick.bid[0])
      ) {
        let btcPrice = huobiPrice.tick.bid[0];
        btcPrice = (btcPrice * 10 ** 8).toFixed();

        const hbtcSwing = medianStrategy.hbtc.safePriceSwing;
        const btcSwing = Math.abs(calculatingBTCPrice - btcPrice) / btcPrice;
        if (hbtcSwing >= btcSwing) {
          monitorData.err_code = ERROR_CODE.NO_ERROR;
          monitorData.err_msg = ERROR_MSG.NO_ERROR;
          monitorData.timestamp = Math.ceil(Date.now() / 1000);
          monitorData.data = {
            'Huobi_price': btcPrice,
            'exchange_price': calculatingBTCPrice,
          };
          post(monitorGetPriceUrl, monitorData);
          console.log('huobi price', btcPrice);
          console.log('exchange price', calculatingBTCPrice);
        } else {
          monitorData.err_code = ERROR_CODE.HBTC_PRICE_ERROR;
          monitorData.err_msg = ERROR_MSG.HBTC_PRICE_ERROR;
          monitorData.timestamp = Math.ceil(Date.now() / 1000);
          monitorData.data = {
            'Huobi_price': btcPrice,
            'exchange_price': calculatingBTCPrice,
          };
          post(monitorGetPriceUrl, monitorData);
        }
        if (calculatingBTCPrice < btcPrice) {
          return {
            'exchange': exchangeName,
            'price': calculatingBTCPrice,
            'result': true,
          };
        } else {
          return {
            'exchange': 'huobiHBTC',
            'price': btcPrice,
            'result': true,
          };
        }
      } else {
        console.log('Get tokenlon price error: ');
        monitorData.err_code = ERROR_CODE.IMBTC_API_ERROR;
        monitorData.err_msg = ERROR_MSG.IMBTC_API_ERROR;
        monitorData.timestamp = Math.ceil(Date.now() / 1000);
        monitorData.data = {
          'info': tokenlonPrice,
        };
        post(monitorGetPriceUrl, monitorData);
      }
    } catch (error) {
      console.log('Got an error: ', error);
      monitorData.err_code = ERROR_CODE.IMBTC_API_ERROR;
      monitorData.err_msg = ERROR_MSG.IMBTC_API_ERROR;
      monitorData.timestamp = Math.ceil(Date.now() / 1000);
      monitorData.data = {
        'info': error,
      };
      post(monitorGetPriceUrl, monitorData);
    }
  }
  return {
    'result': false,
  };
}

async function main() {

  oraclePrice.initDB();
  await delay(200);
  // eslint-disable-next-line no-constant-condition
  while (true) {

    console.log('start----------------------------\n');
    time = Math.ceil(Date.now() / 1000);
    for (let i = 0; i < supportAssets.length; i++) {

      priceData[supportAssets[i]] = [];
      for (let index = 0; index < apiPriceConfig.apiList[supportAssets[i]].length; index++) {
        // eslint-disable-next-line max-len
        // TODO:
        const requestURL = apiPriceConfig.apiList[supportAssets[i]][index];
        const exchangeName = requestURL.split('.')[1];
        asyncGet(requestURL, duration, priceData[supportAssets[i]], exchangeName);
        // eslint-disable-next-line max-len
        console.log(`sync ${supportAssets[i]} price [${index}]:${apiPriceConfig.exchange[index]}  url: ${apiPriceConfig.apiList[supportAssets[i]][index]}`);
      }
      monitorData.err_code = ERROR_CODE.NO_ERROR;
      monitorData.err_msg = ERROR_MSG.NO_ERROR;
      monitorData.timestamp = Math.ceil(Date.now() / 1000);
      monitorData.data = {
        'exchange': supportAssets[i],
        'info': 'Get exchange price',
      };
      post(monitorGetPriceUrl, monitorData);
    }

    while (endflag < supportAssets.length) {
      for (let index = 0; index < supportAssets.length; index++) {
        if (priceData[supportAssets[index]].length === medianStrategy[supportAssets[index]].allExchanges) {
          // eslint-disable-next-line max-len
          medianData[supportAssets[index]] = await parsePriceData(priceData[supportAssets[index]], supportAssets[index], time);
          // eslint-disable-next-line require-atomic-updates
          priceData[supportAssets[index]] = [];
          // eslint-disable-next-line require-atomic-updates
          endflag += 1;
        }
      }
      await delay(200);
    }

    endflag = 0;

    const data = [];
    // eslint-disable-next-line no-var
    var priceMedian;
    for (let index = 0; index < supportAssets.length; index++) {

      if (medianData[supportAssets[index]].length < medianStrategy[supportAssets[index]].leastValidValue)
        continue;

      priceMedian = getMedian(medianData[supportAssets[index]]);

      console.log(supportAssets[index]);
      console.log(priceMedian.result);
      console.log(priceMedian.median.toString());
      if (priceMedian.result) {

        // eslint-disable-next-line eqeqeq
        if (supportAssets[index] == 'imbtc' || supportAssets[index] == 'hbtc') {

          // eslint-disable-next-line max-len
          const btcPrice = await verifyTokenlonPrice(priceMedian.exchange, supportAssets[index], priceMedian.median.toString());
          console.log(btcPrice);
          if (btcPrice.result) {
            data.push([btcPrice.exchange, supportAssets[index], btcPrice.price.toString(), time]);
          }
        } else
          data.push([priceMedian.exchange, supportAssets[index], priceMedian.median.toString(), time]);
      } else {
        monitorData.err_code = ERROR_CODE.SYNC_PRICE_MEDIAN_ERROR;
        monitorData.err_msg = ERROR_MSG.SYNC_PRICE_MEDIAN_ERROR;
        monitorData.timestamp = Math.ceil(Date.now() / 1000);
        monitorData.data = {
          'currency': supportAssets[index],
          'info': priceMedian,
        };
        post(monitorGetPriceUrl, monitorData);
      }
    }
    console.log(data);

    if (data.length)
      oraclePrice.insertFeedPrice(data);

    console.log('medianData----------------------------\n');
    console.log(medianData);
    console.log('end----------------------------\n\n');
    await delay(50000);
  }
}

main();

http.createServer(async function(req, res) {

  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
  });
  const urlInfo = url.parse(req.url, true);
  let result = 'parameter error';
  console.log('local request : ', req.url);
  let data = '';
  for (const key in urlInfo.query) {
    switch (key) {
      case 'model':
        switch (urlInfo.query[key]) {
          case 'feedPrice':
            if (urlInfo.query.currency) {
              result = await oraclePrice.getFeedPrice(urlInfo.query.currency);
              if (result[0].id == null)
                result = [{}];
              result = JSON.stringify(result);
              res.end(`${result}`);
            }
            break;
          case 'lendfMePrice':
            if (urlInfo.query.asset) {
              result = await oraclePrice.getLendfMePrice(urlInfo.query.asset);
              if (result[0].id == null)
                result = [{}];
              result = JSON.stringify(result);
              res.end(`${result}`);
            }
            break;
          case 'insertLendfMePrice':
            req.on('data', async function(chunk) {
              data += chunk;
              console.log(data);
              oraclePrice.insertLendfMePrice(JSON.parse(data));
              res.end(`${data}`);
            });
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
    break;
  }
}).listen(localPort);
