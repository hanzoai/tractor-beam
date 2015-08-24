assert    = require 'assert'
should    = require('chai').should()

{getBrowser} = require './util'

describe "Tractor Beam (#{process.env.BROWSER})", ->
  testPage = "http://localhost:#{process.env.PORT ? 3333}/fixtures/index.html"
  browser  = null

  before (done) ->
    browser = getBrowser()
    browser.init done

  after (done) ->
    browser.end done

  describe 'todo', ->
    it 'todo', (done) ->
      browser
        .url testPage
        .call done
