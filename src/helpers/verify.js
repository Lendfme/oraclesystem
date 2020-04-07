const {
  ERROR_CODE,
} = require('../utils/config/error.config');

const {
  log,
} = require('../utils/logger/log');

async function verify(priceOracle, assets, toVerifyPrices) {
  const result = {
    'msg': [],
    'status': ERROR_CODE.NO_ERROR,
  };
  for (let i = 0, len = toVerifyPrices.length; i < len; i++) {
    const feedPrice = await priceOracle.getPrice(assets[i]);
    priceOracle.log.info(assets[i], ' current oracle price is: ', feedPrice.toString());
    priceOracle.log.info(' Previous price is: ', toVerifyPrices[i].toString());
    if (toVerifyPrices[i].toString() === '0') {
      continue;
    }
    if (toVerifyPrices[i].toString() === feedPrice.toString()) {
      result.msg.push([assets[i], toVerifyPrices[i].toString(), feedPrice.toString(), true]);
    } else {
      result.status = ERROR_CODE.FEED_ERROR;
      result.msg.push([assets[i], toVerifyPrices[i].toString(), feedPrice.toString(), false]);
      log.error('Feed price failed!');
    }
  }
  return result;
}

module.exports = {
  verify,
};
