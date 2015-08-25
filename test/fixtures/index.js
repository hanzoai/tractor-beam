var TractorBeam = require('./tractor-beam', {});

// Instantiate an instance of TractorBeam
var beam = new TractorBeam('div.tractor-beam');

// Update file list when new files dropped
$files = $('.files')

// Inserts an li into the .files list
function insertFile(file) {
  var ele = document.createElement('li');
  ele.setAttribute('beam-path', file.path);
  ele.className = 'file';

  var path = document.createElement('span');
  path.className = 'path';
  $(path).text(file.path);

  var add = document.createElement('a');
  path.className = 'add fa fa-plus-circle hidden';
  path.setAttribute('href', '#');

  var remove = document.createElement('a');
  remove.className = 'remove fa fa-minus-circle';
  remove.setAttribute('href', '#');

  var $ele = $(ele);
  $ele.append(path);
  $ele.append(add)
  $ele.append(remove);

  $(add).click(function() {
    var $this = $(this);
    var $parent = $this.parent();
    $parent.select('.path').removeClass('removed');
    $parent.select('.add').addClass('hidden');
    $this.addClass('hidden');

    beam.add($parent.attr('beam-path'));
  });

  $(remove).click(function() {
    var $this = $(this);
    var $parent = $this.parent();
    $parent.select('.path').addClass('removed');
    $parent.select('.add').removeClass('hidden');
    $this.addClass('hidden');

    beam.remove($parent.attr('beam-path'));
  });

  $files.append(ele);
}

beam.on('dropped', function(files) {
  // Render files
  console.log('completed');
  files.forEach(insertFile);
});

// Trigger upload on click
$('.upload-button').click(function() {
  function resetFileEle($file) {
    $file.removeClass();
    $file.addClass('file');
  }

  function getFileEle(file) {
    // filepath
    if (typeof file === 'string') {
      return $('div.file[beam-path=' + file + ']');
    } else {
      // file object
      return $('div.file[beam-path=' + file.path + ']');
    }
  }

  function getFilePath(ele) {
    ele.getAttribute('beam-path');
  }

  var $progress = $('.progress');
  $progress.removeClass('hidden');

  // Start upload
  beam.upload({});

  // Update file-list as they are uploaded
  beam.on('upload-started', function(file) {
    var $file = getFileEle(file)
    resetFileEle($file);
    $file.addClass('uploading')
  });

  beam.on('upload-completed', function(file) {
    var $file = getFileEle(file);
    resetFileEle($file);
    $file.addClass('uploaded');
  });

  // Show progress in progress bar
  beam.on('progress', function(file) {
    var $file = getFileEle(file);
    resetFileEle($file);

    // Set individual file progress
    $file.select('.file-progress')
      .text(file.progress.toString);

    var totalProgress = beam.progress;
    $progress.width(totalProgress);
  });
});
