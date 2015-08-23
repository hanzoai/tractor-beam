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
  // source: /Users/zk/work/crowdstart/tractor-beam/src/tractor-beam.coffee
  require.define('./tractor-beam', function (module, exports, __dirname, __filename) {
    var EventEmitter, TractorBeam;
    require('../lib/polyfill.js');
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
        var self;
        if (this.getFilesAndDirectories == null) {
          return
        }
        this.queue = [];
        self = this;
        this.getFilesAndDirectories().then(function (_this) {
          return function (filesAndDirs) {
            self.iterateFilesAndDirs(filesAndDirs, '/')
          }
        }(this))
      };
      TractorBeam.prototype.dragHover = function (e) {
        e.stopPropagation();
        e.preventDefault()
      };
      TractorBeam.prototype.drop = function (e) {
        var self;
        e.stopPropagation();
        e.preventDefault();
        if (e.dataTransfer.getFilesAndDirectories == null) {
          return
        }
        self = this;
        return e.dataTransfer.getFilesAndDirectories().then(function (_this) {
          return function (filesAndDirs) {
            console.log(filesAndDirs);
            return self.iterateFilesAndDirs(filesAndDirs, '/')
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
  require('./tractor-beam')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYWN0b3ItYmVhbS5jb2ZmZWUiXSwibmFtZXMiOlsiRXZlbnRFbWl0dGVyIiwiVHJhY3RvckJlYW0iLCJyZXF1aXJlIiwic2VsZWN0b3IiLCJvcHRpb25zIiwiYmFzZSIsInR5cGUiLCJlbCIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImVtaXR0ZXIiLCJxdWV1ZSIsImJpbmQiLCJhZGRFdmVudExpc3RlbmVyIiwiY2hhbmdlIiwiZHJhZ0hvdmVyIiwiZHJvcCIsIm9uIiwiZmlsZSIsImkiLCJsZW4iLCJwb3N0UGF0aCIsInJlc3VsdHMiLCJsZW5ndGgiLCJjb25zb2xlIiwibG9nIiwic2VsZiIsImdldEZpbGVzQW5kRGlyZWN0b3JpZXMiLCJ0aGVuIiwiX3RoaXMiLCJmaWxlc0FuZERpcnMiLCJpdGVyYXRlRmlsZXNBbmREaXJzIiwiZSIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiZGF0YVRyYW5zZmVyIiwicGF0aCIsImZkIiwiZW1pdCIsInN1YkZpbGVzQW5kRGlycyIsInB1c2giLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFBQSxZQUFBLEVBQUFDLFdBQUEsQztJQUFBQyxPQUFBLENBQVEsb0JBQVIsRTtJQUVBRixZQUFBLEdBQWVFLE9BQUEsQ0FBUSxlQUFSLENBQWYsQztJQUVNRCxXO01BS1MsU0FBQUEsV0FBQSxDQUFDRSxRQUFELEVBQVlDLE9BQVo7QUFBQSxRQUNYLElBQUFDLElBQUEsQ0FEVztBQUFBLFFBQUMsS0FBQ0YsUUFBRCxHQUFBQSxRQUFBLENBQUQ7QUFBQSxRQUFZLEtBQUNDLE9BQUQsR0FBQ0EsT0FBQSxXQUFEQSxPQUFDLEdBQVUsRUFBWCxDQUFaO0FBQUEsUTtlQUNGRSxJLEdBQVEsVztTQUROO0FBQUEsUUFJWCxLQUFDQyxFQUFELEdBQU1DLFFBQUEsQ0FBU0MsYUFBVCxD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