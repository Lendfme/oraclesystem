const BN = require('bn.js');

const {
  mantissaOne,
  posterAccount,
} = require('./src/utils/config/common.config');

const {
  assets,
  btcMantissa,
  btcs,
  netType,
  minBalance,
  monitorPostPriceUrl,
  moment,
  oracleContract,
  referenceBTC,
  referenceStableCoin,
  serviceName,
  stableCoinMantissa,
  stableCoins,
  supportAssets,
  supposedMantissa,
  getUrl,
} = require('./src/utils/config/base.config');

const {
  ERROR_CODE,
  ERROR_MSG,
} = require('./src/utils/config/error.config');

const {
  log,
} = require('./src/utils/logger/log');

const {
  web3Provider,
} = require('./src/utils/server/provider');

const {
  Account,
} = require('./src/eth/account/accountInfo');

const {
  Oracle,
} = require('./src/eth/contract/oracle');

const {
  post,
  request,
} = require('./src/helpers/request');

const {
  feedPrice,
  getIntervalTime,
} = require('./src/helpers/strategy');

const {
  verify,
} = require('./src/helpers/verify');

let currentBalance = 0;
let verifyResult = {
  'msg': ERROR_MSG.NO_WRITING,
  'status': ERROR_CODE.NO_ERROR,
};
let currentTime = 0;
let currentBalanceFromWei = 0;
let previousTime = 0;

// TODO:
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function feed() {
  const currentNet = netType.toUpperCase();
  try {
    const web3 = web3Provider(netType);
    log.debug('\n');
    log.debug('-----------------------------------');
    log.debug(currentNet, ' start to feed price ...');
    // init
    const account = new Account(netType, web3);
    const priceOracle = new Oracle(netType, oracleContract[netType], web3);
    // feed price result
    let result = {};
    // exchange price
    const getPrices = [];
    // contract price
    const actualPrices = [];

    const anchorPrices = [];
    const poster = await priceOracle.getPoster();
    // eslint-disable-next-line eqeqeq
    if (poster != posterAccount) {
      currentTime = Math.round(new Date().getTime() / 1000);
      const data = {
        'app': 'feed_price',
        'data': {
          'contract_poster_address': poster,
          'current_poster_address': posterAccount,
        },
        'err_code': ERROR_CODE.AUTHORITY_LIMITED,
        'err_msg': ERROR_MSG.AUTHORITY_LIMITED,
        'net': netType,
        'server': serviceName,
        'timestamp': currentTime,
        'version': '',
      };
      const result = await post(monitorPostPriceUrl, data);
      log.error('Request data is: ', data.err_msg);
      log.error('Request response is: ', result.data);
      log.error(currentNet, ' current poster is: ', posterAccount, 'contract poster is: ', poster);
      return;
    }

    currentBalance = await account.getBalance(priceOracle.poster);
    currentBalanceFromWei = web3.utils.fromWei(currentBalance.toString(), 'ether');
    log.debug(currentNet, ' current balance is: ', currentBalanceFromWei);
    currentTime = Math.round(new Date().getTime() / 1000);
    if (currentBalanceFromWei < minBalance) {
      log.warn(currentNet, 'Attention to your balance! please deposit more!');
      const data = {
        'app': 'feed_price',
        'data': {
          'eth_balance': currentBalanceFromWei,
        },
        'err_code': ERROR_CODE.INSUFFICIENT_BALANCE,
        'err_msg': ERROR_MSG.INSUFFICIENT_BALANCE,
        'net': netType,
        'server': serviceName,
        'timestamp': currentTime,
        'version': '',
      };
      const result = await post(monitorPostPriceUrl, data);
      log.warn('Request data is: ', data);
      log.warn('Request response is: ', result.status);
    }

    // get all assets current price and pending anchor price
    for (let i = 0, len = supportAssets.length; i < len; i++) {
      let anchorPrice = await priceOracle.getPendingAnchor(assets[netType][supportAssets[i]]);
      anchorPrices.push(anchorPrice);
      log.debug(`${currentNet} ${supportAssets[i]} pending anchor is: ${anchorPrice.priceMantissa.toString()}`);
      anchorPrice = new BN(anchorPrice.priceMantissa);

      const requestUrl = getUrl('feedPrice', supportAssets[i]);
      let currentPrice = await request(requestUrl);
      log.debug(currentNet, ' get current price is: ', currentPrice);
      if (typeof (currentPrice) == 'undefined') {
        const data = {
          'app': 'feed_price',
          'data': {
            'error': 'Can not get price from syncPrice file!',
          },
          'err_code': ERROR_CODE.SYNC_PRICE_KILLED,
          'err_msg': ERROR_MSG.SYNC_PRICE_KILLED,
          'net': netType,
          'server': serviceName,
          'timestamp': currentTime,
          'version': '',
        };
        const result = await post(monitorPostPriceUrl, data);
        log.error('Request data is: ', data.err_msg);
        log.error('Request response is: ', result.data);
        continue;
      }
      const prevoiusSyncTime = currentPrice[0].timestamp;
      if (currentTime - prevoiusSyncTime > 300) {
        const data = {
          'app': 'feed_price',
          'data': {
            'current_time': currentTime,
            'last_sync_time': prevoiusSyncTime,
          },
          'err_code': ERROR_CODE.SYNC_PRICE_ERROR,
          'err_msg': ERROR_MSG.SYNC_PRICE_ERROR,
          'net': netType,
          'server': serviceName,
          'timestamp': currentTime,
          'version': '',
        };
        const result = await post(monitorPostPriceUrl, data);
        log.error('Request data is: ', data.err_msg);
        log.error('Request response is: ', result.data);
        continue;
      }

      log.debug(`${currentNet} ${supportAssets[i]} current price is: ${currentPrice[0].price.toString()}`);
      currentPrice = new BN(currentPrice[0].price);

      const toWritePrice = mantissaOne.mul(new BN(10 ** 8)).div(currentPrice).mul(new BN(10 ** supposedMantissa[i]));
      getPrices.push([supportAssets[i], toWritePrice.toString(), assets[netType][supportAssets[i]]]);
      const finalPrice = priceOracle.getFinalPrice(supportAssets[i], anchorPrice, toWritePrice);
      actualPrices.push([supportAssets[i], finalPrice.toString(), assets[netType][supportAssets[i]]]);
    }

    log.debug(' Get prices are: ', getPrices);
    log.debug(' Actual prices are: ', actualPrices);

    const finalWritingPrices = [];
    const finalAssets = [];
    const assetNames = [];
    let previousPrice = 0;
    const toVerifyPrices = [];

    for (let i = 0, len = getPrices.length; i < len; i++) {
      log.debug(currentNet, ' last feeding time is: ', previousTime);
      previousPrice = await priceOracle.getPrice(getPrices[i][2]);
      log.debug(currentNet, ` ${getPrices[i][0]} get price from contract is: `, previousPrice.toString());
      const currentBlockNumber = await priceOracle.getBlockNumber();
      if (previousTime !== 0) {
        result = feedPrice(
          getPrices[i][1],
          actualPrices[i][1],
          previousPrice,
          previousTime,
          anchorPrices[i].period, currentBlockNumber);
      } else {
        // only for the first time.
        result.type = true;
        result.feedPrice = getPrices[i][1];
        result.actualPrice = actualPrices[i][1];
      }

      if (result.type) {
        if (getPrices[i][0] === referenceStableCoin) {
          for (let j = 0, len = stableCoins.length; j < len; j++) {
            assetNames.push(stableCoins[j]);
            finalWritingPrices.push(((new BN(getPrices[i][1])).mul(new BN(10**(stableCoinMantissa[j])))).toString());
            toVerifyPrices.push(((new BN(result.actualPrice)).mul(new BN(10**(stableCoinMantissa[j])))).toString());
            finalAssets.push(assets[netType][stableCoins[j]]);
          }
        } else if (getPrices[i][0] === referenceBTC) {
          for (let j = 0, len = btcs.length; j < len; j++) {
            assetNames.push(btcs[j]);
            finalWritingPrices.push(((new BN(getPrices[i][1])).mul(new BN(10**(btcMantissa[j])))).toString());
            toVerifyPrices.push(((new BN(result.actualPrice)).mul(new BN(10**(btcMantissa[j])))).toString());
            finalAssets.push(assets[netType][btcs[j]]);
          }
        }
        assetNames.push(getPrices[i][0]);
        finalWritingPrices.push(getPrices[i][1]);
        toVerifyPrices.push(result.actualPrice);
        finalAssets.push(getPrices[i][2]);
      }
    }

    // eslint-disable-next-line require-atomic-updates
    currentTime = Math.round(new Date().getTime() / 1000);
    verifyResult.status = ERROR_CODE.NO_ERROR;
    if (finalWritingPrices.length !== 0) {
      log.info(currentNet, ' Current time is: ', currentTime);
      log.info('You are going to set for assets are: ', finalAssets);
      log.info('You are going to set new prices are: ', finalWritingPrices);
      const setPriceResult = await priceOracle.setPrices(finalAssets, finalWritingPrices);
      if (setPriceResult.status) {
        log.info(currentNet, ' Set new price!', finalWritingPrices);
        log.info(' Final prices are: ', actualPrices);
        previousTime = currentTime;
      } else {
        log.error('You get an error when set new price!');
        throw new Error('Feed price failed!');
      }
      // in order to wait to get latest contract status through infura node.
      await delay(20000);
      verifyResult = await verify(priceOracle, finalAssets, toVerifyPrices);
    }

    // TODO: Debug
    const data = {
      'app': 'feed_price',
      'data': {
        'contract_price': actualPrices,
        'exchange_price': getPrices,
      },
      'err_code': verifyResult.status,
      'err_msg': verifyResult.msg,
      'eth_balance': currentBalanceFromWei,
      'net': netType,
      'server': serviceName,
      'timestamp': currentTime,
      'version': '',
    };
    const response = await post(monitorPostPriceUrl, data);
    log.debug('Request data is: ', data.err_msg);
    log.debug('Request response is: ', response.data);
  } catch (err) {
    log.error('You get an error in try-catch', err);

    const data = {
      'app': 'feed_price',
      'data': {
        'error': err.message,
      },
      'err_code': ERROR_CODE.UNSPECTED_ERROR,
      'err_msg': ERROR_MSG.UNSPECTED_ERROR,
      'net': netType,
      'server': serviceName,
      'timestamp': currentTime,
      'version': '',
    };
    const result = await post(monitorPostPriceUrl, data);
    log.error('Request data is: ', data.err_msg);
    log.error('Request response is: ', result.data);
  }
  return;
}

async function main() {
  log.debug('\n\n\n');
  log.debug('Init files');
  log.debug('start to run!');
  log.debug('-------------------------------------------');
  log.debug('-------------------------------------------');
  log.debug('\n\n\n');

  await delay(getIntervalTime(moment, true));

  // eslint-disable-next-line no-constant-condition
  while (true) {
    feed();
    await delay(getIntervalTime(moment));
    await delay(2000);
  }
}

main();
