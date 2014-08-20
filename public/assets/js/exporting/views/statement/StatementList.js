define([
  'marionette',
  'views/statement/StatementListView'
], function(Marionette, StatementListView){
  return Marionette.CompositeView.extend({
    tagName: "ul",
    className: 'list-group',
    template: "#statementList",
    itemView: StatementListView
  });
});