define([
  'locker',
  'text!./runLayout.html',
  './statements/collection',
  './statements/composite'
], function(locker, template, StatementsCollection, StatementsComposite) {
  return locker.LayoutView.extend({
    template: template,
    regions: {
      graph: '#graph',
      list: '#list'
    },
    onRender: function () {
      // Gets the statements returned from running the report.
      var statements = new StatementsCollection();
      statements.url = this.model.url() + '/' + statements.nestedUrl;

      this.list.show(new StatementsComposite({
        collection: statements
      }));
      statements.fetch().success(function () {
        
      });
    }
  });
});