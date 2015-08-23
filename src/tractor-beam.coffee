require '../vendor/polyfill'

EventEmitter = require 'event-emitter'

class TractorBeam extends EventEmitter
  # `options` should have a `postPath` for upload to work
  # `postPath` should either be a constant string or
  # a function that takes an object with a path and returns
  # a path to which TractorBeam can post.
  constructor: (@selector, @options = {}) ->
    @options.type ?= 'fileinput'

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
    @on 'upload', (queue) ->
      return if not @options.postPath?

      for file in queue
        postPath =
          if typeof @options.postPath == 'function'
            @options.postPath file
          else
            @options.postPath

        # For the PoC
        # TODO: Actually upload the file
        console.log file

  change: ->
    # bail if API is unsupported
    return unless @getFilesAndDirectories?

    # clear queue
    @queue = []

    # begin by traversing the chosen files and directories
    @getFilesAndDirectories().then (filesAndDirs) =>
      @iterateFilesAndDirs filesAndDirs, '/'
      return
    return

  dragHover: (e) ->
    e.stopPropagation()
    e.preventDefault()
    return

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
      @emit 'upload', @queue
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
