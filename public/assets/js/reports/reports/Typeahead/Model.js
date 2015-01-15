define([
  'backbone'
], function(backbone) {
  return backbone.Model.extend({
    defaults: {
      value: '',
      tip: 'Search for the value here'
    },
    constructor: function (data, options) {
      if (typeof data === 'string') {
        backbone.Model.call(this, {value: decodeURIComponent(data), tip: options.tip}, options);
      } else {
        backbone.Model.call(this, {value: '', tip: options.tip}, options);
      }
    }
  });
});