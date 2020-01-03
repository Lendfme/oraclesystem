const axios = require("axios");

const {
    log
} = require("../utils/logger/log");

// TODO: limit retry time
function request(url) {
    log.info("Request is: ", url)
    return new Promise(async (resolve, reject) => {
        try {
            let result = await axios.get(url);
            resolve(result.data);
        } catch (error) {
            log.error(error.stack);
            log.error("Get http error, try again after 15 seconds ...", error);
        }
    });
}

// TODO: solve error
async function post(url, data, duration = 20000) {
    try {
        let result = await axios.post(url, data, {
            timeout: duration
        })
        return Promise.resolve(result)
    } catch (error) {
        console.log("When you request url: ", url, " You encounter an error: ", error.response)
        return Promise.reject(error.code)
    }
}

function asyncGet(url, duration, data, sign = "") {
    axios
        .get(url, {
            timeout: duration
        })
        .then(function (response) {
            var info = sign ? {
                sign: sign,
                data: response.data
            } : response.data;
            if (Array.isArray(data)) data.push(info);
            else data = info;
        })
        .catch(function (error) {
            var info = sign ? {
                sign: sign,
                data: false
            } : false;
            if (Array.isArray(data)) data.push(info);
            else data = info;
            log.error("sign error : " + sign);
            log.error(error.errno);
        });
}

module.exports = {
    request,
    post,
    asyncGet
};
