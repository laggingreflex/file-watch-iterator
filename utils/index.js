const e = m => exports[m] = require('./' + m);

const utils = exports;

utils.delay = (timeout = 1000) => new Promise(resolve => setTimeout(resolve, timeout || 1000));
utils.delayRace = (promise, timeout) => Promise.race([promise, utils.delay(timeout)]);

utils.Files = require('./Files');
utils.Defer = require('./Defer');
