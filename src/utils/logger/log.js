/* eslint-disable no-undef */
/* eslint-disable sort-keys */
const log4js = require('log4js');

const {
  appName,
  netType,
} = require('../config/base.config.js');

log4js.configure({
  appenders: {
    // appender1: output to console
    console: {
      type: 'stdout',
    },
    // appender2: output to all data file
    dataFile: {
      type: 'dateFile',
      // the path to write to the log file
      filename: `./logs/${appName}/${netType}`,
      // specify the time interval for log splitting
      pattern: '.yyyy-MM-dd.log',
      // contains the previously set pattern information
      alwaysIncludePattern: true,
      // the number of days to keep logs
      daysToKeep: 7,
      // compress old logs with .gz
      // compress: true,
      // encoding format
      encoding: 'utf-8',
    },
    // appender3: output to error log
    error: {
      type: 'dateFile',
      filename: `./logs/${appName}/${netType}_error`,
      pattern: '.yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      daysToKeep: 7,
      // compress: true,
      encoding: 'utf-8',
    },
    errorFile: {
      type: 'logLevelFilter',
      level: 'warn',
      maxLevel: 'error',
      appender: 'error',
    },
    // appender4: output to trade log
    info: {
      type: 'dateFile',
      filename: `./logs/${appName}/${netType}_txInfo`,
      pattern: '.yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      daysToKeep: 7,
      // compress: true,
      encoding: 'utf-8',
    },
    txFile: {
      type: 'logLevelFilter',
      level: 'info',
      maxLevel: 'info',
      appender: 'info',
    },
  },
  categories: {
    default: {
      appenders: ['dataFile', 'console', 'errorFile', 'txFile'],
      level: 'info',
    },
  },
});

const log = log4js.getLogger();

module.exports = {
  log,
};
