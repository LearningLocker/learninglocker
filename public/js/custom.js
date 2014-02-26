$(document).ready(function() {

  $('.verb-status').tooltip();

  //placeholder for IE
  $('input, textarea').placeholder();

  $('.edit-role').on('click', function(e) {
    e.preventDefault();
    $(this).siblings('.edit-role-form').toggle();
  });

});