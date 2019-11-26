const log4js = require('log4js')

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,  // month
        "d+": this.getDate(),       // day
        "h+": this.getHours(),      // hours
        "m+": this.getMinutes(),    // minutes
        "s+": this.getSeconds(),    // seconds
        "S": this.getMilliseconds() // milli seconds
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

exports.initLogger = function (filePath = 'mainnet') {

    var file = `./logs/${new Date().Format("yyyy-MM-dd")}/${filePath}/log/`;
    var extend = `-yyyy-MM-dd.log`;

    log4js.configure({
        replaceConsole: true,
        appenders: {
            stdout: {
                type: 'stdout'
            },
            info: {
                type: 'dateFile',
                filename: file,
                pattern: 'info' + extend,
                alwaysIncludePattern: true
            },
            warning: {
                type: 'dateFile',
                filename: file,
                pattern: 'warning' + extend,
                alwaysIncludePattern: true
            },
            error: {
                type: 'dateFile',
                filename: file,
                pattern: 'error' + extend,
                alwaysIncludePattern: true
            },
        },
        categories: {
            default: {
                appenders: ['stdout', 'info'],
                level: 'INFO'
            },
            info: {
                appenders: ['stdout', 'info'],
                level: 'INFO'
            },
            warning: {
                appenders: ['stdout', 'warning'],
                level: 'WARN'
            },
            error: {
                appenders: ['stdout', 'error'],
                level: 'ERROR'
            },
        }
    });
}

//name takes the categories item
exports.getLogger = function (name) {
    return log4js.getLogger(name || 'default');
}

//used to combine with express
exports.useLogger = function (app, logger) {
    app.use(log4js.connectLogger(logger || log4js.getLogger('default'), {
        format: '[:remote-addr :method :url :status :response-timems][:referrer HTTP/:http-version :user-agent]'
    }));
}
