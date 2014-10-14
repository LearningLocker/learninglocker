define([
  'backbone'
], function(backbone) {
  return backbone.Model.extend({
    initialize: function (data, opts) {
      if (typeof data === 'string') {
        this.set({value: decodeURIComponent(data)});
      }
    }
  });
});