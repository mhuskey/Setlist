$("document").ready(function() {
  // Clear text box when page loads
  $("#song-name").val("");
  
  // Reorder list elements by dragging and dropping
  $("ol").sortable().draggable({
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
  $("ol").disableSelection();
  
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
    $("ol").append("<h3 class='break text-center'>* Break *</h3>");
  });
  
  // Add 'Encore' header to list
  $("#encore-button").click(function() {
    $("ol").append("<h3 class='encore text-center'>* Encore *</h3>");
  });
  
  // Clear text box when form gains focus
  $("#song-name").focus(function() {
    $(this).val("");
  });
  
  // Fade out song, and then call `remove()` as callback
  // function, which removes element from the DOM
  $(document).on("dblclick", "li", function() {
    $(this).fadeOut(function() {
      $(this).remove();
    });
  });
  
  // Fade out 'Break' or 'Encore', and then call `remove()`
  // as callback function, which removes element from the DOM
  $(document).on("dblclick", "h3", function() {
    $(this).fadeOut(function() {
      $(this).remove();
    });
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
});

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
