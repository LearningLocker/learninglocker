define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'datepicker'
], function($, _, Backbone, Marionette, Datepicker ) {

  $.fn.datepicker.defaults.format = "yyyy-mm-dd";
  $('.datepicker').datepicker({
      startDate: '-3d'
  });

});