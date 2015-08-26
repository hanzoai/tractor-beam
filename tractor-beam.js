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
    var EventEmitter, File, TractorBeam, xhr, extend = function (child, parent) {
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
    File = function () {
      function File(fd, path) {
        this.fd = fd;
        this.directory = path;
        this.name = fd.name;
        this.path = path + '/' + fd.name;
        this.skipped = false
      }
      return File
    }();
    TractorBeam = function (superClass) {
      extend(TractorBeam, superClass);
      function TractorBeam(selector, options) {
        this.selector = selector;
        this.options = options != null ? options : {};
        TractorBeam.__super__.constructor.apply(this, arguments);
        this.el = document.querySelector(this.selector);
        this.queue = {};
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
        return this.el.addEventListener('drop', function (_this) {
          return function (e) {
            return _this.drop(e)
          }
        }(this))
      };
      TractorBeam.prototype.change = function () {
        if (this.getFilesAndDirectories == null) {
          return
        }
        return this.getFilesAndDirectories().then(function (_this) {
          return function (filesAndDirs) {
            return _this.iterateFilesAndDirs(filesAndDirs, '/')
          }
        }(this))
      };
      TractorBeam.prototype.dragHover = function (e) {
        e.stopPropagation();
        return e.preventDefault()
      };
      TractorBeam.prototype.drop = function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (e.dataTransfer.getFilesAndDirectories == null) {
          this.emit('unsupported');
          console.error('Directory drag and drop is unsupported by this browser');
          return
        }
        return e.dataTransfer.getFilesAndDirectories().then(function (_this) {
          return function (filesAndDirs) {
            return _this.iterateFilesAndDirs(filesAndDirs, '/')
          }
        }(this))
      };
      TractorBeam.prototype.iterateFilesAndDirs = function (filesAndDirs, path) {
        var done, fd, file, i, len;
        done = true;
        for (i = 0, len = filesAndDirs.length; i < len; i++) {
          fd = filesAndDirs[i];
          if (typeof fd.getFilesAndDirectories === 'function') {
            done = false;
            path = fd.path;
            fd.getFilesAndDirectories().then(function (_this) {
              return function (subFilesAndDirs) {
                _this.iterateFilesAndDirs(subFilesAndDirs, path)
              }
            }(this))
          } else {
            file = new File(fd, path);
            this.emit('file', file);
            this.queue[file.path] = file
          }
        }
        if (done) {
          return this.emit('dropped', this.queue)
        }
      };
      TractorBeam.prototype.add = function (filepath) {
        this.queue[filepath].skipped = false;
        return this
      };
      TractorBeam.prototype.remove = function (filepath) {
        var file;
        file = this.queue[filepath];
        delete this.queue[filepath];
        return file
      };
      TractorBeam.prototype.skip = function (filepath) {
        this.queue[filepath].skipped = true;
        return this
      };
      return TractorBeam
    }(EventEmitter);
    module.exports = TractorBeam
  });
  require('./tractor-beam')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV2ZW50LWVtaXR0ZXIuY29mZmVlIiwibm9kZV9tb2R1bGVzL3hoci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy94aHIvbm9kZV9tb2R1bGVzL2dsb2JhbC93aW5kb3cuanMiLCJub2RlX21vZHVsZXMveGhyL25vZGVfbW9kdWxlcy9vbmNlL29uY2UuanMiLCJub2RlX21vZHVsZXMveGhyL25vZGVfbW9kdWxlcy9wYXJzZS1oZWFkZXJzL3BhcnNlLWhlYWRlcnMuanMiLCJub2RlX21vZHVsZXMveGhyL25vZGVfbW9kdWxlcy9wYXJzZS1oZWFkZXJzL25vZGVfbW9kdWxlcy90cmltL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3hoci9ub2RlX21vZHVsZXMvcGFyc2UtaGVhZGVycy9ub2RlX21vZHVsZXMvZm9yLWVhY2gvaW5kZXguanMiLCJub2RlX21vZHVsZXMveGhyL25vZGVfbW9kdWxlcy9wYXJzZS1oZWFkZXJzL25vZGVfbW9kdWxlcy9mb3ItZWFjaC9ub2RlX21vZHVsZXMvaXMtZnVuY3Rpb24vaW5kZXguanMiLCJ2ZW5kb3IvcG9seWZpbGwuanMiLCJ0cmFjdG9yLWJlYW0uY29mZmVlIl0sIm5hbWVzIjpbIkV2ZW50RW1pdHRlciIsInNsaWNlIiwib3B0cyIsInJlZiIsImRlYnVnIiwiX2xpc3RlbmVycyIsIl9hbGxMaXN0ZW5lcnMiLCJwcm90b3R5cGUiLCJvbiIsImV2ZW50IiwiY2FsbGJhY2siLCJiYXNlIiwicHVzaCIsImxlbmd0aCIsIm9mZiIsImluZGV4IiwiZW1pdCIsImFyZ3MiLCJpIiwiaiIsImxlbiIsImxlbjEiLCJsaXN0ZW5lciIsImxpc3RlbmVycyIsImFyZ3VtZW50cyIsImNhbGwiLCJhcHBseSIsInVuc2hpZnQiLCJjb25zb2xlIiwibG9nIiwibW9kdWxlIiwiZXhwb3J0cyIsIndpbmRvdyIsInJlcXVpcmUiLCJvbmNlIiwicGFyc2VIZWFkZXJzIiwiY3JlYXRlWEhSIiwiWE1MSHR0cFJlcXVlc3QiLCJub29wIiwiWERvbWFpblJlcXVlc3QiLCJpc0VtcHR5Iiwib2JqIiwiaGFzT3duUHJvcGVydHkiLCJvcHRpb25zIiwicmVhZHlzdGF0ZWNoYW5nZSIsInhociIsInJlYWR5U3RhdGUiLCJsb2FkRnVuYyIsImdldEJvZHkiLCJib2R5IiwidW5kZWZpbmVkIiwicmVzcG9uc2UiLCJyZXNwb25zZVR5cGUiLCJyZXNwb25zZVRleHQiLCJyZXNwb25zZVhNTCIsImlzSnNvbiIsIkpTT04iLCJwYXJzZSIsImUiLCJmYWlsdXJlUmVzcG9uc2UiLCJoZWFkZXJzIiwic3RhdHVzQ29kZSIsIm1ldGhvZCIsInVybCIsInVyaSIsInJhd1JlcXVlc3QiLCJlcnJvckZ1bmMiLCJldnQiLCJjbGVhclRpbWVvdXQiLCJ0aW1lb3V0VGltZXIiLCJFcnJvciIsImFib3J0ZWQiLCJzdGF0dXMiLCJ1c2VYRFIiLCJlcnIiLCJnZXRBbGxSZXNwb25zZUhlYWRlcnMiLCJjb3JzIiwia2V5IiwiZGF0YSIsInN5bmMiLCJzdHJpbmdpZnkiLCJqc29uIiwib25yZWFkeXN0YXRlY2hhbmdlIiwib25sb2FkIiwib25lcnJvciIsIm9ucHJvZ3Jlc3MiLCJvbnRpbWVvdXQiLCJvcGVuIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsIndpdGhDcmVkZW50aWFscyIsInRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiYWJvcnQiLCJzZXRSZXF1ZXN0SGVhZGVyIiwiYmVmb3JlU2VuZCIsInNlbmQiLCJnbG9iYWwiLCJzZWxmIiwicHJvdG8iLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsIkZ1bmN0aW9uIiwidmFsdWUiLCJjb25maWd1cmFibGUiLCJmbiIsImNhbGxlZCIsInRyaW0iLCJmb3JFYWNoIiwiaXNBcnJheSIsImFyZyIsInRvU3RyaW5nIiwicmVzdWx0Iiwic3BsaXQiLCJyb3ciLCJpbmRleE9mIiwidG9Mb3dlckNhc2UiLCJzdHIiLCJyZXBsYWNlIiwibGVmdCIsInJpZ2h0IiwiaXNGdW5jdGlvbiIsImxpc3QiLCJpdGVyYXRvciIsImNvbnRleHQiLCJUeXBlRXJyb3IiLCJmb3JFYWNoQXJyYXkiLCJmb3JFYWNoU3RyaW5nIiwiZm9yRWFjaE9iamVjdCIsImFycmF5Iiwic3RyaW5nIiwiY2hhckF0Iiwib2JqZWN0IiwiayIsImFsZXJ0IiwiY29uZmlybSIsInByb21wdCIsIkRpcmVjdG9yeSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImRpcmVjdG9yeUF0dHIiLCJnZXRGaWxlc01ldGhvZCIsImlzU3VwcG9ydGVkUHJvcCIsImNob29zZURpck1ldGhvZCIsInNlcGFyYXRvciIsIm5hbWUiLCJwYXRoIiwiX2NoaWxkcmVuIiwiX2l0ZW1zIiwidGhhdCIsImdldEl0ZW0iLCJlbnRyeSIsImlzRGlyZWN0b3J5IiwiZGlyIiwiZnVsbFBhdGgiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImZpbGUiLCJwcm9taXNlcyIsImlzRmlsZSIsIndlYmtpdEdldEFzRW50cnkiLCJhbGwiLCJjcmVhdGVSZWFkZXIiLCJyZWFkRW50cmllcyIsImVudHJpZXMiLCJhcnIiLCJjaGlsZCIsIkhUTUxJbnB1dEVsZW1lbnQiLCJuYXZpZ2F0b3IiLCJhcHBWZXJzaW9uIiwiY29udmVydElucHV0cyIsIm5vZGVzIiwicmVjdXJzZSIsInBhdGhQaWVjZXMiLCJkaXJOYW1lIiwic2hpZnQiLCJzdWJEaXIiLCJqb2luIiwibm9kZSIsInRhZ05hbWUiLCJ0eXBlIiwiaGFzQXR0cmlidXRlIiwic2V0QXR0cmlidXRlIiwic2hhZG93IiwiY3JlYXRlU2hhZG93Um9vdCIsImlubmVySFRNTCIsInF1ZXJ5U2VsZWN0b3IiLCJvbmNsaWNrIiwicHJldmVudERlZmF1bHQiLCJjbGljayIsInRvZ2dsZVZpZXciLCJkZWZhdWx0VmlldyIsImZpbGVzTGVuZ3RoIiwic3R5bGUiLCJkaXNwbGF5IiwiaW5uZXJUZXh0IiwiZHJhZ2dlZEFuZERyb3BwZWQiLCJnZXRGaWxlcyIsImZpbGVzIiwid2Via2l0RW50cmllcyIsInNoYWRvd1Jvb3QiLCJjaGFuZ2VIYW5kbGVyIiwiZGlzcGF0Y2hFdmVudCIsIkV2ZW50Iiwib25jaGFuZ2UiLCJjbGVhciIsImZvcm0iLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwicmVtb3ZlQ2hpbGQiLCJhcHBlbmRDaGlsZCIsInJlc2V0IiwiYWRkRXZlbnRMaXN0ZW5lciIsIndlYmtpdFJlbGF0aXZlUGF0aCIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJvYnNlcnZlciIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJtdXRhdGlvbnMiLCJhZGRlZE5vZGVzIiwib2JzZXJ2ZSIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJfYWRkRXZlbnRMaXN0ZW5lciIsIkVsZW1lbnQiLCJEYXRhVHJhbnNmZXIiLCJ1c2VDYXB0dXJlIiwiX2xpc3RlbmVyIiwiZGF0YVRyYW5zZmVyIiwiaXRlbXMiLCJGaWxlIiwiVHJhY3RvckJlYW0iLCJleHRlbmQiLCJwYXJlbnQiLCJoYXNQcm9wIiwiY3RvciIsImNvbnN0cnVjdG9yIiwiX19zdXBlcl9fIiwiZmQiLCJkaXJlY3RvcnkiLCJza2lwcGVkIiwic3VwZXJDbGFzcyIsInNlbGVjdG9yIiwiZWwiLCJxdWV1ZSIsImJpbmQiLCJfdGhpcyIsImNoYW5nZSIsImRyYWdIb3ZlciIsImRyb3AiLCJnZXRGaWxlc0FuZERpcmVjdG9yaWVzIiwidGhlbiIsImZpbGVzQW5kRGlycyIsIml0ZXJhdGVGaWxlc0FuZERpcnMiLCJzdG9wUHJvcGFnYXRpb24iLCJlcnJvciIsImRvbmUiLCJzdWJGaWxlc0FuZERpcnMiLCJhZGQiLCJmaWxlcGF0aCIsInJlbW92ZSIsInNraXAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBLElBQUlBLFlBQUosRUFDRUMsS0FBQSxHQUFRLEdBQUdBLEtBRGIsQztJQUdBRCxZQUFBLEdBQWdCLFlBQVc7QUFBQSxNQUN6QixTQUFTQSxZQUFULENBQXNCRSxJQUF0QixFQUE0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