## Oracle System:

Version: multi-collateral V1.5

Get and calculate price from off-chain source, and then set for the Lendf.me System.

## Overview:

For version 1.5, collateral assets will be:

- USDx
- USDT
- WETH
- imBTC
- HBTC

Feeding price every 10 minutes, we try to get price from these exchanges:

- Binance
- Bitfinex
- Bittrex
- HitBTC
- Huobi
- Gate.io
- KuCoin

### Intervals

There will two conditions:

- every 12 hours
- price floats more than 1% every 5 minutes

if the new price meets either of these two conditions, we will set a new price.

### Value

Calculate median and compare the median value to each value, if they differ by less than 1%, we think all prices are valid, so we use the median as the price to feed.

_Notice: more details on median calculations, you can find at [here](./src/helpers/Strategy.png)_

_Notice: when we set the price has exceeded the price of the `pendingAnchor` by ±10%, the final price will be ±10% of the `pendingAnchor` price, if admin does not update value of the `pendingAnchor`, we can not set a price that exceeds ±10% in an hour._

## Guide:

### Install

```
~/$ git clone https://github.com/Lendfme/oraclesystem.git
~/$ cd ./oraclesystem
~/oraclesystem$ npm install
```

### Set config

```
~/oraclesystem$ mv ./.example.env ./.env
```

According to your favour, edit these files:

```
.env
./src/utils/config/base.config.js
```

### Run

```
~/oraclesystem$ node syncPrice.js
~/oraclesystem$ node priceFeed.js
```
