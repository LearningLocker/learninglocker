define([
  'marionette',
  './model',
  './collectionView',
  './collection',
  './layoutView',
  './reports/collectionView',
  './reports/collection',
  './fields/collectionView',
  './exportView'
], function (Marionette, Model, CollectionView, Collection, LayoutView, ReportsView, ReportsCollection, FieldsView, ExportView) {
  return Marionette.Controller.extend({
    exports: new Collection(),
    reports: new ReportsCollection(),

    // Configuration.
    initialize: function (options) {
      this.app = options.app;
      this.options = options;

      this.exports.fetch({async:false});
      this.reports.fetch({async:false});
    },

    // Router methods.
    list: function () {
      this.app.content.show(new CollectionView({
        collection: this.exports,
        app: this.app
      }));
    },

    item: function (exportId) {
      var reportsView;
      var layout = new LayoutView({});
      var exp = this.exports.get({id: exportId});

      this.app.content.show(layout);

      // Reports.
      layout.report.show(reportsView = new ReportsView({
        collection: this.reports,
        selected: this.reports.indexOf(this.reports.get(exp.get('report')))
      }));

      // Fields.
      layout.fields.show(new FieldsView({
        collection: exp.get('fields')
      }));

      // Buttons.
      layout.exportInfo.show(new ExportView({
        model: exp,
        reports: reportsView
      }));
    },

    new: function () {
      this.exports.create({
        report: this.reports.at(0).id,
        lrs: this.app.lrs_id
      }, {wait: true, error: function (a, b, err) {
        alert(err.xhr.responseJSON.message);
      }});
    }
  });
});