define([
  'underscore',
  'marionette',
  'text!./modelTemplate.html'
], function (_, Marionette, template) {
  return Marionette.ItemView.extend({
    template: _.template(template),
    tagName:'tr',
    events: {
      'click #delete': 'delete'
    },

    delete: function () {
      if (confirm(trans('site.sure'))) {
        this.model.destroy();
      }
    }
  });
});