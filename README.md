# file-watch-iterator

A simple wrapper around [chokidar] that returns an [async iterator][async-iteration] which you can [for-await] on to get the initial, and then later changed files.

**Requires ES2018 [Async Iteration][async-iteration]**

[chokidar]: https://github.com/paulmillr/chokidar
[async-iteration]: https://github.com/tc39/proposal-async-iteration
[for-await]: https://github.com/tc39/proposal-async-iteration#the-async-iteration-statement-for-await-of

## Install

```
npm i file-watch-iterator
```

## Usage

```js
const watch = require('file-watch-iterator')

for await (const { files, changed } of watch('.')) {
  // ...
  // break
}
```

### API

* **`watch(paths, chokidarOpts, opts)`**

  * **`paths`** Paths/globs to watch (passed to chokidar)

  * **`chokidarOpts`** Options passed to chokidar

  * **`opts`**

    * **`debounce=100`** Debounce between file change as well as an indicator of first ever "ready" event (when (initially) the files are "changed" (discovered) very rapidly)

  * **Returns** an async-iterable which yields `{ files, changed }`

    * **`files`** Complete and updated list of files
    * **`changed`** File changes since the last iteration. An object with keys of events fired by chokidar watcher containing a set of files corresponding to those events. E.g.: **`{add: [], change: [], unlink: [], ...}`**

