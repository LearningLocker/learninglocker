define([
  'backbone'
], function(backbone) {
  return backbone.Model.extend({
    defaults: {
      value: '',
      example: 'Bob'
    },
    constructor: function (data, options) {
      if (typeof data === 'string') {
        backbone.Model.call(this, {value: decodeURIComponent(data), example: options.example}, options);
      } else {
        backbone.Model.call(this, {value: '', example: options.example}, options);
      }
    }
  });
});