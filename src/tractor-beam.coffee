EventEmitter = require './event-emitter'
xhr = require 'xhr'
require './vendor/polyfill'

class TractorBeam extends EventEmitter
  # `options` should have a `postPath` for upload to work
  # `postPath` should either be a constant string or
  # a function that takes an object with a path and returns
  # a path to which TractorBeam can post.
  constructor: (@selector, @options = {}) ->
    super

    # find element
    @el = document.querySelector @selector

    # queue to store events
    @queue = []

    # bind events
    @bind()

  bind: ->
    # handle DOM events
    @el.addEventListener 'change',    (e) => @change e
    @el.addEventListener 'dragleave', (e) => @dragHover e
    @el.addEventListener 'dragover',  (e) => @dragHover e
    @el.addEventListener 'drop',      (e) => @drop e

    # handle upload event
    @on 'dropped', (queue) ->
      return if not @options.postPath?

      for file in queue
        postPath =
          if typeof @options.postPath == 'function'
            @options.postPath file
          else
            @options.postPath

        # TODO: Actually upload the file

      @queue = []

  change: ->
    # bail if API is unsupported
    return unless @getFilesAndDirectories?

    # clear queue
    @queue = []

    # begin by traversing the chosen files and directories
    @getFilesAndDirectories().then (filesAndDirs) =>
      @iterateFilesAndDirs filesAndDirs, '/'

  dragHover: (e) ->
    e.stopPropagation()
    e.preventDefault()

  drop: (e) ->
    e.stopPropagation()
    e.preventDefault()

    return unless e.dataTransfer.getFilesAndDirectories?

    e.dataTransfer.getFilesAndDirectories()
      .then (filesAndDirs) =>
        console.log filesAndDirs
        @iterateFilesAndDirs filesAndDirs, '/'

  iterateFilesAndDirs: (filesAndDirs, path) ->
    if filesAndDirs.length == 0
      @emit 'dropped', @queue
      return

    for fd in filesAndDirs
      if typeof fd.getFilesAndDirectories == 'function'
        path = fd.path

        # this recursion enables deep traversal of directories
        fd.getFilesAndDirectories().then (subFilesAndDirs) =>
          # iterate through files and directories in sub-directory
          @iterateFilesAndDirs subFilesAndDirs, path
          return
      else
        file =
          fd: fd
          path: path
        @emit 'file', file
        @queue.push file

module.exports = TractorBeam
