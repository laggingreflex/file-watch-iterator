const { watch } = require('chokidar');
const debounce = require('debounce-queue');
const breakAI = require('break-async-iterator')
const { Files, Defer, ...utils } = require('./utils');

/**
 * Watch files as an async iterator
 * @param {string} paths file, dir, glob, or array - passed to chokidar.watch
 * @param {object} chokidarOpts options for chokidar.watch
 * @param {object} opts
 * @param {number} [opts.debounce=100] Debounced delay for each event
 * @param {number} [opts.readyTimeout=1000] Debounced timeout that fires after initial discovery of files has most likely been finished
 * @returns {AsyncIterableIterator<Files>} files
 */
module.exports = breakAI(breakable => async function*(paths, chokidarOpts = {}, opts = {}) {
  const files = new Files();
  const deferred = new Defer();
  const yielded = new Defer();

  const ready = debounce(() => {
    ready.is = true;
    deferred.resolve();
    deferred.reset();
  }, opts.readyTimeout || 1000);

  const on = debounce(queue => {
    queue.forEach(([event, file]) => {
      files.update(file, { event });
    });
    if (!ready.is) {
      ready();
    } else {
      deferred.resolve();
      deferred.reset();
    }
  }, opts.debounce || 100);

  const watcher = watch(paths, { ...chokidarOpts, });
  watcher.on('all', on);
  watcher.once('error', e => deferred.reject(e));

  try {
    while (true) {
      await breakable(deferred);
      yield files;
      yielded.resolve();
      yielded.reset();
      files.resetChanged();
    }
  } finally {
    watcher.close();
    deferred.resolve();
  }
});
