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
  
  // Save songs to local storage
  $("#save-button").click(function() {
    var songsArray = [];
    
    var lengthOfSongs = $(".songs > *").length;
    for (var i = 0; i < lengthOfSongs; i++) {
      // Add each song to the array
      songsArray += $($("ol > *")[i]).text();
      // Add a comma to the end of each song
      songsArray += ",";
    }
    // Remove last comma from the last song
    songsArray = songsArray.slice(0, -1);
    // Save data
    localStorage["songsArray"] = JSON.stringify(songsArray);
  });
  
  // Load songs from local storage
  $("#load-button").click(function() {
    // Check if songsArray exists in local storage
    var localData = localStorage.getItem("songsArray");
    // If it exists then parse, otherwise it is an empty array
    var storedSongs = localData ? JSON.parse(localData) : [];
    
    // Check if storedSongs is empty before using it
    if (storedSongs.length !== 0) {
      // Remove any songs in the list
      $(".songs > *").remove();
      
      // Convert storedSongs to an array and remove commas
      var storedArraySongs = storedSongs.split(",");
      
      var lengthOfSongs = $(".songs > *").length;
      appendSongsToList(storedArraySongs);
    } else {
      // Show warning that no songs are saved
      noSavedSongs();
    }
  });
  
  // Add song to list after clicking button
  $("#song-button").click(function() {
    // Reject empty string
    if ($("#song-name").val() === "") {
      noSongName();
    } else {
      addSong();
    }
  });
  
  // Add song when 'return' is pressed
  $("#song-name").keypress(function(e) {
    if (e.which === 13) {
      // Reject empty string
      if ($("#song-name").val() === "") {
        noSongName();
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
  $("#print-button").click(function () {
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
    appendSongsToList(urlSongs);
  }
}

// Add song function
function addSong() {
  var songName = $("#song-name").val();
  $("ol").append("<li class='text-center'>" + songName + "</li>");
  // Clear text box after song is added
  $("#song-name").val("");
}

// Empty song name warning
function noSongName() {
  // Run the effect
  $("#no-song-name").show(500, callback("#no-song-name"));
};

// No saved songs found warning
function noSavedSongs() {
  // Run the effect
  $("#no-saved-songs").show(500, callback("#no-saved-songs"));
}

// Fadeout message and make its <div> hidden
function callback(id) {
  setTimeout(function() {
    $(id).fadeOut(500, function() {
      $(id + ":visible").removeAttr("style");
    });
  }, 2000);
};

function appendSongsToList(arr) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === "*Break*") {
      // Loop over array and append each item to the list of songs
      $("ol").append("<h3 class='break text-center'>" + arr[i] + "</h3>");
    } else if (arr[i] === "*Encore*") {
      $("ol").append("<h3 class='encore text-center'>" + arr[i] + "</h3>");
    } else {
      $("ol").append("<li class='text-center'>" + arr[i] + "</li>");
    }
  }
}
