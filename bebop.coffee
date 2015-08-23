fs   = require 'fs'
path = require 'path'

requisite = require 'requisite'

module.exports =
  cwd: process.cwd()

  compilers:
    coffee: (src) ->
      requisite.bundle
        entry: 'src/tractor-beam.coffee'
        sourceMapRoot: 'src/'
        globalRequire: true
      , (err, bundle) ->
        fs.writeFileSync 'tractor-beam.js', bundle.toString()
