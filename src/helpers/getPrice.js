const BN = require('bn.js')

const {
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
    hitbtcBTCPrice,
    hitbtcUSDxPrice,
    hitbtcUSDTPrice,
    huobiproBTCPrice,
    huobiproUSDxPrice,
    huobiproUSDTPrice,
    kucoinBTCPrice,
    kucoinUSDxPrice,
    kucoinUSDTPrice,
} = require('../utils/config/api.config')

const {
    medianStrategy,
    safePriceSwing,
} = require('../utils/config/base.config')

const {
    ethgasstationAPI
} = require('../utils/config/common.config')

const {
    request,
} = require('./request')

let retrayBTCTimes = 0
let retrayETHTimes = 0
let retrayUSDTTimes = 0

async function getBTCPrice() {
    console.log('\n')
    console.log("start to get btc price")
    let allPrices = []
    let validPrices = []
    let midValue = 0
    let averagePrice = 0

    // get price from binance.
    let binancePrice = await request(binanceBTCPrice)
    binancePrice = binancePrice.price
    if (binancePrice > 0) {
        allPrices.push({
            "exchangeName": "binance",
            "asset": "imbtc",
            "price": binancePrice,
        })
    }

    // get price from bitfinex.
    let bitfinexPrice = await request(bitfinexBTCPrice)
    bitfinexPrice = bitfinexPrice[0][7]
    if (bitfinexPrice > 0) {
        allPrices.push({
            "exchangeName": "bitfinex",
            "asset": "imbtc",
            "price": bitfinexPrice,
        })
    }

    // get price from bittrex.
    let bittrexPrice = await request(bittrexBTCPrice)
    bittrexPrice = bittrexPrice.result.Last
    if (bittrexPrice > 0) {
        allPrices.push({
            "exchangeName": "bittrex",
            "asset": "imbtc",
            "price": bittrexPrice,
        })
    }

    // get price from gate.io.
    let gatePrice = await request(gateBTCPrice)
    gatePrice = gatePrice.last
    if (gatePrice > 0) {
        allPrices.push({
            "exchangeName": "gate",
            "asset": "imbtc",
            "price": gatePrice,
        })
    }

    // get price from huobipro.
    let huobiPrice = await request(huobiproBTCPrice)
    huobiPrice = huobiPrice.tick.data[0].price
    if (huobiPrice > 0) {
        allPrices.push({
            "exchangeName": "huobi",
            "asset": "imbtc",
            "price": huobiPrice,
        })
    }

    // get price from hitbtc.
    let hitbtcPrice = await request(hitbtcBTCPrice)
    hitbtcPrice = hitbtcPrice.last
    if (hitbtcPrice > 0) {
        allPrices.push({
            "exchangeName": "hitbtc",
            "asset": "imbtc",
            "price": hitbtcPrice,
        })
    }

    // get price from kucoin.
    let kucoinPrice = await request(kucoinBTCPrice)
    kucoinPrice = kucoinPrice.data.price
    if (kucoinPrice > 0) {
        allPrices.push({
            "exchangeName": "kucoin",
            "asset": "imbtc",
            "price": kucoinPrice,
        })
    }

    allPrices.sort(function (a, b) {
        return a.price - b.price
    })

    console.log("all price are: ", allPrices)

    if (allPrices.length === 0) {
        await getBTCPrice()
    } else if (allPrices.length % 2 !== 0) {
        let midIndex = Math.floor(allPrices.length / 2)
        midValue = allPrices[midIndex].price
    } else if (allPrices.length % 2 === 0) {
        let midIndex = Math.floor(allPrices.length / 2)
        midValue = (allPrices[midIndex].price + allPrices[midIndex + 1].price) / 2
    }

    if (allPrices.length >= 0) {
        let totalPrice = 0
        for (let i = 0, len = allPrices.length; i < len; i++) {
            totalPrice += Number(allPrices[i].price)
        }
        averagePrice = totalPrice / allPrices.length
    }

    console.log("mid value is ", midValue)
    console.log("avg value is ", averagePrice)

    let swing = Math.abs(midValue - averagePrice) / averagePrice

    console.log("swing is", swing)
    console.log("safePriceSwing is", safePriceSwing)

    for (let i = 0, len = allPrices.length; i < len; i++) {
        let priceDifferance = Math.abs(allPrices[i].price - averagePrice) / averagePrice
        if (priceDifferance <= safePriceSwing) {
            validPrices.push(allPrices[i])
        }
    }

    if (validPrices.length >= 5 && swing <= safePriceSwing) {
        return {
            "result": true,
            "prices": validPrices,
        }
    } else {
        retrayBTCTimes = retrayBTCTimes + 1
        if (retrayBTCTimes >= 5) {
            retrayBTCTimes = 0
            return {
                "result": false,
                "prices": validPrices
            }
        }
        await getBTCPrice()
    }
}

// NOTICE: current we get ETH price form Oracle.
async function getUSDxPrice() {
    console.log('\n')
    console.log("start to get eth price")
    let allPrices = []
    let validPrices = []
    let midValue = 0
    let averagePrice = 0

    let binancePrice = await request(binanceUSDxPrice)
    binancePrice = binancePrice.price
    if (binancePrice > 0) {
        allPrices.push({
            "exchangeName": "binance",
            "asset": "eth",
            "price": binancePrice,
        })
    }

    let bitfinexPrice = await request(bitfinexUSDxPrice)
    bitfinexPrice = bitfinexPrice[0][7]
    if (bitfinexPrice > 0) {
        allPrices.push({
            "exchangeName": "bitfinex",
            "asset": "eth",
            "price": bitfinexPrice,
        })
    }

    let bittrexPrice = await request(bittrexUSDxPrice)
    bittrexPrice = bittrexPrice.result.Last
    if (bittrexPrice > 0) {
        allPrices.push({
            "exchangeName": "bittrex",
            "asset": "eth",
            "price": bittrexPrice,
        })
    }

    let gateUSDC = await request(gateUSDxPrice)
    gateUSDC = gateUSDC.last
    let gateUSDT = await request(gateUSDTPrice)
    gateUSDT = gateUSDT.last
    let gatePrice = gateUSDT / gateUSDC
    if (gateUSDT > 0 && gateUSDC > 0) {
        allPrices.push({
            "exchangeName": "gate",
            "asset": "eth",
            "price": gatePrice,
        })
    }

    let huobiPrice = await request(huobiproUSDxPrice)
    huobiPrice = huobiPrice.tick.data[0].price
    if (huobiPrice > 0) {
        allPrices.push({
            "exchangeName": "huobi",
            "asset": "eth",
            "price": huobiPrice,
        })
    }

    let hitbtcPrice = await request(hitbtcUSDxPrice)
    hitbtcPrice = hitbtcPrice.last
    if (hitbtcPrice > 0) {
        allPrices.push({
            "exchangeName": "hitbtc",
            "asset": "eth",
            "price": hitbtcPrice,
        })
    }

    let kucoinPrice = await request(kucoinUSDxPrice)
    kucoinPrice = kucoinPrice.data.price
    if (kucoinPrice > 0) {
        allPrices.push({
            "exchangeName": "kucoin",
            "asset": "eth",
            "price": kucoinPrice,
        })
    }

    allPrices.sort(function (a, b) {
        return a.price - b.price
    })

    console.log("all eth price are ", allPrices)

    if (allPrices.length === 0) {
        await getUSDxPrice()
    } else if (allPrices.length % 2 !== 0) {
        let midIndex = Math.floor(allPrices.length / 2)
        midValue = allPrices[midIndex].price
    } else if (allPrices.length % 2 === 0) {
        let midIndex = Math.floor(allPrices.length / 2)
        midValue = (allPrices[midIndex].price + allPrices[midIndex + 1].price) / 2
    }

    if (allPrices.length >= 0) {
        let totalPrice = 0
        for (let i = 0, len = allPrices.length; i < len; i++) {
            totalPrice += Number(allPrices[i].price)
        }
        averagePrice = totalPrice / allPrices.length
    }

    console.log("mid value is ", midValue)
    console.log("avg value is ", averagePrice)

    let swing = Math.abs(midValue - averagePrice) / averagePrice

    console.log("swing is", swing)
    console.log("safePriceSwing is", safePriceSwing)

    for (let i = 0, len = allPrices.length; i < len; i++) {
        let priceDifferance = Math.abs(allPrices[i].price - averagePrice) / averagePrice
        if (priceDifferance <= safePriceSwing) {
            validPrices.push(allPrices[i])
        }
    }

    if (validPrices.length >= 5 && swing <= safePriceSwing) {
        return {
            "result": true,
            "prices": validPrices,
        }
    } else {
        retrayETHTimes = retrayETHTimes + 1
        if (retrayETHTimes >= 5) {
            retrayETHTimes = 0
            return {
                "result": false,
                "prices": validPrices,
            }
        }
        await getUSDxPrice()
    }
}

async function getUSDTPrice() {
    console.log('\n')
    console.log("start to get usdt price")
    let allPrices = []
    let validPrices = []
    let midValue = 0
    let averagePrice = 0

    // get price from binance
    let binancePrice = await request(binanceUSDTPrice)
    binancePrice = binancePrice.price
    if (binancePrice > 0) {
        allPrices.push({
            "exchangeName": "binance",
            "asset": "usdt",
            "price": binancePrice,
        })
    }

    // get price from bitfinex
    let bitfinexPrice = await request(bitfinexUSDTPrice)
    bitfinexPrice = bitfinexPrice[0][7]
    if (bitfinexPrice > 0) {
        allPrices.push({
            "exchangeName": "bitfinex",
            "asset": "usdt",
            "price": bitfinexPrice,
        })
    }

    // get price from bittrex
    let bittrexPrice = await request(bittrexUSDTPrice)
    bittrexPrice = bittrexPrice.result.Last
    if (bittrexPrice > 0) {
        allPrices.push({
            "exchangeName": "bittrex",
            "asset": "usdt",
            "price": bittrexPrice,
        })
    }

    // get price from gate.io
    let gatePrice = await request(gateUSDTPrice)
    gatePrice = gatePrice.last
    if (gatePrice > 0) {
        allPrices.push({
            "exchangeName": "gate",
            "asset": "usdt",
            "price": gatePrice,
        })
    }

    // get price from hitbtc
    let hitbtcPrice = await request(hitbtcUSDTPrice)
    hitbtcPrice = hitbtcPrice.last
    if (hitbtcPrice > 0) {
        allPrices.push({
            "exchangeName": "hitbtc",
            "asset": "usdt",
            "price": hitbtcPrice,
        })
    }

    // get price from huobi
    let huobiPrice = await request(huobiproUSDTPrice)
    huobiPrice = huobiPrice.tick.data[0].price
    if (huobiPrice > 0) {
        allPrices.push({
            "exchangeName": "huobi",
            "asset": "usdt",
            "price": huobiPrice,
        })
    }

    // get price from kucoin
    let kucoinPrice = await request(kucoinUSDTPrice)
    kucoinPrice = kucoinPrice.data.price
    if (kucoinPrice > 0) {
        allPrices.push({
            "exchangeName": "kucoin",
            "asset": "usdt",
            "price": kucoinPrice,
        })
    }

    allPrices.sort(function (a, b) {
        return a.price - b.price
    })

    console.log("all price are=====", allPrices)

    if (allPrices.length === 0) {
        await getUSDTPrice()
    } else if (allPrices.length % 2 !== 0) {
        let midIndex = Math.floor(allPrices.length / 2)
        midValue = allPrices[midIndex].price
    } else if (allPrices.length % 2 === 0) {
        let midIndex = Math.floor(allPrices.length / 2)
        midValue = (allPrices[midIndex].price + allPrices[midIndex + 1].price) / 2
    }

    if (allPrices.length >= 0) {
        let totalPrice = 0
        for (let i = 0, len = allPrices.length; i < len; i++) {
            totalPrice += Number(allPrices[i].price)
        }
        averagePrice = totalPrice / allPrices.length
    }

    console.log("mid value is ", midValue)
    console.log("avg value is ", averagePrice)

    let swing = Math.abs(midValue - averagePrice) / averagePrice

    console.log("swing is", swing)
    console.log("safePriceSwing is", safePriceSwing)

    for (let i = 0, len = allPrices.length; i < len; i++) {
        let priceDifferance = Math.abs(allPrices[i].price - averagePrice) / averagePrice
        if (priceDifferance <= safePriceSwing) {
            validPrices.push(allPrices[i])
        }
    }

    if (validPrices.length >= 5 && swing <= safePriceSwing) {
        return {
            "result": true,
            "prices": validPrices,
        }
    } else {
        retrayUSDTTimes = retrayUSDTTimes + 1
        if (retrayUSDTTimes >= 5) {
            retrayUSDTTimes = 0
            return {
                "result": false,
                "prices": validPrices,
            }
        }
        await getUSDTPrice()
    }
}

// TODO: clean code
function getMedianPrice(allPrices) {
    let validPrices = []
    let midValue = 0
    let averagePrice = 0

    allPrices.sort(function (a, b) {
        return a.price - b.price
    })

    if (allPrices.length < 5) {
        return {
            "result": false,
            "median": new BN(0),
        }
    } else {
        let midIndex = Math.floor(allPrices.length / 2)
        midValue = allPrices[midIndex].price
    }

    console.log("median value is ", midValue)

    for (let i = 0, len = allPrices.length; i < len; i++) {
        let priceDifferance = Math.abs(Number(allPrices[i].price) - midValue) / midValue
        if (priceDifferance <= safePriceSwing) {
            validPrices.push(allPrices[i])
        }
    }

    if (validPrices.length < 5) {
        return {
            "result": false,
            "median": new BN(0),
        }
    } else {
        let totalPrice = 0
        for (let i = 0, len = validPrices.length; i < len; i++) {
            totalPrice += Number(validPrices[i].price)
        }
        averagePrice = totalPrice / validPrices.length
    }

    console.log("average value is ", averagePrice)

    let swing = Math.abs(midValue - averagePrice) / averagePrice

    console.log("swing is", swing)
    console.log("safePriceSwing is", safePriceSwing)

    if (swing <= safePriceSwing) {
        return {
            "result": true,
            "median": new BN((midValue * 10 ** 8).toFixed()),
        }
    } else {
        return {
            "result": false,
            "median": new BN(0),
        }
    }
}

function getMedian(allPrices) {
    let assetName = allPrices[0][1]
    let leastValidValueAmount = medianStrategy[assetName]["leastValidValue"]
    let validPrices = []
    let midValue = 0
    let averagePrice = 0

    allPrices.sort(function (a, b) {
        return a[2] - b[2]
    })

    if (allPrices.length < leastValidValueAmount) {
        return {
            "result": false,
            'exchange': '',
            "median": new BN(0),
        }
    }
    let midIndex = Math.floor(allPrices.length / 2)
    midValue = allPrices[midIndex][2]

    console.log("median value is ", midValue)

    for (let i = 0, len = allPrices.length; i < len; i++) {
        let priceDifferance = Math.abs(Number(allPrices[i][2]) - midValue) / midValue
        if (priceDifferance <= safePriceSwing) {
            validPrices.push(allPrices[i])
        }
    }

    if (validPrices.length < leastValidValueAmount) {
        return {
            "result": false,
            'exchange': '',
            "median": new BN(0),
        }
    }
    let totalPrice = 0
    for (let i = 0, len = validPrices.length; i < len; i++) {
        totalPrice += Number(validPrices[i][2])
    }
    averagePrice = totalPrice / validPrices.length

    console.log("average value is ", averagePrice)

    let swing = Math.abs(midValue - averagePrice) / averagePrice

    console.log("swing is", swing)
    console.log("safePriceSwing is", safePriceSwing)

    if (swing <= safePriceSwing) {
        return {
            "result": true,
            'exchange': allPrices[midIndex][0],
            "median": new BN((midValue * 10 ** 8).toFixed()),
        }
    }
    return {
        "result": false,
        'exchange': '',
        "median": new BN(0),
    }

}

async function getGasPrice() {
    let result = await request(ethgasstationAPI)
    return result
}

module.exports = {
    getBTCPrice,
    getUSDxPrice,
    getGasPrice,
    getUSDTPrice,
    getMedianPrice,
    getMedian,
}
