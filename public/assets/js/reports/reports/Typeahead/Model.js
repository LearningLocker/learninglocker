define([
  'backbone'
], function(backbone) {
  return backbone.Model.extend({
    defaults: {
      value: ''
    },
    constructor: function (data, options) {
      if (typeof data === 'string') {
        backbone.Model.call(this, {value: decodeURIComponent(data)}, options);
      } else {
        backbone.Model.call(this, {value: ''}, options);
      }
    }
  });
});