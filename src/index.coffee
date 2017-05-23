import EventEmitter from  './event-emitter'
import Uppie        from 'uppie/uppie'
import polyfill     from './polyfill'


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
    @el.addEventListener 'dragleave', (event) => @dragHover event
    @el.addEventListener 'dragover',  (event) => @dragHover event

    uppie = new Uppie()
    uppie @el, (event, formData, files) => @drop event, formData, files

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

  dragHover: (event) ->
    event.stopPropagation()
    event.preventDefault()

  drop: (event, formData, files) ->
    console.log arguments
    return unless files.length

    for file in files
      @emit 'file', file
      @queue[file] = path: file

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
