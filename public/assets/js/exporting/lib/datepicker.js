define([
  'jquery',
  'datepicker'
], function($, Datepicker ) {
  $.fn.datepicker.defaults.format = 'yyyy-mm-dd';
  $('.datepicker').datepicker({
      startDate: '-3d'
  });
});