define([
  'underscore',
  'marionette',
  'text!./modelTemplate.html'
], function (_, Marionette, template) {
  return Marionette.ItemView.extend({
    template: _.template(template),
    tagName: 'li',
    events: {
      'click #delete': 'delete',
      'change #from': 'changeFrom',
      'change #to': 'changeTo'
    },

    changeFrom: function (e) {
      this.model.set({from: e.currentTarget.value});
    },

    changeTo: function (e) {
      this.model.set({to: e.currentTarget.value});
    },

    delete: function () {
      this.model.destroy();
    }
  });
});