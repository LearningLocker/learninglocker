define([
  'jquery',
  'locker',
  'text!./runLayout.html',
  'morris',
  './Graphs.bundle'
], function(jquery, locker, template, morris) {
  return locker.LayoutView.extend({
    template: template,
    onShow: function () {
      this._modelSuccess(function () {
        var match = this.model.get('aggregate_match');
        window.ReportGraphs(this.$el.find('#graph')[0], {
          endpoint: '../..',
          username: window.lrs.key,
          password: window.lrs.secret,
          match: JSON.stringify(match && match.constructor === Object ? match : {})
        });
      }.bind(this));
    }
  });
});