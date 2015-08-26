var TractorBeam = require('./tractor-beam', {});

// Instantiate an instance of TractorBeam
var beam = new TractorBeam('div.tractor-beam');

// Update file list when new files dropped
$files = $('.files')

// Inserts an li into the .files list
function insertFile(file) {
  console.log('inserting ' + file.path);
  var el = document.createElement('li');
  el.setAttribute('beam-path', file.path);
  el.className = 'file';

  var path = document.createElement('span');
  path.className = 'path';
  $(path).text(file.path);

  var add = document.createElement('a');
  add.className = 'add fa fa-plus-circle hidden';
  add.setAttribute('href', '#');

  var skip = document.createElement('a');
  skip.className = 'skip fa fa-minus-circle';
  skip.setAttribute('href', '#');

  // var remove = document.createElement('a');
  // remove.className = 'remove fa fa-times';
  // remove.setAttribute('href', '#');

  var $el = $(el);
  $el.append(path);
  $el.append(add)
  $el.append(skip);
  // $el.append(remove);

  $(add).click(function() {
    var $this = $(this);
    $this.siblings('.path').removeClass('skipped');
    $this.addClass('hidden');
    $this.siblings('.skip').removeClass('hidden');

    beam.add(file.path);
  });

  $(skip).click(function() {
    var $this = $(this);
    $this.siblings('.path').addClass('skipped');
    $this.addClass('hidden');
    $this.siblings('.add').removeClass('hidden');

    beam.skip(file.path);
  });

  // $(remove).click(function() {
  //   $(this).parent().remove();
  //   beam.remove(file.path);
  // });

  $files.append(el);
}

beam.on('dropped', function(files) {
  // Render files
  console.log('dropped', files);
  for (var filepath in files) {
    console.log(filepath);
    insertFile(files[filepath]);
  }
});

// Trigger upload on click
$('.upload-button').click(function() {
  function resetFileEl($file) {
    $file.removeClass();
    $file.addClass('file');
  }

  function getFileEl(file) {
    // filepath
    if (typeof file === 'string') {
      return $('div.file[beam-path=' + file + ']');
    } else {
      // file object
      return $('div.file[beam-path=' + file.path + ']');
    }
  }

  function getFilePath(el) {
    el.getAttribute('beam-path');
  }

  var $progress = $('.progress');
  $progress.removeClass('hidden');

  // Start upload
  beam.upload({});

  // Update file-list as they are uploaded
  beam.on('upload-started', function(file) {
    var $file = getFileEl(file)
    resetFileEl($file);
    $file.addClass('uploading')
  });

  beam.on('upload-completed', function(file) {
    var $file = getFileEl(file);
    resetFileEl($file);
    $file.addClass('uploaded');
  });

  // Show progress in progress bar
  beam.on('progress', function(file) {
    var $file = getFileEl(file);
    resetFileEl($file);

    // Set individual file progress
    $file.select('.file-progress')
      .text(file.progress.toString);

    var totalProgress = beam.progress;
    $progress.width(totalProgress);
  });
});
