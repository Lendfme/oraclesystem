const axios = require('axios');

const {
  log,
} = require('../utils/logger/log');

async function request(url, duration = 20000) {
  try {
    const result = await axios.get(url, {
      timeout: duration,
    });
    return result.data;
  } catch (error) {
    log.error(error);
  }
}

// TODO: solve error
async function post(url, data, duration = 20000) {
  try {
    const result = await axios.post(url, data, {
      timeout: duration,
    });
    return Promise.resolve(result);
  } catch (error) {
    log.error('When you request url: ', url, ' You encounter an error: ', error.response);
    return Promise.reject(error.code);
  }
}

function asyncGet(url, duration, data, sign = '') {
  axios
    .get(url, {
      timeout: duration,
    })
    .then(function(response) {
      const info = sign ? {
        data: response.data,
        sign: sign,
      } : response.data;
      if (Array.isArray(data)) data.push(info);
      else data = info;
    })
    .catch(function(error) {
      const info = sign ? {
        data: false,
        sign: sign,
      } : false;
      if (Array.isArray(data)) data.push(info);
      else data = info;
      log.error('sign error : ' + sign);
      log.error(error);
    });
}

module.exports = {
  asyncGet,
  post,
  request,
};
