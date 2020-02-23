const log4js = require('log4js');
const {
  netType,
} = require('../config/base.config.js');

Date.prototype.Format = function(fmt) {
  const o = {
    'M+': this.getMonth() + 1, // month
    'S': this.getMilliseconds(), // milli seconds
    'd+': this.getDate(), // day
    'h+': this.getHours(), // hours
    'm+': this.getMinutes(), // minutes
    's+': this.getSeconds(), // seconds
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (const k in o)
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
    }
  return fmt;
};

exports.initLogger = function(filePath = 'mainnet') {

  const file = `./logs/${new Date().Format('yyyy-MM-dd')}/${filePath}/log/`;
  const extend = '-yyyy-MM-dd.log';

  log4js.configure({
    appenders: {
      error: {
        alwaysIncludePattern: true,
        filename: file,
        pattern: 'error' + extend,
        type: 'dateFile',
      },
      info: {
        alwaysIncludePattern: true,
        filename: file,
        pattern: 'info' + extend,
        type: 'dateFile',
      },
      stdout: {
        type: 'stdout',
      },
      warning: {
        alwaysIncludePattern: true,
        filename: file,
        pattern: 'warning' + extend,
        type: 'dateFile',
      },
    },
    categories: {
      default: {
        appenders: ['stdout', 'info'],
        level: 'INFO',
      },
      error: {
        appenders: ['stdout', 'error'],
        level: 'ERROR',
      },
      info: {
        appenders: ['stdout', 'info'],
        level: 'INFO',
      },
      warning: {
        appenders: ['stdout', 'warning'],
        level: 'WARN',
      },
    },
    replaceConsole: true,
  });
};

//name takes the categories item
exports.getLogger = function(name) {
  return log4js.getLogger(name || 'default');
};

//used to combine with express
exports.useLogger = function(app, logger) {
  app.use(log4js.connectLogger(logger || log4js.getLogger('default'), {
    format: '[:remote-addr :method :url :status :response-timems][:referrer HTTP/:http-version :user-agent]',
  }));
};

function initLogger(filePath = 'mainnet') {
  const file = `./logs/${new Date().Format('yyyy-MM-dd')}/${filePath}/log/`;
  const extend = '-yyyy-MM-dd.log';

  log4js.configure({
    appenders: {
      error: {
        alwaysIncludePattern: true,
        filename: file,
        pattern: 'error' + extend,
        type: 'dateFile',
      },
      info: {
        alwaysIncludePattern: true,
        filename: file,
        pattern: 'info' + extend,
        type: 'dateFile',
      },
      stdout: {
        type: 'stdout',
      },
      warning: {
        alwaysIncludePattern: true,
        filename: file,
        pattern: 'warning' + extend,
        type: 'dateFile',
      },
    },
    categories: {
      default: {
        appenders: ['stdout', 'info'],
        level: 'INFO',
      },
      error: {
        appenders: ['stdout', 'error'],
        level: 'ERROR',
      },
      info: {
        appenders: ['stdout', 'info'],
        level: 'INFO',
      },
      warning: {
        appenders: ['stdout', 'warning'],
        level: 'WARN',
      },
    },
    replaceConsole: true,
  });
}

function getLogger(name) {
  return log4js.getLogger(name || 'default');
}

// TODO: Modify code
initLogger(netType);
const log = getLogger();

module.exports = {
  log,
};
