const { basename, extname } = require('node:path')

let binaryExtensions

// we should try to print patches as long as the
// extension is not identified as binary files
const shouldPrintPatch = async (path, opts = {}) => {
  if (opts.diffText) {
    return true
  }

  binaryExtensions ??= new Set((await import('binary-extensions')).default)

  const filename = basename(path)
  const extension = (
    filename.startsWith('.')
      ? filename
      : extname(filename)
  ).slice(1)

  return !binaryExtensions.has(extension)
}

module.exports = shouldPrintPatch
