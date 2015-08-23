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
    var EventEmitter, TractorBeam, extend = function (child, parent) {
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
        return this.on('upload', function (queue) {
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
          this.emit('upload', this.queue);
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImV2ZW50LWVtaXR0ZXIuY29mZmVlIiwidmVuZG9yL3BvbHlmaWxsLmpzIiwidHJhY3Rvci1iZWFtLmNvZmZlZSJdLCJuYW1lcyI6WyJFdmVudEVtaXR0ZXIiLCJzbGljZSIsIm9wdHMiLCJyZWYiLCJkZWJ1ZyIsIl9saXN0ZW5lcnMiLCJfYWxsTGlzdGVuZXJzIiwicHJvdG90eXBlIiwib24iLCJldmVudCIsImNhbGxiYWNrIiwiYmFzZSIsInB1c2giLCJsZW5ndGgiLCJvZmYiLCJpbmRleCIsImVtaXQiLCJhcmdzIiwiaSIsImoiLCJsZW4iLCJsZW4xIiwibGlzdGVuZXIiLCJsaXN0ZW5lcnMiLCJhcmd1bWVudHMiLCJjYWxsIiwiYXBwbHkiLCJ1bnNoaWZ0IiwiY29uc29sZSIsImxvZyIsIm1vZHVsZSIsImV4cG9ydHMiLCJ3aW5kb3ciLCJEaXJlY3RvcnkiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJkaXJlY3RvcnlBdHRyIiwiZ2V0RmlsZXNNZXRob2QiLCJpc1N1cHBvcnRlZFByb3AiLCJjaG9vc2VEaXJNZXRob2QiLCJzZXBhcmF0b3IiLCJuYW1lIiwicGF0aCIsIl9jaGlsZHJlbiIsIl9pdGVtcyIsInRoYXQiLCJnZXRJdGVtIiwiZW50cnkiLCJpc0RpcmVjdG9yeSIsImRpciIsImZ1bGxQYXRoIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJmaWxlIiwicHJvbWlzZXMiLCJpc0ZpbGUiLCJ3ZWJraXRHZXRBc0VudHJ5IiwiYWxsIiwiY3JlYXRlUmVhZGVyIiwicmVhZEVudHJpZXMiLCJlbnRyaWVzIiwiYXJyIiwiY2hpbGQiLCJIVE1MSW5wdXRFbGVtZW50IiwibmF2aWdhdG9yIiwiYXBwVmVyc2lvbiIsImluZGV4T2YiLCJ1bmRlZmluZWQiLCJjb252ZXJ0SW5wdXRzIiwibm9kZXMiLCJyZWN1cnNlIiwicGF0aFBpZWNlcyIsInNwbGl0IiwiZGlyTmFtZSIsInNoaWZ0Iiwic3ViRGlyIiwiam9pbiIsIm5vZGUiLCJ0YWdOYW1lIiwidHlwZSIsImhhc0F0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsInNoYWRvdyIsImNyZWF0ZVNoYWRvd1Jvb3QiLCJpbm5lckhUTUwiLCJxdWVyeVNlbGVjdG9yIiwib25jbGljayIsImUiLCJwcmV2ZW50RGVmYXVsdCIsImNsaWNrIiwidG9nZ2xlVmlldyIsImRlZmF1bHRWaWV3IiwiZmlsZXNMZW5ndGgiLCJzdHlsZSIsImRpc3BsYXkiLCJpbm5lclRleHQiLCJkcmFnZ2VkQW5kRHJvcHBlZCIsImdldEZpbGVzIiwiZmlsZXMiLCJ3ZWJraXRFbnRyaWVzIiwic2hhZG93Um9vdCIsImNoYW5nZUhhbmRsZXIiLCJkaXNwYXRjaEV2ZW50IiwiRXZlbnQiLCJvbmNoYW5nZSIsImNsZWFyIiwiZm9ybSIsInBhcmVudE5vZGUiLCJpbnNlcnRCZWZvcmUiLCJyZW1vdmVDaGlsZCIsImFwcGVuZENoaWxkIiwicmVzZXQiLCJzZXRUaW1lb3V0IiwiYWRkRXZlbnRMaXN0ZW5lciIsIndlYmtpdFJlbGF0aXZlUGF0aCIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJvYnNlcnZlciIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJtdXRhdGlvbnMiLCJhZGRlZE5vZGVzIiwib2JzZXJ2ZSIsImJvZHkiLCJjaGlsZExpc3QiLCJzdWJ0cmVlIiwiX2FkZEV2ZW50TGlzdGVuZXIiLCJFbGVtZW50IiwiRGF0YVRyYW5zZmVyIiwidXNlQ2FwdHVyZSIsIl9saXN0ZW5lciIsImRhdGFUcmFuc2ZlciIsIml0ZW1zIiwiVHJhY3RvckJlYW0iLCJleHRlbmQiLCJwYXJlbnQiLCJrZXkiLCJoYXNQcm9wIiwiY3RvciIsImNvbnN0cnVjdG9yIiwiX19zdXBlcl9fIiwicmVxdWlyZSIsInN1cGVyQ2xhc3MiLCJzZWxlY3RvciIsIm9wdGlvbnMiLCJlbCIsInF1ZXVlIiwiYmluZCIsIl90aGlzIiwiY2hhbmdlIiwiZHJhZ0hvdmVyIiwiZHJvcCIsInBvc3RQYXRoIiwiZ2V0RmlsZXNBbmREaXJlY3RvcmllcyIsInRoZW4iLCJmaWxlc0FuZERpcnMiLCJpdGVyYXRlRmlsZXNBbmREaXJzIiwic3RvcFByb3BhZ2F0aW9uIiwiZmQiLCJyZXN1bHRzIiwic3ViRmlsZXNBbmREaXJzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxZQUFKLEVBQ0VDLEtBQUEsR0FBUSxHQUFHQSxLQURiLEM7SUFHQUQsWUFBQSxHQUFnQixZQUFXO0FBQUEsTUFDekIsU0FBU0EsWUFBVCxDQUFzQkUsSUFBdEIsRUFBNEI7QUFBQSxRQUMxQixJQUFJQyxHQUFKLENBRDBCO0FBQUEsUUFFMUIsSUFBSUQsSUFBQSxJQUFRLElBQVosRUFBa0I7QUFBQSxVQUNoQkEsSUFBQSxHQUFPLEVBRFM7QUFBQSxTQUZRO0FBQUEsUUFLMUIsS0FBS0UsS0FBTCxHQUFjLENBQUFELEdBQUEsR0FBTUQsSUFBQSxDQUFLRSxLQUFYLENBQUQsSUFBc0IsSUFBdEIsR0FBNkJELEdBQTdCLEdBQW1DLEtBQWhELENBTDBCO0FBQUEsUUFNMUIsS0FBS0UsVUFBTCxHQUFrQixFQUFsQixDQU4wQjtBQUFBLFFBTzFCLEtBQUtDLGFBQUwsR0FBcUIsRUFQSztBQUFBLE9BREg7QUFBQSxNQVd6Qk4sWUFBQSxDQUFhTyxTQUFiLENBQXVCQyxFQUF2QixHQUE0QixVQUFTQyxLQUFULEVBQWdCQyxRQUFoQixFQUEwQjtBQUFBLFFBQ3BELElBQUlDLElBQUosQ0FEb0Q7QUFBQSxRQUVwRCxJQUFJRixLQUFKLEVBQVc7QUFBQSxVQUNULElBQUssQ0FBQUUsSUFBQSxHQUFPLEtBQUtOLFVBQVosQ0FBRCxDQUF5QkksS0FBekIsS0FBbUMsSUFBdkMsRUFBNkM7QUFBQSxZQUMzQ0UsSUFBQSxDQUFLRixLQUFMLElBQWMsRUFENkI7QUFBQSxXQURwQztBQUFBLFVBSVQsS0FBS0osVUFBTCxDQUFnQkksS0FBaEIsRUFBdUJHLElBQXZCLENB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