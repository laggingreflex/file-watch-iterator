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

for await (const files of watch('.')) {
  for (const file of files.changed(a)) {
    // ...
  }
  for (const file of files.deleted()) {
    // ...
  }
}
```

### API

* **`watch(paths, chokidarOpts, opts)`**

  * **`paths`** Paths/globs to watch (passed to chokidar)

  * **`chokidarOpts`** Options passed to chokidar

  * **`opts`**

    * **`debounce=100`** Debounce between file change as well as an indicator of first ever "ready" event (when (initially) the files are "changed" (discovered) very rapidly)

    * **`interrupt`** A promise that when rejected interrupts the watcher. See [async-iteration/issues/126]

      E.g.: Iterating over two (merged) watchers, one of them errors, how to stop the other from forever awaiting for changes:

      ```js
      const merge = require('merge-async-iterators')
      const interrupt = defer();
      const a = watch('/a', {interrupt})
      const b = watch('/b', {interrupt})

      try {
        for await (const files of merge([a, b])) {
          // error occurs in a
        }
      } finally {
        // this stops b from waiting for changes
        interrupt.reject('cancel')
      }
      ```

    [async-iteration/issues/126]: https://github.com/tc39/proposal-async-iteration/issues/126#issuecomment-403454433

  * **Returns** an async-iterable which yields a **`Files`** instance with the following structure:

    * **`.files`** Complete and updated list of files:

      Eg.:

      ```js
      {
        '/example/a': {changed: false, event: 'add'},    // previously added
        '/example/b': {changed: true,  event: 'change'}, // newly modified
        '/example/c': {changed: true,  event: 'add'},    // newly added
        '/example/d': {changed: true,  event: 'unlink'}, // newly deleted
      }
      ```

      * **`<key>`** The `keys` are the actual file paths and values are:

        * **`changed`** A boolean that's `true` for files that changed, `false` for the rest
        * **`event`** Chokidar `event` corresponding to the file change

      Note: This is more meant for internal use. You may find other methods more useful.

    * **`.toArray()`** Returns an iterable of a modified `.files` object as: `{file, changed, event}` objects

      Eg.:

      ```js
      for(const file of files) {
        console.log(file)
      }
      ```
      ```
      {file: '/example/a', changed: false, event: 'add'}
      {file: '/example/b', changed: true,  event: 'change'}
      {file: '/example/c', changed: true,  event: 'add'}
      {file: '/example/d', changed: true,  event: 'unlink'}
      ```

    * **`.changed(events)`** Returns an iterable of files whose `.changed = true` and `.event` is one of the `events` provided

      * **`events = ['change', 'add']`** Events to match with the file's `.event`

      Eg.:

      ```js
      for(const file of files.changed()) {
        console.log(file)
      }
      ```
      ```
      /example/b
      /example/c
      ```

    * **`.deleted()`** Alias for `.changed(['unlink'])`

      Eg.:

      ```js
      for(const file of files.deleted()) {
        console.log(file)
      }
      ```
      ```
      /example/d
      ```
