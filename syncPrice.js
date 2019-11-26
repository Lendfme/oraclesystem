const oraclePrice = require('./src/database/oraclePrice');
const https = require('./src/helpers/https')
const apiPriceConfig = require('./src/utils/apiPriceConfig')


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

var BTCPrice = [];
var USDTPrice = [];

var endflagBTC = false;
var endflagUSDT = false;

var time;

async function parsePriceData(priceData, currency, timestamp) {

	var data = [];
	var price = '0';
	var endSign = false;
	for (let index = 0; index < priceData.length; index++) {
		price = '0';
		endSign = false;
		switch (priceData[index].sign) {
			case apiPriceConfig.exchange[0]:
				if (priceData[index].data){
					price = JSON.parse(priceData[index].data).price;
					endSign = true;
				}
				break;
			case apiPriceConfig.exchange[1]:
				if (priceData[index].data){
					price = JSON.parse(priceData[index].data).last;
					endSign = true;
				}
				break;
			case apiPriceConfig.exchange[2]:
				if (priceData[index].data){
					price = JSON.parse(priceData[index].data).tick.data[0].price;
					endSign = true;
				}
				break;
			case apiPriceConfig.exchange[3]:
				if (priceData[index].data){
					price = JSON.parse(priceData[index].data).last;
					endSign = true;
				}
				break;
			case apiPriceConfig.exchange[4]:
				if (priceData[index].data){
					price = JSON.parse(priceData[index].data)[0][7];
					endSign = true;
				}
				break;
			case apiPriceConfig.exchange[5]:
				if (priceData[index].data){
					price = JSON.parse(priceData[index].data).result.Last;
					endSign = true;
				}
				break;
			case apiPriceConfig.exchange[6]:
				if (priceData[index].data){
					price = JSON.parse(priceData[index].data).data.price;
					endSign = true;
				}
				break;
			default:
				break;
		}

		data.push([priceData[index].sign, currency, price, endSign, timestamp]);
		
	}
	console.log(`currency: ${currency}, ${timestamp}, length: ${data.length}`);
	console.log(data);
	await oraclePrice.insertExchangePrice(data);
}

async function main() {

	for (let index = 0; index < apiPriceConfig.exchange.length; index++) {
		https.asyncGet(apiPriceConfig.apiUrlBTC[index], BTCPrice, apiPriceConfig.exchange[index]);
		console.log(`sync BTC price [${index}]:${apiPriceConfig.exchange[index]}  url: ${apiPriceConfig.apiUrlBTC[index]}`);
		https.asyncGet(apiPriceConfig.apiUrlUSDT[index], USDTPrice, apiPriceConfig.exchange[index]);
		console.log(`sync USDT price [${index}]:${apiPriceConfig.exchange[index]}  url: ${apiPriceConfig.apiUrlUSDT[index]}`);
	}
	time = Math.ceil(Date.now() / 1000);
	await oraclePrice.initDB();
	while(true){
		if (endflagBTC && endflagUSDT) {

			return;
		}
		if (BTCPrice.length == apiPriceConfig.exchange.length) {
			
			parsePriceData(BTCPrice, 'BTC', time);
			BTCPrice = [];
			endflagBTC = true;
		}

		if (USDTPrice.length == apiPriceConfig.exchange.length) {
			
			parsePriceData(USDTPrice, 'USDT', time);
			USDTPrice = [];
			endflagUSDT = true;
		}

		await delay(1000);
	}
}

main();