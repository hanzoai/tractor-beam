require '../lib/polyfill.js'

EventEmitter = require 'event-emitter'

class TractorBeam
  # `options` should have a `postPath` for upload to work
  # `postPath` should either be a constant string or
  # a function that takes an object with a path and returns
  # a path to which TractorBeam can post.
  constructor: (@selector, @options = {}) ->
    @options.type ?= 'fileinput'

    # find element
    @el = document.querySelector @selector

    @emitter = new EventEmitter

    # queue to store events
    @queue = []

    # bind events
    @bind()

  bind: ->
    # handle DOM events
    @el.addEventListener 'change',    @change
    @el.addEventListener 'dragleave', @dragHover
    @el.addEventListener 'dragover',  @dragHover
    @el.addEventListener 'drop',      @drop

    # handle upload event
    @emitter.on 'upload', (queue) ->
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
    if e.type == 'dragover'
      e.target.className = 'over'
    else
      e.target.className = ''
    return

  drop: (e) ->
    e.stopPropagation()
    e.preventDefault()
    e.target.className = ''

  iterateFilesAndDirs: (filesAndDirs, path) ->
    if filesAndDirs.length == 0
      @emitter.emit 'upload', @queue
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
        @emitter.emit 'file', file
        @queue.push file

module.exports = TractorBeam
