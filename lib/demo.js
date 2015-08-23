function toggleDisplay(id) {
	var el = document.getElementById(id);
	el.style.display = el.style.display === 'block' ? 'none' : 'block';
	return false;
}

document.addEventListener('DOMContentLoaded', function(event) {
	function clearCons() {
		var cons = document.getElementById('console');
		if ('directory' in document.getElementById('fileInput')) {
			cons.innerHTML = 'Use one of the above methods to show files here...';
		} else {
			cons.innerHTML = 'Directory upload is not supported. If using the polyfill, it is only supported in Chrome 25+.';
		}
	}
	clearCons();
	function printToScreen() {
		var cons = document.getElementById('console');
		cons.innerHTML += '<br>';
		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			cons.innerHTML += '<br>';
			if (arg.constructor === File) {
				arg = 'file name: ' + arg.name + '; type: ' + arg.type;
			}
			cons.innerHTML += arg;
		}
	}
	/** File Input **/
	document.getElementById('fileInput').addEventListener('change', function() {
		clearCons();
		var uploadFile = function(file, path) {
			printToScreen(path, file);
			// handle file uploading
		};
		var iterateFilesAndDirs = function(filesAndDirs, path) {
			for (var i = 0; i < filesAndDirs.length; i++) {
				if (typeof filesAndDirs[i].getFilesAndDirectories === 'function') {
					var path = filesAndDirs[i].path;
					// this recursion enables deep traversal of directories
					filesAndDirs[i].getFilesAndDirectories().then(function(subFilesAndDirs) {
						// iterate through files and directories in sub-directory
						iterateFilesAndDirs(subFilesAndDirs, path);
					});
				} else {
					uploadFile(filesAndDirs[i], path);
				}
			}
		};
		// begin by traversing the chosen files and directories
		if ('getFilesAndDirectories' in this) {
			this.getFilesAndDirectories().then(function(filesAndDirs) {
				iterateFilesAndDirs(filesAndDirs, '/');
			});
		}
	});
	/** Drag and Drop **/
	function dragHover(e) {
		e.stopPropagation();
		e.preventDefault();
		if (e.type === 'dragover') {
			e.target.className = 'over';
		} else {
			e.target.className = '';
		}
	}
	document.getElementById('dropDiv').addEventListener('dragover', dragHover);
	document.getElementById('dropDiv').addEventListener('dragleave', dragHover);
	document.getElementById('dropDiv').addEventListener('drop', function (e) {
		e.stopPropagation();
		e.preventDefault();
		clearCons();
		e.target.className = '';
		var uploadFile = function(file, path) {
			printToScreen(path, file);
			// handle file uploading
		};
		var iterateFilesAndDirs = function(filesAndDirs, path) {
			for (var i = 0; i < filesAndDirs.length; i++) {
				if (typeof filesAndDirs[i].getFilesAndDirectories === 'function') {
					var path = filesAndDirs[i].path;
					// this recursion enables deep traversal of directories
					filesAndDirs[i].getFilesAndDirectories().then(function(subFilesAndDirs) {
						// iterate through files and directories in sub-directory
						iterateFilesAndDirs(subFilesAndDirs, path);
					});
				} else {
					uploadFile(filesAndDirs[i], path);
				}
			}
		};
		// begin by traversing the chosen files and directories
		if ('getFilesAndDirectories' in e.dataTransfer) {
			e.dataTransfer.getFilesAndDirectories().then(function(filesAndDirs) {
				iterateFilesAndDirs(filesAndDirs, '/');
			});
		}
	});
});
