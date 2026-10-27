const { basename, extname } = require('node:path')

// binary-extensions is ESM-only, so it has to be imported dynamically;
// load it once and reuse the Set for every file in the diff
let binaryExtensions
const loadBinaryExtensions = async () => {
  if (!binaryExtensions) {
    const { default: list } = await import('binary-extensions')
    binaryExtensions = new Set(list)
  }
  return binaryExtensions
}

// we should try to print patches as long as the
// extension is not identified as binary files
const shouldPrintPatch = async (path, opts = {}) => {
  if (opts.diffText) {
    return true
  }

  const filename = basename(path)
  const extension = (
    filename.startsWith('.')
      ? filename
      : extname(filename)
  ).slice(1)

  return !(await loadBinaryExtensions()).has(extension)
}

module.exports = shouldPrintPatch
