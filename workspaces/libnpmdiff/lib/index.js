const npa = require('npm-package-arg')
const pacote = require('pacote')

const formatDiff = require('./format-diff.js')
const getTarball = require('./tarball.js')
const untar = require('./untar.js')

// TODO: we test this condition in the diff command
// so this error probably doesnt need to be here. Or
// if it does we should figure out a standard code
// so we can catch it in the cli and display it consistently
const argsError = () =>
  Object.assign(
    new TypeError('libnpmdiff needs two arguments to compare'),
    { code: 'EDIFFARGS' }
  )

const getManifests = async (specs, opts) => {
  const packumentCache = new Map()
  const getManifest = spec => pacote.manifest(spec, {
    packumentCache,
    ...opts,
    _isRoot: true,
  })
  const [aSpec, bSpec] = specs.map(spec => npa(spec))
  return aSpec.registry && bSpec.registry && aSpec.name === bSpec.name
    // one after the other, so the second reuses the packument fetched for the first
    ? [await getManifest(specs[0]), await getManifest(specs[1])]
    : Promise.all(specs.map(getManifest))
}

const diff = async (specs, opts = {}) => {
  if (specs.length !== 2) {
    throw argsError()
  }

  const [
    aManifest,
    bManifest,
  ] = await getManifests(specs, opts)

  const versions = {
    a: aManifest.version,
    b: bManifest.version,
  }

  // fetches tarball using pacote
  const [a, b] = await Promise.all([
    getTarball(aManifest, opts),
    getTarball(bManifest, opts),
  ])

  // read all files
  // populates `files` and `refs`
  const {
    files,
    refs,
  } = await untar([
    {
      prefix: 'a/',
      item: a,
    },
    {
      prefix: 'b/',
      item: b,
    },
  ], opts)

  return formatDiff({
    files,
    opts,
    refs,
    versions,
  })
}

module.exports = diff
