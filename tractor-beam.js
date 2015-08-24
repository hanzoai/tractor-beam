(function (global) {
  var process = {
    title: 'browser',
    browser: true,
    env: {},
    argv: [],
    nextTick: function (fn) {
      setTimeout(fn, 0)
    },
    cwd: function () {
      return '/'
    },
    chdir: function () {
    }
  };
  // Require module
  function require(file, callback) {
    if ({}.hasOwnProperty.call(require.cache, file))
      return require.cache[file];
    // Handle async require
    if (typeof callback == 'function') {
      require.load(file, callback);
      return
    }
    var resolved = require.resolve(file);
    if (!resolved)
      throw new Error('Failed to resolve module ' + file);
    var module$ = {
      id: file,
      require: require,
      filename: file,
      exports: {},
      loaded: false,
      parent: null,
      children: []
    };
    var dirname = file.slice(0, file.lastIndexOf('/') + 1);
    require.cache[file] = module$.exports;
    resolved.call(module$.exports, module$, module$.exports, dirname, file);
    module$.loaded = true;
    return require.cache[file] = module$.exports
  }
  require.modules = {};
  require.cache = {};
  require.resolve = function (file) {
    return {}.hasOwnProperty.call(require.modules, file) ? require.modules[file] : void 0
  };
  // define normal static module
  require.define = function (file, fn) {
    require.modules[file] = fn
  };
  require.waiting = {};
  // define asynchrons module
  require.async = function (url, fn) {
    require.modules[url] = fn;
    while (cb = require.waiting[url].shift())
      cb(require(url))
  };
  // Load module asynchronously
  require.load = function (url, cb) {
    var script = document.createElement('script'), existing = document.getElementsByTagName('script')[0], callbacks = require.waiting[url] = require.waiting[url] || [];
    // we'll be called when asynchronously defined.
    callbacks.push(cb);
    // load module
    script.type = 'text/javascript';
    script.async = true;
    script.src = url;
    existing.parentNode.insertBefore(script, existing)
  };
  global.require = require;
  // source: /Users/a_/work/tractor-beam/src/event-emitter.coffee
  require.define('./event-emitter', function (module, exports, __dirname, __filename) {
    var EventEmitter, slice = [].slice;
    EventEmitter = function () {
      function EventEmitter(opts) {
        var ref;
        if (opts == null) {
          opts = {}
        }
        this.debug = (ref = opts.debug) != null ? ref : false;
        this._listeners = {};
        this._allListeners = []
      }
      EventEmitter.prototype.on = function (event, callback) {
        var base;
        if (event) {
          if ((base = this._listeners)[event] == null) {
            base[event] = []
          }
          this._listeners[event].push(callback);
          return this._listeners[event].length - 1
        } else {
          this._allListeners.push(callback);
          return this._allListeners.length - 1
        }
      };
      EventEmitter.prototype.off = function (event, index) {
        if (!event) {
          return this._listeners = {}
        }
        if (index != null) {
          this._listeners[event][index] = null
        } else {
          this._listeners[event] = {}
        }
      };
      EventEmitter.prototype.emit = function () {
        var args, event, i, j, len, len1, listener, listeners, ref;
        event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        listeners = this._listeners[event] || [];
        for (i = 0, len = listeners.length; i < len; i++) {
          listener = listeners[i];
          if (listener != null) {
            listener.apply(this, args)
          }
        }
        args.unshift(event);
        ref = this._allListeners;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          listener = ref[j];
          listener.apply(this, args)
        }
        if (this.debug) {
          return console.log.apply(console, args)
        }
      };
      return EventEmitter
    }();
    module.exports = EventEmitter
  });
  // source: /Users/a_/work/tractor-beam/node_modules/xhr/index.js
  require.define('xhr', function (module, exports, __dirname, __filename) {
    'use strict';
    var window = require('xhr/node_modules/global/window');
    var once = require('xhr/node_modules/once/once');
    var parseHeaders = require('xhr/node_modules/parse-headers/parse-headers');
    module.exports = createXHR;
    createXHR.XMLHttpRequest = window.XMLHttpRequest || noop;
    createXHR.XDomainRequest = 'withCredentials' in new createXHR.XMLHttpRequest ? createXHR.XMLHttpRequest : window.XDomainRequest;
    function isEmpty(obj) {
      for (var i in obj) {
        if (obj.hasOwnProperty(i))
          return false
      }
      return true
    }
    function createXHR(options, callback) {
      function readystatechange() {
        if (xhr.readyState === 4) {
          loadFunc()
        }
      }
      function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined;
        if (xhr.response) {
          body = xhr.response
        } else if (xhr.responseType === 'text' || !xhr.responseType) {
          body = xhr.responseText || xhr.responseXML
        }
        if (isJson) {
          try {
            body = JSON.parse(body)
          } catch (e) {
          }
        }
        return body
      }
      var failureResponse = {
        body: undefined,
        headers: {},
        statusCode: 0,
        method: method,
        url: uri,
        rawRequest: xhr
      };
      function errorFunc(evt) {
        clearTimeout(timeoutTimer);
        if (!(evt instanceof Error)) {
          evt = new Error('' + (evt || 'unknown'))
        }
        evt.statusCode = 0;
        callback(evt, failureResponse)
      }
      // will load the data & process the response in a special response object
      function loadFunc() {
        if (aborted)
          return;
        var status;
        clearTimeout(timeoutTimer);
        if (options.useXDR && xhr.status === undefined) {
          //IE8 CORS GET successful response doesn't have a status field, but body is fine
          status = 200
        } else {
          status = xhr.status === 1223 ? 204 : xhr.status
        }
        var response = failureResponse;
        var err = null;
        if (status !== 0) {
          response = {
            body: getBody(),
            statusCode: status,
            method: method,
            headers: {},
            url: uri,
            rawRequest: xhr
          };
          if (xhr.getAllResponseHeaders) {
            //remember xhr can in fact be XDR for CORS in IE
            response.headers = parseHeaders(xhr.getAllResponseHeaders())
          }
        } else {
          err = new Error('Internal XMLHttpRequest Error')
        }
        callback(err, response, response.body)
      }
      if (typeof options === 'string') {
        options = { uri: options }
      }
      options = options || {};
      if (typeof callback === 'undefined') {
        throw new Error('callback argument missing')
      }
      callback = once(callback);
      var xhr = options.xhr || null;
      if (!xhr) {
        if (options.cors || options.useXDR) {
          xhr = new createXHR.XDomainRequest
        } else {
          xhr = new createXHR.XMLHttpRequest
        }
      }
      var key;
      var aborted;
      var uri = xhr.url = options.uri || options.url;
      var method = xhr.method = options.method || 'GET';
      var body = options.body || options.data;
      var headers = xhr.headers = options.headers || {};
      var sync = !!options.sync;
      var isJson = false;
      var timeoutTimer;
      if ('json' in options) {
        isJson = true;
        headers['accept'] || headers['Accept'] || (headers['Accept'] = 'application/json');
        //Don't override existing accept header declared by user
        if (method !== 'GET' && method !== 'HEAD') {
          headers['content-type'] || headers['Content-Type'] || (headers['Content-Type'] = 'application/json');
          //Don't override existing accept header declared by user
          body = JSON.stringify(options.json)
        }
      }
      xhr.onreadystatechange = readystatechange;
      xhr.onload = loadFunc;
      xhr.onerror = errorFunc;
      // IE9 must have onprogress be set to a unique function.
      xhr.onprogress = function () {
      };
      xhr.ontimeout = errorFunc;
      xhr.open(method, uri, !sync, options.username, options.password);
      //has to be after open
      if (!sync) {
        xhr.withCredentials = !!options.withCredentials
      }
      // Cannot set timeout with sync request
      // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
      // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
      if (!sync && options.timeout > 0) {
        timeoutTimer = setTimeout(function () {
          aborted = true;
          //IE9 may still call readystatechange
          xhr.abort('timeout');
          errorFunc()
        }, options.timeout)
      }
      if (xhr.setRequestHeader) {
        for (key in headers) {
          if (headers.hasOwnProperty(key)) {
            xhr.setRequestHeader(key, headers[key])
          }
        }
      } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error('Headers cannot be set on an XDomainRequest object')
      }
      if ('responseType' in options) {
        xhr.responseType = options.responseType
      }
      if ('beforeSend' in options && typeof options.beforeSend === 'function') {
        options.beforeSend(xhr)
      }
      xhr.send(body);
      return xhr
    }
    function noop() {
    }
  });
  // source: /Users/a_/work/tractor-beam/node_modules/xhr/node_modules/global/window.js
  require.define('xhr/node_modules/global/window', function (module, exports, __dirname, __filename) {
    if (typeof window !== 'undefined') {
      module.exports = window
    } else if (typeof global !== 'undefined') {
      module.exports = global
    } else if (typeof self !== 'undefined') {
      module.exports = self
    } else {
      module.exports = {}
    }
  });
  // source: /Users/a_/work/tractor-beam/node_modules/xhr/node_modules/once/once.js
  require.define('xhr/node_modules/once/once', function (module, exports, __dirname, __filename) {
    module.exports = once;
    once.proto = once(function () {
      Object.defineProperty(Function.prototype, 'once', {
        value: function () {
          return once(this)
        },
        configurable: true
      })
    });
    function once(fn) {
      var called = false;
      return function () {
        if (called)
          return;
        called = true;
        return fn.apply(this, arguments)
      }
    }
  });
  // source: /Users/a_/work/tractor-beam/node_modules/xhr/node_modules/parse-headers/parse-headers.js
  require.define('xhr/node_modules/parse-headers/parse-headers', function (module, exports, __dirname, __filename) {
    var trim = require('xhr/node_modules/parse-headers/node_modules/trim'), forEach = require('xhr/node_modules/parse-headers/node_modules/for-each'), isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]'
      };
    module.exports = function (headers) {
      if (!headers)
        return {};
      var result = {};
      forEach(trim(headers).split('\n'), function (row) {
        var index = row.indexOf(':'), key = trim(row.slice(0, index)).toLowerCase(), value = trim(row.slice(index + 1));
        if (typeof result[key] === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [
            result[key],
            value
          ]
        }
      });
      return result
    }
  });
  // source: /Users/a_/work/tractor-beam/node_modules/xhr/node_modules/parse-headers/node_modules/trim/index.js
  require.define('xhr/node_modules/parse-headers/node_modules/trim', function (module, exports, __dirname, __filename) {
    exports = module.exports = trim;
    function trim(str) {
      return str.replace(/^\s*|\s*$/g, '')
    }
    exports.left = function (str) {
      return str.replace(/^\s*/, '')
    };
    exports.right = function (str) {
      return str.replace(/\s*$/, '')
    }
  });
  // source: /Users/a_/work/tractor-beam/node_modules/xhr/node_modules/parse-headers/node_modules/for-each/index.js
  require.define('xhr/node_modules/parse-headers/node_modules/for-each', function (module, exports, __dirname, __filename) {
    var isFunction = require('xhr/node_modules/parse-headers/node_modules/for-each/node_modules/is-function');
    module.exports = forEach;
    var toString = Object.prototype.toString;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function forEach(list, iterator, context) {
      if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
      }
      if (arguments.length < 3) {
        context = this
      }
      if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context);
      else if (typeof list === 'string')
        forEachString(list, iterator, context);
      else
        forEachObject(list, iterator, context)
    }
    function forEachArray(array, iterator, context) {
      for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
          iterator.call(context, array[i], i, array)
        }
      }
    }
    function forEachString(string, iterator, context) {
      for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
      }
    }
    function forEachObject(object, iterator, context) {
      for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
          iterator.call(context, object[k], k, object)
        }
      }
    }
  });
  // source: /Users/a_/work/tractor-beam/node_modules/xhr/node_modules/parse-headers/node_modules/for-each/node_modules/is-function/index.js
  require.define('xhr/node_modules/parse-headers/node_modules/for-each/node_modules/is-function', function (module, exports, __dirname, __filename) {
    module.exports = isFunction;
    var toString = Object.prototype.toString;
    function isFunction(fn) {
      var string = toString.call(fn);
      return string === '[object Function]' || typeof fn === 'function' && string !== '[object RegExp]' || typeof window !== 'undefined' && (fn === window.setTimeout || fn === window.alert || fn === window.confirm || fn === window.prompt)
    }
    ;
  });
  // source: /Users/a_/work/tractor-beam/src/vendor/polyfill.js
  require.define('./vendor/polyfill', function (module, exports, __dirname, __filename) {
    // https://github.com/WICG/directory-upload/blob/gh-pages/polyfill.js
    /**********************************
 Directory Upload Proposal Polyfill
 Author: Ali Alabbas (Microsoft)
 **********************************/
    (function () {
      // Do not proceed with the polyfill if Directory interface is already natively available,
      // or if webkitdirectory is not supported (i.e. not Chrome, since the polyfill only works in Chrome)
      if (window.Directory || !('webkitdirectory' in document.createElement('input'))) {
        return
      }
      var directoryAttr = 'directory', getFilesMethod = 'getFilesAndDirectories', isSupportedProp = 'isFilesAndDirectoriesSupported', chooseDirMethod = 'chooseDirectory';
      var separator = '/';
      var Directory = function () {
        this.name = '';
        this.path = separator;
        this._children = {};
        this._items = false
      };
      Directory.prototype[getFilesMethod] = function () {
        var that = this;
        // from drag and drop and file input drag and drop (webkitEntries)
        if (this._items) {
          var getItem = function (entry) {
            if (entry.isDirectory) {
              var dir = new Directory;
              dir.name = entry.name;
              dir.path = entry.fullPath;
              dir._items = entry;
              return dir
            } else {
              return new Promise(function (resolve, reject) {
                entry.file(function (file) {
                  resolve(file)
                }, reject)
              })
            }
          };
          if (this.path === separator) {
            var promises = [];
            for (var i = 0; i < this._items.length; i++) {
              var entry;
              // from file input drag and drop (webkitEntries)
              if (this._items[i].isDirectory || this._items[i].isFile) {
                entry = this._items[i]
              } else {
                entry = this._items[i].webkitGetAsEntry()
              }
              promises.push(getItem(entry))
            }
            return Promise.all(promises)
          } else {
            return new Promise(function (resolve, reject) {
              that._items.createReader().readEntries(function (entries) {
                var promises = [];
                for (var i = 0; i < entries.length; i++) {
                  var entry = entries[i];
                  promises.push(getItem(entry))
                }
                resolve(Promise.all(promises))
              }, reject)
            })
          }  // from file input manual selection
        } else {
          var arr = [];
          for (var child in this._children) {
            arr.push(this._children[child])
          }
          return Promise.resolve(arr)
        }
      };
      // set blank as default for all inputs
      HTMLInputElement.prototype[getFilesMethod] = function () {
        return Promise.resolve([])
      };
      // if OS is Mac, the combined directory and file picker is supported
      HTMLInputElement.prototype[isSupportedProp] = navigator.appVersion.indexOf('Mac') !== -1;
      HTMLInputElement.prototype[directoryAttr] = undefined;
      HTMLInputElement.prototype[chooseDirMethod] = undefined;
      // expose Directory interface to window
      window.Directory = Directory;
      /********************
	 **** File Input ****
	 ********************/
      var convertInputs = function (nodes) {
        var recurse = function (dir, path, fullPath, file) {
          var pathPieces = path.split(separator);
          var dirName = pathPieces.shift();
          if (pathPieces.length > 0) {
            var subDir = new Directory;
            subDir.name = dirName;
            subDir.path = separator + fullPath;
            if (!dir._children[subDir.name]) {
              dir._children[subDir.name] = subDir
            }
            recurse(dir._children[subDir.name], pathPieces.join(separator), fullPath, file)
          } else {
            dir._children[file.name] = file
          }
        };
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          if (node.tagName === 'INPUT' && node.type === 'file') {
            // force multiple selection for default behavior
            if (!node.hasAttribute('multiple')) {
              node.setAttribute('multiple', '')
            }
            var shadow = node.createShadowRoot();
            node[chooseDirMethod] = function () {
              // can't do this without an actual click
              console.log('This is unsupported. For security reasons the dialog cannot be triggered unless it is a response to some user triggered event such as a click on some other element.')
            };
            shadow.innerHTML = '<div style="border: 1px solid #999; padding: 3px; width: 235px; box-sizing: content-box; font-size: 14px; height: 21px;">' + '<div id="fileButtons" style="box-sizing: content-box;">' + '<button id="button1" style="width: 100px; box-sizing: content-box;">Choose file(s)...</button>' + '<button id="button2" style="width: 100px; box-sizing: content-box; margin-left: 3px;">Choose folder...</button>' + '</div>' + '<div id="filesChosen" style="padding: 3px; display: none; box-sizing: content-box;"><span id="filesChosenText">files selected...</span>' + '<a id="clear" title="Clear selection" href="javascript:;" style="text-decoration: none; float: right; margin: -3px -1px 0 0; padding: 3px; font-weight: bold; font-size: 16px; color:#999; box-sizing: content-box;">&times;</a>' + '</div>' + '</div>' + '<input id="input1" type="file" multiple style="display: none;">' + '<input id="input2" type="file" webkitdirectory style="display: none;">' + '</div>';
            shadow.querySelector('#button1').onclick = function (e) {
              e.preventDefault();
              shadow.querySelector('#input1').click()
            };
            shadow.querySelector('#button2').onclick = function (e) {
              e.preventDefault();
              shadow.querySelector('#input2').click()
            };
            var toggleView = function (defaultView, filesLength) {
              shadow.querySelector('#fileButtons').style.display = defaultView ? 'block' : 'none';
              shadow.querySelector('#filesChosen').style.display = defaultView ? 'none' : 'block';
              if (!defaultView) {
                shadow.querySelector('#filesChosenText').innerText = filesLength + ' file' + (filesLength > 1 ? 's' : '') + ' selected...'
              }
            };
            var draggedAndDropped = false;
            var getFiles = function () {
              var files = node.files;
              if (draggedAndDropped) {
                files = node.webkitEntries;
                draggedAndDropped = false
              } else {
                if (files.length === 0) {
                  files = node.shadowRoot.querySelector('#input1').files;
                  if (files.length === 0) {
                    files = node.shadowRoot.querySelector('#input2').files;
                    if (files.length === 0) {
                      files = node.webkitEntries
                    }
                  }
                }
              }
              return files
            };
            var changeHandler = function (e) {
              node.dispatchEvent(new Event('change'));
              toggleView(false, getFiles().length)
            };
            shadow.querySelector('#input1').onchange = shadow.querySelector('#input2').onchange = changeHandler;
            var clear = function (e) {
              toggleView(true);
              var form = document.createElement('form');
              node.parentNode.insertBefore(form, node);
              node.parentNode.removeChild(node);
              form.appendChild(node);
              form.reset();
              form.parentNode.insertBefore(node, form);
              form.parentNode.removeChild(form);
              // reset does not instantly occur, need to give it some time
              setTimeout(function () {
                node.dispatchEvent(new Event('change'))
              }, 1)
            };
            shadow.querySelector('#clear').onclick = clear;
            node.addEventListener('drop', function (e) {
              draggedAndDropped = true
            }, false);
            node.addEventListener('change', function () {
              var dir = new Directory;
              var files = getFiles();
              if (files.length > 0) {
                toggleView(false, files.length);
                // from file input drag and drop (webkitEntries)
                if (files[0].isFile || files[0].isDirectory) {
                  dir._items = files
                } else {
                  for (var j = 0; j < files.length; j++) {
                    var file = files[j];
                    var path = file.webkitRelativePath;
                    var fullPath = path.substring(0, path.lastIndexOf(separator));
                    recurse(dir, path, fullPath, file)
                  }
                }
              } else {
                toggleView(true, files.length)
              }
              this[getFilesMethod] = function () {
                return dir[getFilesMethod]()
              }
            })
          }
        }
      };
      // polyfill file inputs when the DOM loads
      document.addEventListener('DOMContentLoaded', function (event) {
        convertInputs(document.getElementsByTagName('input'))
      });
      // polyfill file inputs that are created dynamically and inserted into the body
      var observer = new MutationObserver(function (mutations, observer) {
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].addedNodes.length > 0) {
            convertInputs(mutations[i].addedNodes)
          }
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      /***********************
	 **** Drag and drop ****
	 ***********************/
      // keep a reference to the original method
      var _addEventListener = Element.prototype.addEventListener;
      DataTransfer.prototype[getFilesMethod] = function () {
        return Promise.resolve([])
      };
      Element.prototype.addEventListener = function (type, listener, useCapture) {
        if (type === 'drop') {
          var _listener = listener;
          listener = function (e) {
            var dir = new Directory;
            dir._items = e.dataTransfer.items;
            e.dataTransfer[getFilesMethod] = function () {
              return dir[getFilesMethod]()
            };
            _listener(e)
          }
        }
        // call the original method
        return _addEventListener.apply(this, arguments)
      }
    }())
  });
  // source: /Users/a_/work/tractor-beam/src/tractor-beam.coffee
  require.define('./tractor-beam', function (module, exports, __dirname, __filename) {
    var EventEmitter, TractorBeam, xhr, extend = function (child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key]
        }
        function ctor() {
          this.constructor = child
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor;
        child.__super__ = parent.prototype;
        return child
      }, hasProp = {}.hasOwnProperty;
    EventEmitter = require('./event-emitter');
    xhr = require('xhr');
    require('./vendor/polyfill');
    TractorBeam = function (superClass) {
      extend(TractorBeam, superClass);
      function TractorBeam(selector, options) {
        this.selector = selector;
        this.options = options != null ? options : {};
        TractorBeam.__super__.constructor.apply(this, arguments);
        this.el = document.querySelector(this.selector);
        this.queue = [];
        this.bind()
      }
      TractorBeam.prototype.bind = function () {
        this.el.addEventListener('change', function (_this) {
          return function (e) {
            return _this.change(e)
          }
        }(this));
        this.el.addEventListener('dragleave', function (_this) {
          return function (e) {
            return _this.dragHover(e)
          }
        }(this));
        this.el.addEventListener('dragover', function (_this) {
          return function (e) {
            return _this.dragHover(e)
          }
        }(this));
        this.el.addEventListener('drop', function (_this) {
          return function (e) {
            return _this.drop(e)
          }
        }(this));
        return this.on('added', function (queue) {
          var file, i, len, postPath;
          if (this.options.postPath == null) {
            return
          }
          for (i = 0, len = queue.length; i < len; i++) {
            file = queue[i];
            postPath = typeof this.options.postPath === 'function' ? this.options.postPath(file) : this.options.postPath
          }
          return this.queue = []
        })
      };
      TractorBeam.prototype.change = function () {
        if (this.getFilesAndDirectories == null) {
          return
        }
        this.queue = [];
        this.getFilesAndDirectories().then(function (_this) {
          return function (filesAndDirs) {
            _this.iterateFilesAndDirs(filesAndDirs, '/')
          }
        }(this))
      };
      TractorBeam.prototype.dragHover = function (e) {
        e.stopPropagation();
        e.preventDefault()
      };
      TractorBeam.prototype.drop = function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (e.dataTransfer.getFilesAndDirectories == null) {
          return
        }
        return e.dataTransfer.getFilesAndDirectories().then(function (_this) {
          return function (filesAndDirs) {
            console.log(filesAndDirs);
            return _this.iterateFilesAndDirs(filesAndDirs, '/')
          }
        }(this))
      };
      TractorBeam.prototype.iterateFilesAndDirs = function (filesAndDirs, path) {
        var fd, file, i, len, results;
        if (filesAndDirs.length === 0) {
          this.emit('added', this.queue);
          return
        }
        results = [];
        for (i = 0, len = filesAndDirs.length; i < len; i++) {
          fd = filesAndDirs[i];
          if (typeof fd.getFilesAndDirectories === 'function') {
            path = fd.path;
            results.push(fd.getFilesAndDirectories().then(function (_this) {
              return function (subFilesAndDirs) {
                _this.iterateFilesAndDirs(subFilesAndDirs, path)
              }
            }(this)))
          } else {
            file = {
              fd: fd,
              path: path
            };
            this.emit('file', file);
            results.push(this.queue.push(file))
          }
        }
        return results
      };
      return TractorBeam
    }(EventEmitter);
    module.exports = TractorBeam
  });
  require('./tractor-beam')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV2ZW50LWVtaXR0ZXIuY29mZmVlIiwibm9kZV9tb2R1bGVzL3hoci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy94aHIvbm9kZV9tb2R1bGVzL2dsb2JhbC93aW5kb3cuanMiLCJub2RlX21vZHVsZXMveGhyL25vZGVfbW9kdWxlcy9vbmNlL29uY2UuanMiLCJub2RlX21vZHVsZXMveGhyL25vZGVfbW9kdWxlcy9wYXJzZS1oZWFkZXJzL3BhcnNlLWhlYWRlcnMuanMiLCJub2RlX21vZHVsZXMveGhyL25vZGVfbW9kdWxlcy9wYXJzZS1oZWFkZXJzL25vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3hoci9ub2RlX21vZHVsZXMvcGFyc2UtaGVhZGVycy9ub2RlX21vZHVsZXMvZm9yLWVhY2gvaW5kZXguanMiLCJub2RlX21vZHVsZXMveGhyL25vZGVfbW9kdWxlcy9wYXJzZS1oZWFkZXJzL25vZGVfbW9kdWxlcy9mb3ItZWFjaC9ub2RlX21vZHVsZXMvaXMtZnVuY3Rpb24vaW5kZXguanMiLCJ2ZW5kb3IvcG9seWZpbGwuanMiLCJ0cmFjdG9yLWJlYW0uY29mZmVlIl0sIm5hbWVzIjpbIkV2ZW50RW1pdHRlciIsInNsaWNlIiwib3B0cyIsInJlZiIsImRlYnVnIiwiX2xpc3RlbmVycyIsIl9hbGxMaXN0ZW5lcnMiLCJwcm90b3R5cGUiLCJvbiIsImV2ZW50IiwiY2FsbGJhY2siLCJiYXNlIiwicHVzaCIsImxlbmd0aCIsIm9mZiIsImluZGV4IiwiZW1pdCIsImFyZ3MiLCJpIiwiaiIsImxlbiIsImxlbjEiLCJsaXN0ZW5lciIsImxpc3RlbmVycyIsImFyZ3VtZW50cyIsImNhbGwiLCJhcHBseSIsInVuc2hpZnQiLCJjb25zb2xlIiwibG9nIiwibW9kdWxlIiwiZXhwb3J0cyIsIndpbmRvdyIsInJlcXVpcmUiLCJvbmNlIiwicGFyc2VIZWFkZXJzIiwiY3JlYXRlWEhSIiwiWE1MSHR0cFJlcXVlc3QiLCJub29wIiwiWERvbWFpblJlcXVlc3QiLCJpc0VtcHR5Iiwib2JqIiwiaGFzT3duUHJvcGVydHkiLCJvcHRpb25zIiwicmVhZHlzdGF0ZWNoYW5nZSIsInhociIsInJlYWR5U3RhdGUiLCJsb2FkRnVuYyIsImdldEJvZHkiLCJib2R5IiwidW5kZWZpbmVkIiwicmVzcG9uc2UiLCJyZXNwb25zZVR5cGUiLCJyZXNwb25zZVRleHQiLCJyZXNwb25zZVhNTCIsImlzSnNvbiIsIkpTT04iLCJwYXJzZSIsImUiLCJmYWlsdXJlUmVzcG9uc2UiLCJoZWFkZXJzIiwic3RhdHVzQ29kZSIsIm1ldGhvZCIsInVybCIsInVyaSIsInJhd1JlcXVlc3QiLCJlcnJvckZ1bmMiLCJldnQiLCJjbGVhclRpbWVvdXQiLCJ0aW1lb3V0VGltZXIiLCJFcnJvciIsImFib3J0ZWQiLCJzdGF0dXMiLCJ1c2VYRFIiLCJlcnIiLCJnZXRBbGxSZXNwb25zZUhlYWRlcnMiLCJjb3JzIiwia2V5IiwiZGF0YSIsInN5bmMiLCJzdHJpbmdpZnkiLCJqc29uIiwib25yZWFkeXN0YXRlY2hhbmdlIiwib25sb2FkIiwib25lcnJvciIsIm9ucHJvZ3Jlc3MiLCJvbnRpbWVvdXQiLCJvcGVuIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsIndpdGhDcmVkZW50aWFscyIsInRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiYWJvcnQiLCJzZXRSZXF1ZXN0SGVhZGVyIiwiYmVmb3JlU2VuZCIsInNlbmQiLCJnbG9iYWwiLCJzZWxmIiwicHJvdG8iLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsIkZ1bmN0aW9uIiwidmFsdWUiLCJjb25maWd1cmFibGUiLCJmbiIsImNhbGxlZCIsInRyaW0iLCJmb3JFYWNoIiwiaXNBcnJheSIsImFyZyIsInRvU3RyaW5nIiwicmVzdWx0Iiwic3BsaXQiLCJyb3ciLCJpbmRleE9mIiwidG9Mb3dlckNhc2UiLCJzdHIiLCJyZXBsYWNlIiwibGVmdCIsInJpZ2h0IiwiaXNGdW5jdGlvbiIsImxpc3QiLCJpdGVyYXRvciIsImNvbnRleHQiLCJUeXBlRXJyb3IiLCJmb3JFYWNoQXJyYXkiLCJmb3JFYWNoU3RyaW5nIiwiZm9yRWFjaE9iamVjdCIsImFycmF5Iiwic3RyaW5nIiwiY2hhckF0Iiwib2JqZWN0IiwiayIsImFsZXJ0IiwiY29uZmlybSIsInByb21wdCIsIkRpcmVjdG9yeSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImRpcmVjdG9yeUF0dHIiLCJnZXRGaWxlc01ldGhvZCIsImlzU3VwcG9ydGVkUHJvcCIsImNob29zZURpck1ldGhvZCIsInNlcGFyYXRvciIsIm5hbWUiLCJwYXRoIiwiX2NoaWxkcmVuIiwiX2l0ZW1zIiwidGhhdCIsImdldEl0ZW0iLCJlbnRyeSIsImlzRGlyZWN0b3J5IiwiZGlyIiwiZnVsbFBhdGgiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImZpbGUiLCJwcm9taXNlcyIsImlzRmlsZSIsIndlYmtpdEdldEFzRW50cnkiLCJhbGwiLCJjcmVhdGVSZWFkZXIiLCJyZWFkRW50cmllcyIsImVudHJpZXMiLCJhcnIiLCJjaGlsZCIsIkhUTUxJbnB1dEVsZW1lbnQiLCJuYXZpZ2F0b3IiLCJhcHBWZXJzaW9uIiwiY29udmVydElucHV0cyIsIm5vZGVzIiwicmVjdXJzZSIsInBhdGhQaWVjZXMiLCJkaXJOYW1lIiwic2hpZnQiLCJzdWJEaXIiLCJqb2luIiwibm9kZSIsInRhZ05hbWUiLCJ0eXBlIiwiaGFzQXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwic2hhZG93IiwiY3JlYXRlU2hhZG93Um9vdCIsImlubmVySFRNTCIsInF1ZXJ5U2VsZWN0b3IiLCJvbmNsaWNrIiwicHJldmVudERlZmF1bHQiLCJjbGljayIsInRvZ2dsZVZpZXciLCJkZWZhdWx0VmlldyIsImZpbGVzTGVuZ3RoIiwic3R5bGUiLCJkaXNwbGF5IiwiaW5uZXJUZXh0IiwiZHJhZ2dlZEFuZERyb3BwZWQiLCJnZXRGaWxlcyIsImZpbGVzIiwid2Via2l0RW50cmllcyIsInNoYWRvd1Jvb3QiLCJjaGFuZ2VIYW5kbGVyIiwiZGlzcGF0Y2hFdmVudCIsIkV2ZW50Iiwib25jaGFuZ2UiLCJjbGVhciIsImZvcm0iLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwicmVtb3ZlQ2hpbGQiLCJhcHBlbmRDaGlsZCIsInJlc2V0IiwiYWRkRXZlbnRMaXN0ZW5lciIsIndlYmtpdFJlbGF0aXZlUGF0aCIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJvYnNlcnZlciIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJtdXRhdGlvbnMiLCJhZGRlZE5vZGVzIiwib2JzZXJ2ZSIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJfYWRkRXZlbnRMaXN0ZW5lciIsIkVsZW1lbnQiLCJEYXRhVHJhbnNmZXIiLCJ1c2VDYXB0dXJlIiwiX2xpc3RlbmVyIiwiZGF0YVRyYW5zZmVyIiwiaXRlbXMiLCJUcmFjdG9yQmVhbSIsImV4dGVuZCIsInBhcmVudCIsImhhc1Byb3AiLCJjdG9yIiwiY29uc3RydWN0b3IiLCJfX3N1cGVyX18iLCJzdXBlckNsYXNzIiwic2VsZWN0b3IiLCJlbCIsInF1ZXVlIiwiYmluZCIsIl90aGlzIiwiY2hhbmdlIiwiZHJhZ0hvdmVyIiwiZHJvcCIsInBvc3RQYXRoIiwiZ2V0RmlsZXNBbmREaXJlY3RvcmllcyIsInRoZW4iLCJmaWxlc0FuZERpcnMiLCJpdGVyYXRlRmlsZXNBbmREaXJzIiwic3RvcFByb3BhZ2F0aW9uIiwiZmQiLCJyZXN1bHRzIiwic3ViRmlsZXNBbmREaXJzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxZQUFKLEVBQ0VDLEtBQUEsR0FBUSxHQUFHQSxLQURiLEM7SUFHQUQsWUFBQSxHQUFnQixZQUFXO0FBQUEsTUFDekIsU0FBU0EsWUFBVCxDQUFzQkUsSUFBdEIsRUFBNEI7QUFBQSxRQUMxQixJQUFJQyxHQUFKLENBRDBCO0FBQUEsUUFFMUIsSUFBSUQsSUFBQSxJQUFR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