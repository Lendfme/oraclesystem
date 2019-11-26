const https = require('https')
const {
    slackWebHook
} = require("../utils/config/base.config")

class Slack {
    constructor(net, log) {
        this.net = net
        this.log = log
    }

    // send messages to slack
    sendToSlack(content) {
        const options = {
            hostname: "hooks.slack.com",
            method: "POST",
            path: "/services/" + slackWebHook
        }

        try {
            // Send the message
            const req = https.request(options,
                (res) => res.on("data", () => this.log.info("ok!")));
            req.write(JSON.stringify(content));
            req.end();
        } catch (error) {
            setTimeout(() => {
                this.log.error(error.stack)
                this.log.error(this.net, ' Get a slack error, try again after 2 minutes ...', error)
                this.getError(this.net, 'Get a slack error, try again after 2 minutes ...', log)
                this.sendToSlack(content)
            }, 180000) // 3 minutes
        }
    }

    wrapContent(color, title, text) {
        return {
            "attachments": [{
                "color": color,
                "author_name": "lendf.me assistant",
                "author_icon": "https://dforce.network/logo_DF_256x256.png",
                "title": title,
                "title_link": "https://usdx.dforce.network/",
                "text": text,
                "footer": "lendf.me API",
                "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                "ts": Math.round(new Date().getTime() / 1000)
            }]
        }
    }

    lackingBalanceWarning(account, price) {
        let color = "danger"
        let title = "MoneyMarket feeding lacks ETH!"
        let text = `Attention!\n
Your account ${account} current balance is ${price}\n
Please deposit more!`
        let content = this.wrapContent(color, title, text)
        this.sendToSlack(content)
    }

    feeding(newPrice, balance) {
        let color = "good"
        let title = "MoneyMarket: feeding a new price"
        let text = `Write a new price at ${this.net}\n
current price is: ${newPrice} \n`
        if (typeof (balance) != "undefined") {
            text += `current balance is: ${balance}`
        }
        let content = this.wrapContent(color, title, text)
        this.sendToSlack(content)
    }

    getError(error) {
        let color = "danger"
        let title = "MoneyMarket: feeding failed!!!"
        let text = `Set new price at ${this.net} failed!!!\n
cause: ${error}`
        let content = this.wrapContent(color, title, text)
        this.sendToSlack(content)
    }

    liquidating(flag, data) {
        let color = "warning"
        let title = ""
        let text = ""
        if (flag) {
            title = "Liquidate: you can try to liquidate now!"
            text = `There exists accounts can be liquidated!\n
they are: ${data} \n`
        } else {
            title = "NO shortfall accounts!"
            text = `${data} \n`
        }
        let content = this.wrapContent(color, title, text)
        this.sendToSlack(content)
    }
}

module.exports = {
    Slack,
}
