define([
  'jquery',
  'underscore',
  'backbone',
  'marionette'
], function($, _, Backbone, Marionette ) {

  $.fn.datepicker.defaults.format = "yyyy-mm-dd";
  $('.datepicker').datepicker({
      startDate: '-3d'
  });

});