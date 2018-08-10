const lib = require('.')

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {

  const iterator = lib('.');

  for await (const { files, changed } of iterator) {
    // console.log(files);
    console.log({files, changed});
    // throw new Error('a')
    // break
  }

}
