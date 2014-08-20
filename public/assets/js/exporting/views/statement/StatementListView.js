define([
  'marionette'
], function(Marionette){
  return Marionette.ItemView.extend({
    template:'#statementListView',
    tagName: 'li',
    className: 'list-group-item'
  });
});