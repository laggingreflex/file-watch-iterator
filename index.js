const { watch } = require('chokidar');
const debounce = require('debounce-queue');
const defer = require('p-defer');
const { Files } = require('./utils');

module.exports = async function*(paths, chokidarOpts = {}, opts = {}) {
  const files = new Files();

  let deferred;
  const resetDeferred = () => deferred = defer();
  resetDeferred();

  const interrupt = opts.interrupt || new Promise(() => {});

  const on = debounce(queue => {
    queue.forEach(([event, file]) => {
      files.update(file, { event });
    });
    deferred.resolve();
    resetDeferred();
  }, { delay: opts.debounce || 100 });

  const watcher = watch(paths, { ...chokidarOpts, });
  watcher.on('all', on);
  watcher.once('error', e => deferred.reject(e));

  try {
    while (true) {
      await Promise.race([deferred.promise, interrupt]);
      yield files;
      files.resetChanged();
    }
  } finally {
    watcher.close();
  }
};
