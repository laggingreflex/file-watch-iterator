const { watch } = require('chokidar');
const debounce = require('debounce-queue');
const defer = require('p-defer');

module.exports = async function*(paths, chokidarOpts = {}, opts = {}) {
  const files = new Set();

  let changed;
  const resetChanged = () => changed = new Set();
  resetChanged();

  let deferred;
  const resetDeferred = () => deferred = defer();
  resetDeferred();

  const on = debounce(queue => {
    resetChanged();
    queue.forEach(([event, path]) => {
      switch (event) {
        case 'add':
          files.add(path);
          changed.add(path);
          break;
        case 'change':
          changed.add(path);
          break;
        case 'unlink':
          files.delete(path);
          break;
      }
    });
    deferred.resolve();
    resetDeferred();
  }, { delay: opts.debounce || 100 });

  const watcher = watch(paths, { ...chokidarOpts, });
  watcher.on('all', on);
  watcher.once('error', e => deferred.reject(e));

  try {
    while (true) {
      await deferred.promise;
      yield { files, changed };
    }
  } finally {
    watcher.close();
  }
};
