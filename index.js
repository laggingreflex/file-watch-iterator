const { watch } = require('chokidar');
const debounce = require('debounce-queue');
const breakAI = require('break-async-iterator')
const { Files, Defer, ...utils } = require('./utils');

module.exports = breakAI(breakable => async function*(paths, chokidarOpts = {}, opts = {}) {
  const files = new Files();
  const deferred = new Defer();
  const yielded = new Defer();

  const onAll = debounce(queue => {
    queue.forEach(([event, file]) => {
      files.update(file, { event });
    });
    deferred.resolve();
    deferred.reset();
    return yielded;
  }, { delay: opts.debounce || 1000 });

  const watcher = watch(paths, { ...chokidarOpts, });
  watcher.on('all', onAll);
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
