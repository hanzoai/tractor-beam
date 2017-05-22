import EventEmitter from  './event-emitter'
import polyfill     from './polyfill'

class File
  constructor: (fd, path) ->
    @fd        = fd
    @directory = path
    @name      = fd.name
    @path      = path + '/' + fd.name
    @skipped   = false

class TractorBeam extends EventEmitter
  # `opts` should have a `postPath` for upload to work
  # `postPath` should either be a constant string or
  # a function that takes an object with a path and returns
  # a path to which TractorBeam can post.
  constructor: (@selector, @opts = {}) ->
    super

    polyfill() unless @opts.polyfill == false

    # find element
    @el = document.querySelector @selector

    # queue to store events
    @queue = {}

    # bind events
    @bind()

  bind: ->
    # handle DOM events
    @el.addEventListener 'change',    (e) => @change e
    @el.addEventListener 'dragleave', (e) => @dragHover e
    @el.addEventListener 'dragover',  (e) => @dragHover e
    @el.addEventListener 'drop',      (e) => @drop e

    # # handle upload event
    # @on 'dropped', (queue) ->
    #   return if not @opts.postPath?

    #   for file in queue
    #     postPath =
    #       if typeof @opts.postPath == 'function'
    #         @opts.postPath file
    #       else
    #         @opts.postPath
    #     @upload file postPath

  change: ->
    # bail if API is unsupported
    return unless @getFilesAndDirectories?

    # begin by traversing the chosen files and directories
    @getFilesAndDirectories().then (filesAndDirs) =>
      @iterateFilesAndDirs filesAndDirs, '/'

  dragHover: (e) ->
    e.stopPropagation()
    e.preventDefault()

  drop: (e) ->
    e.stopPropagation()
    e.preventDefault()

    if not e.dataTransfer.getFilesAndDirectories?
      @emit 'unsupported'
      console.error 'Directory drag and drop is unsupported by this browser'
      return

    e.dataTransfer.getFilesAndDirectories()
      .then (filesAndDirs) =>
        @iterateFilesAndDirs filesAndDirs, '/'

  iterateFilesAndDirs: (filesAndDirs, path) ->
    done = true

    for fd in filesAndDirs
      if typeof fd.getFilesAndDirectories == 'function'
        done = false
        path = fd.path

        # this recursion enables deep traversal of directories
        fd.getFilesAndDirectories().then (subFilesAndDirs) =>
          # iterate through files and directories in sub-directory
          @iterateFilesAndDirs subFilesAndDirs, path
          return
      else
        file = new File fd, path
        @emit 'file', file
        @queue[file.path] = file

    if done
      @emit 'dropped', @queue

  add: (filepath) ->
    @queue[filepath].skipped = false
    @

  remove: (filepath) ->
    file = @queue[filepath]
    delete @queue[filepath]
    file

  skip: (filepath) ->
    @queue[filepath].skipped = true
    @

export default TractorBeam
