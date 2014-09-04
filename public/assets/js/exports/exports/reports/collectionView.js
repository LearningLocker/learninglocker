define([
  'underscore',
  'marionette',
  './modelView',
  'text!./collectionTemplate.html'
], function (_, Marionette, ModelView, template) {
  return Marionette.CompositeView.extend({
    selected: null,
    childView: ModelView,
    childViewContainer: '#reports',
    template: _.template(template),
    events: {
      'change @ui.reports': 'change'
    },
    ui: {
      reports: '#reports'
    },

    initialize: function (options) {
      options.selected = options.selected || 0;
      this.selected = this.collection.at(options.selected);
    },

    onRender: function () {
      this.ui.reports[0].selectedIndex = this.options.selected;
    },

    change: function (event) {
      this.selected = this.collection.at(event.currentTarget.selectedIndex);
    }
  });
});