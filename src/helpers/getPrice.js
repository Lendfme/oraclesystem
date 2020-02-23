const BN = require('bn.js');

const {
  medianStrategy,
} = require('../utils/config/base.config');

const {
  ethgasstationAPI,
} = require('../utils/config/common.config');

const {
  request,
} = require('./request');

function getMedian(allPrices) {
  const assetName = allPrices[0][1];
  const leastValidValueAmount = medianStrategy[assetName].leastValidValue;
  const safePriceSwing = medianStrategy[assetName].safePriceSwing;
  const validPrices = [];
  let midValue = 0;
  let averagePrice = 0;

  allPrices.sort(function(a, b) {
    return a[2] - b[2];
  });

  if (allPrices.length < leastValidValueAmount) {
    return {
      'exchange': '',
      'median': new BN(0),
      'result': false,
    };
  }
  const midIndex = Math.floor(allPrices.length / 2);
  midValue = allPrices[midIndex][2];

  console.log('median value is ', midValue);

  for (let i = 0, len = allPrices.length; i < len; i++) {
    const priceDifferance = Math.abs(Number(allPrices[i][2]) - midValue) / midValue;
    if (priceDifferance <= safePriceSwing) {
      validPrices.push(allPrices[i]);
    }
  }

  if (validPrices.length < leastValidValueAmount) {
    return {
      'exchange': '',
      'median': new BN(0),
      'result': false,
    };
  }
  let totalPrice = 0;
  for (let i = 0, len = validPrices.length; i < len; i++) {
    totalPrice += Number(validPrices[i][2]);
  }
  averagePrice = totalPrice / validPrices.length;

  console.log('average value is ', averagePrice);

  const swing = Math.abs(midValue - averagePrice) / averagePrice;

  console.log('swing is', swing);
  console.log('safePriceSwing is', safePriceSwing);

  if (swing <= safePriceSwing) {
    return {
      'exchange': allPrices[midIndex][0],
      'median': new BN((midValue * 10 ** 8).toFixed()),
      'result': true,
    };
  }
  return {
    'exchange': '',
    'median': new BN(0),
    'result': false,
  };

}

async function getGasPrice() {
  const result = await request(ethgasstationAPI);
  return result;
}

module.exports = {
  getGasPrice,
  getMedian,
};
