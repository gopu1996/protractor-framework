var log4js = require('log4js');
var log4jsGen = {
    getLogger: function getLogger() {
        log4js.configure('./Utlity/log4js.json');
        var logger = log4js.getLogger(); //for both console and file
        return logger;
    }
};

module.exports = log4jsGen;