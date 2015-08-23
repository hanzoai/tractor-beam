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
  global.require = require;
  // source: /Users/a_/work/tractor-beam/lib/polyfill.js
  require.define('./Users/a_/work/tractor-beam/lib/polyfill', function (module, exports, __dirname, __filename) {
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
  // source: /Users/a_/work/tractor-beam/node_modules/event-emitter/index.js
  require.define('event-emitter', function (module, exports, __dirname, __filename) {
    'use strict';
    var d = require('event-emitter/node_modules/d'), callable = require('event-emitter/node_modules/es5-ext/object/valid-callable'), apply = Function.prototype.apply, call = Function.prototype.call, create = Object.create, defineProperty = Object.defineProperty, defineProperties = Object.defineProperties, hasOwnProperty = Object.prototype.hasOwnProperty, descriptor = {
        configurable: true,
        enumerable: false,
        writable: true
      }, on, once, off, emit, methods, descriptors, base;
    on = function (type, listener) {
      var data;
      callable(listener);
      if (!hasOwnProperty.call(this, '__ee__')) {
        data = descriptor.value = create(null);
        defineProperty(this, '__ee__', descriptor);
        descriptor.value = null
      } else {
        data = this.__ee__
      }
      if (!data[type])
        data[type] = listener;
      else if (typeof data[type] === 'object')
        data[type].push(listener);
      else
        data[type] = [
          data[type],
          listener
        ];
      return this
    };
    once = function (type, listener) {
      var once, self;
      callable(listener);
      self = this;
      on.call(this, type, once = function () {
        off.call(self, type, once);
        apply.call(listener, this, arguments)
      });
      once.__eeOnceListener__ = listener;
      return this
    };
    off = function (type, listener) {
      var data, listeners, candidate, i;
      callable(listener);
      if (!hasOwnProperty.call(this, '__ee__'))
        return this;
      data = this.__ee__;
      if (!data[type])
        return this;
      listeners = data[type];
      if (typeof listeners === 'object') {
        for (i = 0; candidate = listeners[i]; ++i) {
          if (candidate === listener || candidate.__eeOnceListener__ === listener) {
            if (listeners.length === 2)
              data[type] = listeners[i ? 0 : 1];
            else
              listeners.splice(i, 1)
          }
        }
      } else {
        if (listeners === listener || listeners.__eeOnceListener__ === listener) {
          delete data[type]
        }
      }
      return this
    };
    emit = function (type) {
      var i, l, listener, listeners, args;
      if (!hasOwnProperty.call(this, '__ee__'))
        return;
      listeners = this.__ee__[type];
      if (!listeners)
        return;
      if (typeof listeners === 'object') {
        l = arguments.length;
        args = new Array(l - 1);
        for (i = 1; i < l; ++i)
          args[i - 1] = arguments[i];
        listeners = listeners.slice();
        for (i = 0; listener = listeners[i]; ++i) {
          apply.call(listener, this, args)
        }
      } else {
        switch (arguments.length) {
        case 1:
          call.call(listeners, this);
          break;
        case 2:
          call.call(listeners, this, arguments[1]);
          break;
        case 3:
          call.call(listeners, this, arguments[1], arguments[2]);
          break;
        default:
          l = arguments.length;
          args = new Array(l - 1);
          for (i = 1; i < l; ++i) {
            args[i - 1] = arguments[i]
          }
          apply.call(listeners, this, args)
        }
      }
    };
    methods = {
      on: on,
      once: once,
      off: off,
      emit: emit
    };
    descriptors = {
      on: d(on),
      once: d(once),
      off: d(off),
      emit: d(emit)
    };
    base = defineProperties({}, descriptors);
    module.exports = exports = function (o) {
      return o == null ? create(base) : defineProperties(Object(o), descriptors)
    };
    exports.methods = methods
  });
  // source: /Users/a_/work/tractor-beam/node_modules/event-emitter/node_modules/d/index.js
  require.define('event-emitter/node_modules/d', function (module, exports, __dirname, __filename) {
    'use strict';
    var assign = require('event-emitter/node_modules/es5-ext/object/assign'), normalizeOpts = require('event-emitter/node_modules/es5-ext/object/normalize-options'), isCallable = require('event-emitter/node_modules/es5-ext/object/is-callable'), contains = require('event-emitter/node_modules/es5-ext/string/#/contains'), d;
    d = module.exports = function (dscr, value) {
      var c, e, w, options, desc;
      if (arguments.length < 2 || typeof dscr !== 'string') {
        options = value;
        value = dscr;
        dscr = null
      } else {
        options = arguments[2]
      }
      if (dscr == null) {
        c = w = true;
        e = false
      } else {
        c = contains.call(dscr, 'c');
        e = contains.call(dscr, 'e');
        w = contains.call(dscr, 'w')
      }
      desc = {
        value: value,
        configurable: c,
        enumerable: e,
        writable: w
      };
      return !options ? desc : assign(normalizeOpts(options), desc)
    };
    d.gs = function (dscr, get, set) {
      var c, e, options, desc;
      if (typeof dscr !== 'string') {
        options = set;
        set = get;
        get = dscr;
        dscr = null
      } else {
        options = arguments[3]
      }
      if (get == null) {
        get = undefined
      } else if (!isCallable(get)) {
        options = get;
        get = set = undefined
      } else if (set == null) {
        set = undefined
      } else if (!isCallable(set)) {
        options = set;
        set = undefined
      }
      if (dscr == null) {
        c = true;
        e = false
      } else {
        c = contains.call(dscr, 'c');
        e = contains.call(dscr, 'e')
      }
      desc = {
        get: get,
        set: set,
        configurable: c,
        enumerable: e
      };
      return !options ? desc : assign(normalizeOpts(options), desc)
    }
  });
  // source: /Users/a_/work/tractor-beam/node_modules/event-emitter/node_modules/es5-ext/object/assign/index.js
  require.define('event-emitter/node_modules/es5-ext/object/assign', function (module, exports, __dirname, __filename) {
    'use strict';
    module.exports = require('event-emitter/node_modules/es5-ext/object/assign/is-implemented')() ? Object.assign : require('event-emitter/node_modules/es5-ext/object/assign/shim')
  });
  // source: /Users/a_/work/tractor-beam/node_modules/event-emitter/node_modules/es5-ext/object/assign/is-implemented.js
  require.define('event-emitter/node_modules/es5-ext/object/assign/is-implemented', function (module, exports, __dirname, __filename) {
    'use strict';
    module.exports = function () {
      var assign = Object.assign, obj;
      if (typeof assign !== 'function')
        return false;
      obj = { foo: 'raz' };
      assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
      return obj.foo + obj.bar + obj.trzy === 'razdwatrzy'
    }
  });
  // source: /Users/a_/work/tractor-beam/node_modules/event-emitter/node_modules/es5-ext/object/assign/shim.js
  require.define('event-emitter/node_modules/es5-ext/object/assign/shim', function (module, exports, __dirname, __filename) {
    'use strict';
    var keys = require('event-emitter/node_modules/es5-ext/object/keys'), value = require('event-emitter/node_modules/es5-ext/object/valid-value'), max = Math.max;
    module.exports = function (dest, src) {
      var error, i, l = max(arguments.length, 2), assign;
      dest = Object(value(dest));
      assign = function (key) {
        try {
          dest[key] = src[key]
        } catch (e) {
          if (!error)
            error = e
        }
      };
      for (i = 1; i < l; ++i) {
        src = arguments[i];
        keys(src).forEach(assign)
      }
      if (error !== undefined)
        throw error;
      return dest
    }
  });
  // source: /Users/a_/work/tractor-beam/node_modules/event-emitter/node_modules/es5-ext/object/keys/index.js
  require.define('event-emitter/node_modules/es5-ext/object/keys', function (module, exports, __dirname, __filename) {
    'use strict';
    module.exports = require('event-emitter/node_modules/es5-ext/object/keys/is-implemented')() ? Object.keys : require('event-emitter/node_modules/es5-ext/object/keys/shim')
  });
  // source: /Users/a_/work/tractor-beam/node_modules/event-emitter/node_modules/es5-ext/object/keys/is-implemented.js
  require.define('event-emitter/node_modules/es5-ext/object/keys/is-implemented', function (module, exports, __dirname, __filename) {
    'use strict';
    module.exports = function () {
      try {
        Object.keys('primitive');
        return true
      } catch (e) {
        return false
      }
    }
  });
  // source: /Users/a_/work/tractor-beam/node_modules/event-emitter/node_modules/es5-ext/object/keys/shim.js
  require.define('event-emitter/node_modules/es5-ext/object/keys/shim', function (module, exports, __dirname, __filename) {
    'use strict';
    var keys = Object.keys;
    module.exports = function (object) {
      return keys(object == null ? object : Object(object))
    }
  });
  // source: /Users/a_/work/tractor-beam/node_modules/event-emitter/node_modules/es5-ext/object/valid-value.js
  require.define('event-emitter/node_modules/es5-ext/object/valid-value', function (module, exports, __dirname, __filename) {
    'use strict';
    module.exports = function (value) {
      if (value == null)
        throw new TypeError('Cannot use null or undefined');
      return value
    }
  });
  // source: /Users/a_/work/tractor-beam/node_modules/event-emitter/node_modules/es5-ext/object/normalize-options.js
  require.define('event-emitter/node_modules/es5-ext/object/normalize-options', function (module, exports, __dirname, __filename) {
    'use strict';
    var forEach = Array.prototype.forEach, create = Object.create;
    var process = function (src, obj) {
      var key;
      for (key in src)
        obj[key] = src[key]
    };
    module.exports = function (options) {
      var result = create(null);
      forEach.call(arguments, function (options) {
        if (options == null)
          return;
        process(Object(options), result)
      });
      return result
    }
  });
  // source: /Users/a_/work/tractor-beam/node_modules/event-emitter/node_modules/es5-ext/object/is-callable.js
  require.define('event-emitter/node_modules/es5-ext/object/is-callable', function (module, exports, __dirname, __filename) {
    // Deprecated
    'use strict';
    module.exports = function (obj) {
      return typeof obj === 'function'
    }
  });
  // source: /Users/a_/work/tractor-beam/node_modules/event-emitter/node_modules/es5-ext/string/#/contains/index.js
  require.define('event-emitter/node_modules/es5-ext/string/#/contains', function (module, exports, __dirname, __filename) {
    'use strict';
    module.exports = require('event-emitter/node_modules/es5-ext/string/#/contains/is-implemented')() ? String.prototype.contains : require('event-emitter/node_modules/es5-ext/string/#/contains/shim')
  });
  // source: /Users/a_/work/tractor-beam/node_modules/event-emitter/node_modules/es5-ext/string/#/contains/is-implemented.js
  require.define('event-emitter/node_modules/es5-ext/string/#/contains/is-implemented', function (module, exports, __dirname, __filename) {
    'use strict';
    var str = 'razdwatrzy';
    module.exports = function () {
      if (typeof str.contains !== 'function')
        return false;
      return str.contains('dwa') === true && str.contains('foo') === false
    }
  });
  // source: /Users/a_/work/tractor-beam/node_modules/event-emitter/node_modules/es5-ext/string/#/contains/shim.js
  require.define('event-emitter/node_modules/es5-ext/string/#/contains/shim', function (module, exports, __dirname, __filename) {
    'use strict';
    var indexOf = String.prototype.indexOf;
    module.exports = function (searchString) {
      return indexOf.call(this, searchString, arguments[1]) > -1
    }
  });
  // source: /Users/a_/work/tractor-beam/node_modules/event-emitter/node_modules/es5-ext/object/valid-callable.js
  require.define('event-emitter/node_modules/es5-ext/object/valid-callable', function (module, exports, __dirname, __filename) {
    'use strict';
    module.exports = function (fn) {
      if (typeof fn !== 'function')
        throw new TypeError(fn + ' is not a function');
      return fn
    }
  });
  // source: /Users/a_/work/tractor-beam/src/tractor_beam.coffee
  require.define('./tractor_beam', function (module, exports, __dirname, __filename) {
    var EventEmitter, TractorBeam;
    require('./Users/a_/work/tractor-beam/lib/polyfill');
    EventEmitter = require('event-emitter');
    TractorBeam = function () {
      function TractorBeam(selector, options) {
        var base;
        this.selector = selector;
        this.options = options != null ? options : {};
        if ((base = this.options).type == null) {
          base.type = 'fileinput'
        }
        this.el = document.querySelector(this.selector);
        this.emitter = new EventEmitter;
        this.queue = [];
        this.bind()
      }
      TractorBeam.prototype.bind = function () {
        this.el.addEventListener('change', this.change);
        this.el.addEventListener('dragleave', this.dragHover);
        this.el.addEventListener('dragover', this.dragHover);
        this.el.addEventListener('drop', this.drop);
        return this.emitter.on('upload', function (queue) {
          var file, i, len, postPath, results;
          if (this.options.postPath == null) {
            return
          }
          results = [];
          for (i = 0, len = queue.length; i < len; i++) {
            file = queue[i];
            postPath = typeof this.options.postPath === 'function' ? this.options.postPath(file) : this.options.postPath;
            results.push(console.log(file))
          }
          return results
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
          this.emitter.emit('upload', this.queue);
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
            this.emitter.emit('file', file);
            results.push(this.queue.push(file))
          }
        }
        return results
      };
      return TractorBeam
    }();
    module.exports = TractorBeam
  });
  require('./tractor_beam')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlVzZXJzL2FfL3dvcmsvdHJhY3Rvci1iZWFtL2xpYi9wb2x5ZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudC1lbWl0dGVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50LWVtaXR0ZXIvbm9kZV9tb2R1bGVzL2QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZXZlbnQtZW1pdHRlci9ub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvYXNzaWduL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50LWVtaXR0ZXIvbm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2Fzc2lnbi9pcy1pbXBsZW1lbnRlZC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudC1lbWl0dGVyL25vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9hc3NpZ24vc2hpbS5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudC1lbWl0dGVyL25vZGVfbW9kdWxlcy9lczUtZXh0L29iamVjdC9rZXlzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50LWVtaXR0ZXIvbm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2tleXMvaXMtaW1wbGVtZW50ZWQuanMiLCJub2RlX21vZHVsZXMvZXZlbnQtZW1pdHRlci9ub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3Qva2V5cy9zaGltLmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50LWVtaXR0ZXIvbm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L3ZhbGlkLXZhbHVlLmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50LWVtaXR0ZXIvbm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L25vcm1hbGl6ZS1vcHRpb25zLmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50LWVtaXR0ZXIvbm9kZV9tb2R1bGVzL2VzNS1leHQvb2JqZWN0L2lzLWNhbGxhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50LWVtaXR0ZXIvbm9kZV9tb2R1bGVzL2VzNS1leHQvc3RyaW5nLyMvY29udGFpbnMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZXZlbnQtZW1pdHRlci9ub2RlX21vZHVsZXMvZXM1LWV4dC9zdHJpbmcvIy9jb250YWlucy9pcy1pbXBsZW1lbnRlZC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudC1lbWl0dGVyL25vZGVfbW9kdWxlcy9lczUtZXh0L3N0cmluZy8jL2NvbnRhaW5zL3NoaW0uanMiLCJub2RlX21vZHVsZXMvZXZlbnQtZW1pdHRlci9ub2RlX21vZHVsZXMvZXM1LWV4dC9vYmplY3QvdmFsaWQtY2FsbGFibGUuanMiLCJ0cmFjdG9yX2JlYW0uY29mZmVlIl0sIm5hbWVzIjpbIndpbmRvdyIsIkRpcmVjdG9yeSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImRpcmVjdG9yeUF0dHIiLCJnZXRGaWxlc01ldGhvZCIsImlzU3VwcG9ydGVkUHJvcCIsImNob29zZURpck1ldGhvZCIsInNlcGFyYXRvciIsIm5hbWUiLCJwYXRoIiwiX2NoaWxkcmVuIiwiX2l0ZW1zIiwicHJvdG90eXBlIiwidGhhdCIsImdldEl0ZW0iLCJlbnRyeSIsImlzRGlyZWN0b3J5IiwiZGlyIiwiZnVsbFBhdGgiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImZpbGUiLCJwcm9taXNlcyIsImkiLCJsZW5ndGgiLCJpc0ZpbGUiLCJ3ZWJraXRHZXRBc0VudHJ5IiwicHVzaCIsImFsbCIsImNyZWF0ZVJlYWRlciIsInJlYWRFbnRyaWVzIiwiZW50cmllcyIsImFyciIsImNoaWxkIiwiSFRNTElucHV0RWxlbWVudCIsIm5hdmlnYXRvciIsImFwcFZlcnNpb24iLCJpbmRleE9mIiwidW5kZWZpbmVkIiwiY29udmVydElucHV0cyIsIm5vZGVzIiwicmVjdXJzZSIsInBhdGhQaWVjZXMiLCJzcGxpdCIsImRpck5hbWUiLCJzaGlmdCIsInN1YkRpciIsImpvaW4iLCJub2RlIiwidGFnTmFtZSIsInR5cGUiLCJoYXNBdHRyaWJ1dGUiLCJzZXRBdHRyaWJ1dGUiLCJzaGFkb3ciLCJjcmVhdGVTaGFkb3dSb290IiwiY29uc29sZSIsImxvZyIsImlubmVySFRNTCIsInF1ZXJ5U2VsZWN0b3IiLCJvbmNsaWNrIiwiZSIsInByZXZlbnREZWZhdWx0IiwiY2xpY2siLCJ0b2dnbGVWaWV3IiwiZGVmYXVsdFZpZXciLCJmaWxlc0xlbmd0aCIsInN0eWxlIiwiZGlzcGxheSIsImlubmVyVGV4dCIsImRyYWdnZWRBbmREcm9wcGVkIiwiZ2V0RmlsZXMiLCJmaWxlcyIsIndlYmtpdEVudHJpZXMiLCJzaGFkb3dSb290IiwiY2hhbmdlSGFuZGxlciIsImRpc3BhdGNoRXZlbnQiLCJFdmVudCIsIm9uY2hhbmdlIiwiY2xlYXIiLCJmb3JtIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsInJlbW92ZUNoaWxkIiwiYXBwZW5kQ2hpbGQiLCJyZXNldCIsInNldFRpbWVvdXQiLCJhZGRFdmVudExpc3RlbmVyIiwiaiIsIndlYmtpdFJlbGF0aXZlUGF0aCIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiZXZlbnQiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsIm9ic2VydmVyIiwiTXV0YXRpb25PYnNlcnZlciIsIm11dGF0aW9ucyIsImFkZGVkTm9kZXMiLCJvYnNlcnZlIiwiYm9keSIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJfYWRkRXZlbnRMaXN0ZW5lciIsIkVsZW1lbnQiLCJEYXRhVHJhbnNmZXIiLCJsaXN0ZW5lciIsInVzZUNhcHR1cmUiLCJfbGlzdGVuZXIiLCJkYXRhVHJhbnNmZXIiLCJpdGVtcyIsImFwcGx5IiwiYXJndW1lbnRzIiwiZCIsInJlcXVpcmUiLCJjYWxsYWJsZSIsIkZ1bmN0aW9uIiwiY2FsbCIsImNyZWF0ZSIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiZGVmaW5lUHJvcGVydGllcyIsImhhc093blByb3BlcnR5IiwiZGVzY3JpcHRvciIsImNvbmZpZ3VyYWJsZSIsImVudW1lcmFibGUiLCJ3cml0YWJsZSIsIm9uIiwib25jZSIsIm9mZiIsImVtaXQiLCJtZXRob2RzIiwiZGVzY3JpcHRvcnMiLCJiYXNlIiwiZGF0YSIsInZhbHVlIiwiX19lZV9fIiwic2VsZiIsIl9fZWVPbmNlTGlzdGVuZXJfXyIsImxpc3RlbmVycyIsImNhbmRpZGF0ZSIsInNwbGljZSIsImwiLCJhcmdzIiwiQXJyYXkiLCJzbGljZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJvIiwiYXNzaWduIiwibm9ybWFsaXplT3B0cyIsImlzQ2FsbGFibGUiLCJjb250YWlucyIsImRzY3IiLCJjIiwidyIsIm9wdGlvbnMiLCJkZXNjIiwiZ3MiLCJnZXQiLCJzZXQiLCJvYmoiLCJmb28iLCJiYXIiLCJ0cnp5Iiwia2V5cyIsIm1heCIsIk1hdGgiLCJkZXN0Iiwic3JjIiwiZXJyb3IiLCJrZXkiLCJmb3JFYWNoIiwib2JqZWN0IiwiVHlwZUVycm9yIiwicHJvY2VzcyIsInJlc3VsdCIsIlN0cmluZyIsInN0ciIsInNlYXJjaFN0cmluZyIsImZuIiwiRXZlbnRFbWl0dGVyIiwiVHJhY3RvckJlYW0iLCJzZWxlY3RvciIsImVsIiwiZW1pdHRlciIsInF1ZXVlIiwiYmluZCIsImNoYW5nZSIsImRyYWdIb3ZlciIsImRyb3AiLCJsZW4iLCJwb3N0UGF0aCIsInJlc3VsdHMiLCJnZXRGaWxlc0FuZERpcmVjdG9yaWVzIiwidGhlbiIsIl90aGlzIiwiZmlsZXNBbmREaXJzIiwiaXRlcmF0ZUZpbGVzQW5kRGlycyIsInN0b3BQcm9wYWdhdGlvbiIsImZkIiwic3ViRmlsZXNBbmREaXJzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFLQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsS0FBQyxZQUFXO0FBQUEsTUFHWDtBQUFBO0FBQUEsVUFBSUEsTUFBQSxDQUFPQyxTQUFQLElBQW9CLENBQUUsc0JBQXFCQyxRQUFBLENBQVNDLGFBQVQsQ0FBdUIsT0FBdkIsQ0FBckIsQ0FBMUIsRUFBaUY7QUFBQSxRQUNoRixNQURnRjtBQUFBLE9BSHRFO0FBQUEsTUFPWCxJQUFJQyxhQUFB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