## Oracle System:

Version: multi-collateral V1.5

Get and calculate price from off-chain source, and then set for the Lendf.me System.

## Guide:

For version 1.5, there will be four collateral:

- USDx
- USDT
- WETH
- imBTC

At the beginnig, we just set price for USDT and imBTC, we will get ETH price from oracle.

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

Calculate median and average, if they differ by less than 1%, we think all prices are valid, so we use the median as the price to feed.

When try to set a new price, we will determine whether the price exceeds the price of the `pendingAnchor` which is set in the contract `PriceOracle.sol` by 10%. If so, after feeding this price, if admin does not update value of the `pendingAnchor`, we can not set a price that exceeds 10% in an hour.

### Install

```
~/$ git clone https://github.com/Lendfme/oraclesystem.git
~/$ cd ./oraclesystem
~/oraclesystem$ npm install
```

### Run

```
~/oraclesystem$ node syncPrice.js
~/oraclesystem$ node priceFeed.js
```
