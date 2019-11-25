const {
    binanceBTCPrice,
    binanceETHPrice,
    binanceUSDTPrice,
    bitfinexBTCPrice,
    bitfinexETHPrice,
    bitfinexUSDTPrice,
    bittrexBTCPrice,
    bittrexETHPrice,
    bittrexUSDTPrice,
    gateBTCPrice,
    gateUSDCPrice,
    gateUSDTPrice,
    hitbtcBTCPrice,
    hitbtcETHPrice,
    hitbtcUSDTPrice,
    huobiproBTCPrice,
    huobiproETHPrice,
    huobiproUSDTPrice,
    kucoinBTCPrice,
    kucoinETHPrice,
    kucoinUSDTPrice,
} = require('../utils/api.config')

const {
    safePriceSwing,
} = require('../utils/config')

const {
    ethgasstationAPI
} = require('../utils/config/common.config')

const {
    request
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
            "price": binancePrice,
        })
    }

    // get price from bitfinex.
    let bitfinexPrice = await request(bitfinexBTCPrice)
    bitfinexPrice = bitfinexPrice[0][7]
    if (bitfinexPrice > 0) {
        allPrices.push({
            "exchangeName": "bitfinex",
            "price": bitfinexPrice,
        })
    }

    // get price from bittrex.
    let bittrexPrice = await request(bittrexBTCPrice)
    bittrexPrice = bittrexPrice.result.Last
    if (bittrexPrice > 0) {
        allPrices.push({
            "exchangeName": "bittrex",
            "price": bittrexPrice,
        })
    }

    // get price from gate.io.
    let gatePrice = await request(gateBTCPrice)
    gatePrice = gatePrice.last
    if (gatePrice > 0) {
        allPrices.push({
            "exchangeName": "gate",
            "price": gatePrice,
        })
    }

    // get price from huobipro.
    let huobiPrice = await request(huobiproBTCPrice)
    huobiPrice = huobiPrice.tick.data[0].price
    if (huobiPrice > 0) {
        allPrices.push({
            "exchangeName": "huobi",
            "price": huobiPrice,
        })
    }

    // get price from hitbtc.
    let hitbtcPrice = await request(hitbtcBTCPrice)
    hitbtcPrice = hitbtcPrice.last
    if (hitbtcPrice > 0) {
        allPrices.push({
            "exchangeName": "hitbtc",
            "price": hitbtcPrice,
        })
    }

    // get price from kucoin.
    let kucoinPrice = await request(kucoinBTCPrice)
    kucoinPrice = kucoinPrice.data.price
    if (kucoinPrice > 0) {
        allPrices.push({
            "exchangeName": "kucoin",
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
        return [true, validPrices]
    } else {
        retrayBTCTimes = retrayBTCTimes + 1
        if (retrayBTCTimes >= 5) {
            retrayBTCTimes = 0
            return [false, validPrices]
        }
        await getBTCPrice()
    }
}

// NOTICE: current we get ETH price form Oracle.
async function getETHPrice() {
    console.log('\n')
    console.log("start to get eth price")
    let allPrices = []
    let validPrices = []
    let midValue = 0
    let averagePrice = 0

    let binancePrice = await request(binanceETHPrice)
    binancePrice = binancePrice.price
    if (binancePrice > 0) {
        allPrices.push({
            "exchangeName": "binance",
            "price": binancePrice,
        })
    }

    let bitfinexPrice = await request(bitfinexETHPrice)
    bitfinexPrice = bitfinexPrice[0][7]
    if (bitfinexPrice > 0) {
        allPrices.push({
            "exchangeName": "bitfinex",
            "price": bitfinexPrice,
        })
    }

    let bittrexPrice = await request(bittrexETHPrice)
    bittrexPrice = bittrexPrice.result.Last
    if (bittrexPrice > 0) {
        allPrices.push({
            "exchangeName": "bittrex",
            "price": bittrexPrice,
        })
    }

    let gateUSDC = await request(gateUSDCPrice)
    gateUSDC = gateUSDC.last
    let gateUSDT = await request(gateUSDTPrice)
    gateUSDT = gateUSDT.last
    let gatePrice = gateUSDT / gateUSDC
    if (gateUSDT > 0 && gateUSDC > 0) {
        allPrices.push({
            "exchangeName": "gate",
            "price": gatePrice,
        })
    }

    let huobiPrice = await request(huobiproETHPrice)
    huobiPrice = huobiPrice.tick.data[0].price
    if (huobiPrice > 0) {
        allPrices.push({
            "exchangeName": "huobi",
            "price": huobiPrice,
        })
    }

    let hitbtcPrice = await request(hitbtcETHPrice)
    hitbtcPrice = hitbtcPrice.last
    if (hitbtcPrice > 0) {
        allPrices.push({
            "exchangeName": "hitbtc",
            "price": hitbtcPrice,
        })
    }

    let kucoinPrice = await request(kucoinETHPrice)
    kucoinPrice = kucoinPrice.data.price
    if (kucoinPrice > 0) {
        allPrices.push({
            "exchangeName": "kucoin",
            "price": kucoinPrice,
        })
    }

    allPrices.sort(function (a, b) {
        return a.price - b.price
    })

    console.log("all eth price are ", allPrices)

    if (allPrices.length === 0) {
        await getETHPrice()
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
        return [true, validPrices]
    } else {
        retrayETHTimes = retrayETHTimes + 1
        if (retrayETHTimes >= 5) {
            retrayETHTimes = 0
            return [false, validPrices]
        }
        await getETHPrice()
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
            "price": binancePrice,
        })
    }

    // get price from bitfinex
    let bitfinexPrice = await request(bitfinexUSDTPrice)
    bitfinexPrice = bitfinexPrice[0][7]
    if (bitfinexPrice > 0) {
        allPrices.push({
            "exchangeName": "bitfinex",
            "price": bitfinexPrice,
        })
    }

    // get price from bittrex
    let bittrexETH = await request(bittrexETHPrice)
    bittrexETH = bittrexETH.result.Last
    let bittrexUSDT = await request(bittrexUSDTPrice)
    bittrexUSDT = bittrexUSDT.result.Last
    let bittrexPrice = bittrexETH / bittrexUSDT
    if (bittrexETH > 0 && bittrexUSDT > 0) {
        allPrices.push({
            "exchangeName": "bittrex",
            "price": bittrexPrice,
        })
    }

    // get price from gate.io
    let gatePrice = await request(gateUSDTPrice)
    gatePrice = gatePrice.last
    if (gatePrice > 0) {
        allPrices.push({
            "exchangeName": "gate",
            "price": gatePrice,
        })
    }

    // get price from hitbtc
    let hitbtcPrice = await request(hitbtcUSDTPrice)
    hitbtcPrice = hitbtcPrice.last
    if (hitbtcPrice > 0) {
        allPrices.push({
            "exchangeName": "hitbtc",
            "price": hitbtcPrice,
        })
    }

    // get price from huobi
    let huobiPrice = await request(huobiproUSDTPrice)
    huobiPrice = huobiPrice.tick.data[0].price
    if (huobiPrice > 0) {
        allPrices.push({
            "exchangeName": "huobi",
            "price": huobiPrice,
        })
    }

    // get price from kucoin
    let kucoinPrice = await request(kucoinUSDTPrice)
    kucoinPrice = kucoinPrice.data.price
    if (kucoinPrice > 0) {
        allPrices.push({
            "exchangeName": "kucoin",
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
        return [true, validPrices]
    } else {
        retrayUSDTTimes = retrayUSDTTimes + 1
        if (retrayUSDTTimes >= 5) {
            retrayUSDTTimes = 0
            return [false, validPrices]
        }
        await getUSDTPrice()
    }
}

async function getGasPrice() {
    let result = await request(ethgasstationAPI)
    return result
}

module.exports = {
    getBTCPrice,
    getETHPrice,
    getGasPrice,
    getUSDTPrice,
}
