/**
 * Files
 *
 */
module.exports = class Files {
  constructor(files = {}) {
    this.files = files;
  }

  resetChanged() {
    for (const file in this.files) {
      this.files[file].changed = false;
    }
  }

  update(file, data) {
    this.files[file] = { changed: true, ...data };
  }

  * added() {
    for (const file in this.files) {
      const { event, changed } = this.files[file];
      if (!changed) continue;
      else if (event === 'add') yield file;
    }
  }

  * changed(events = ['change', 'add']) {
    for (const file in this.files) {
      const { event, changed } = this.files[file];
      if (!changed) continue;
      else if (events.includes(event)) yield file;
    }
  }

  deleted() { return this.changed(['unlink']) }

  toArray() {
    return Object.entries(this.files || {}).map(([file, data]) => ({ file, ...data }));
  }

  get size() { return Object.keys(this.files).length }

}
