const { watch } = require('chokidar');
const debounce = require('debounce-queue');
const { Files, Defer } = require('./utils');

module.exports = async function*(paths, chokidarOpts = {}, opts = {}) {
  const files = new Files();
  const deferred = new Defer();

  const on = debounce(queue => {
    queue.forEach(([event, file]) => {
      files.update(file, { event });
    });
    deferred.resolve();
    deferred.reset();
  }, { delay: opts.debounce || 100 });

  const watcher = watch(paths, { ...chokidarOpts, });
  watcher.on('all', on);
  watcher.once('error', e => deferred.reject(e));

  try {
    while (true) {
      await Promise.race([deferred, opts.interrupt].filter(Boolean));
      yield files;
      files.resetChanged();
    }
  } finally {
    watcher.close();
    deferred.resolve();
  }
};
