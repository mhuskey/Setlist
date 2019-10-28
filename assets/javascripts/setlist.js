$("document").ready(function() {
  importSongs();
  
  // Clear text box when page loads
  $("#song-name").val("");
  
  // Reorder list elements by dragging and dropping
  $(".songs").sortable().draggable({
    // Return the 'ol' to their starting position
    revert: true
  });
  $("#droppable").droppable({
    // Only delete 'li' elements
    accept: "li, h3",
    // Dropping 50% or more of element will delete
    tolerance: "intersect",
    drop: function(event,ui) {
      // Delete 'li' element
      ui.draggable.remove();
    }
  });
  $(".songs").disableSelection();
  
  // Add song to list after clicking button
  $("#song-button").click(function() {
    // Reject empty string
    if ($("#song-name").val() === "") {
      showWarning();
    } else {
      addSong();
    }
  });
  
  // Add song when 'return' is pressed
  $("#song-name").keypress(function(e) {
    if (e.which === 13) {
      // Reject empty string
      if ($("#song-name").val() === "") {
        showWarning();
        return false;
      } else {
        addSong();
        // Remove focus from text box
        $("#song-name").blur();
        return false;
      }
    }
  });
  
  // Add 'Break' header to list
  $("#break-button").click(function() {
    $("ol").append("<h3 class='break text-center'>*Break*</h3>");
  });
  
  // Add 'Encore' header to list
  $("#encore-button").click(function() {
    $("ol").append("<h3 class='encore text-center'>*Encore*</h3>");
  });
  
  // Print list of songs
  $("#print-button").on("click", function () {
    var songList = $(".setlist").html();
    var printWindow = window.open('', "Setlist",
    "menubar=no");
    printWindow.document.write('<html><head><title>Print Setlist</title>');
    printWindow.document.write('<link rel="stylesheet" type="text/css" href="assets/stylesheets/print-setlist.css">')
    printWindow.document.write('</head><body>');
    printWindow.document.write(songList);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
  });
  
  // Open export modal with URL to export song list
  $("#export-button").click(function() {
    // Regex for removing any songs in the URL
    var urlRegex = /\?.*/g;
    // Get the base URL and begin formatting for export
    var exportURL = window.location.href;
    // Reset the URL to base URL without any songs
    exportURL = exportURL.replace(urlRegex, "");
    // Get the number of songs, if any
    var lengthOfSongs = $(".songs > *").length;
    // Build up URL if songs exist
    if (lengthOfSongs !== 0) {
      exportURL += "?";
      for (var i = 0; i < lengthOfSongs; i++) {
        var originalSongName = $($("ol > *")[i]).text();
        // Replace all spaces with plus symbols
        originalSongName = originalSongName.replace(/\s{1,}/g,'+');
        // Add each song to the end of the URL with a comma
        exportURL += originalSongName + ",";
      }
      // Remove last comma
      exportURL = exportURL.slice(0, -1);
      // Add closing backslash
      exportURL += "/";
    }
    // Populate modal with URL
    $("#export-url").text(exportURL);
    // Show modal to user
    $('#exportSongsModal').modal();
  });
  
  // Copy link to user's clipboard
  $("#copy-button").click(function() {
    // Get export URL
    var linkToCopy = $("#export-url").text();
    // Cannot select text from read-only element,
    // so <textarea> is created with the export URL
    var hiddenInput = $("<textarea>" + linkToCopy + "</textarea>");
    // Add the <textarea> to the modal
    $("#exportSongsModalBody").append(hiddenInput);
    // Select the export URL
    hiddenInput.select();
    // Copy the export URL to the user's clipboard
    document.execCommand("copy");
    // Remove <textarea> from the DOM
    hiddenInput.remove();
  });
  
  // Enable Bootstrap's popover
  $(function () {
    $('[data-toggle="popover"]').popover();
  });
  
  // Open performance modal
  $("#performance-button").click(function() {
    // Reset performance song list
    $("#performanceSongList").empty();
    // Get list of songs from .songs
    var songList = $(".songs").html();
    // Add songs to performance song list
    $("#performanceSongList").append(songList);
  });
  
  // Clear text box when form gains focus
  $("#song-name").focus(function() {
    $(this).val("");
  });
  
  // Fade out song in .songs, and then call `remove()` as callback
  // function, which removes element from the DOM
  $(document).on("dblclick", ".songs li", function() {
    $(this).fadeOut(function() {
      $(this).remove();
    });
  });
  
  // Fade out 'Break' or 'Encore' in .songs, and then call `remove()`
  // as callback function, which removes element from the DOM
  $(document).on("dblclick", ".songs h3", function() {
    $(this).fadeOut(function() {
      $(this).remove();
    });
  });
});

// Receive URL and import songs
function importSongs() {
  // Get URL and parse for songs between braces
  var url = window.location.href;
  // Regex to return songs from url
  var urlRegex = /html\?(.*?)\//;
  
  if (urlRegex.exec(url) !== null) {
    var urlString = urlRegex.exec(url)[1];
  } else {
    var urlString = null;
  }
  
  // If songs to import exist
  if (urlString !== null) {
    // Convert "+" to spaces
    urlString = urlString.replace(/\+/g," ");
    // Convert "%20" to spaces
    urlString = urlString.replace(/%20/g," ");
    // Convert "%27" to apostrophe
    urlString = urlString.replace(/%27/g,"'");
    // Convert "%22" to quotation marks
    urlString = urlString.replace(/%22/g,"\"");
    // Convert formatted songs to an array and remove commas
    var urlSongs = urlString.split(",");
    for (var i = 0; i < urlSongs.length; i++) {
      // Loop over array and append each item to the list of songs
      if (urlSongs[i] === "*Break*") {
        $("ol").append("<h3 class='break text-center'>" + urlSongs[i] + "</h3>");
      } else if (urlSongs[i] === "*Encore*") {
        $("ol").append("<h3 class='encore text-center'>" + urlSongs[i] + "</h3>");
      } else {
        $("ol").append("<li class='text-center'>" + urlSongs[i] + "</li>");
      }
    }
  }
}

// Add song function
function addSong() {
  var songName = $("#song-name").val();
  $("ol").append("<li class='text-center'>" + songName + "</li>");
  // Clear text box after song is added
  $("#song-name").val("");
}

// Highlight effect function
function showWarning() {
  // Run the effect
  $("#warning").show(500, callback);
};

// Fadeout message and make its <div> hidden
function callback() {
  setTimeout(function() {
    $("#warning").fadeOut(500, function() {
      $("#warning:visible").removeAttr("style");
    });
  }, 2000);
};
