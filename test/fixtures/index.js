var beam = new TractorBeam('div.tractor-beam');

// Update file list when new files dropped
var $files = $('.files');

var template = $("#file-template").html();

// Inserts an li into the .files list
function renderFile(file) {
  // render template
  var $el = $(template.replace(/filepath/, file.path));

  // bind event handlers
  var $add  = $el.find('.add'),
      $skip = $el.find('.skip'),
      $path = $el.find('.path');

  $add.click(function() {
    $path.removeClass('skipped');
    $add.addClass('hidden');
    $skip.removeClass('hidden');

    // Mark file for upload
    beam.add(file.path);
  });

  $skip.click(function() {
    $path.addClass('skipped');
    $skip.addClass('hidden');
    $add.removeClass('hidden');

    // Skip file for upload
    beam.skip(file.path);
  });

  $files.append($el);
}

beam.on('dropped', function(files) {
  // Clear previously rendered files
  $files.empty();

  // Render file list
  for (var filepath in files) {
    renderFile(files[filepath]);
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
