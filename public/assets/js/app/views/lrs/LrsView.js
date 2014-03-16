define([
  'jquery',
  'underscore',
  'backbone',
  'models/lrs/LrsModel',
  'collections/lrs/LrsCollection',
  'views/lrs/LrsListView',
  'views/noItemsView'
], function($, _, Backbone, LrsModel, LrsColleciton, LrsListView, NoItemsView){

  var LrsView = Backbone.Marionette.CompositeView.extend({ 

    itemView: LrsListView,
    emptyView: NoItemsView,
    itemViewContainer: "tbody",
    tagName: 'table',
    className: 'table table-striped table-responsive',
    //template:'#lrsTemplate',

    render: function(){
      this.collection.each(this.addOne, this);
      return this;
    },

    addOne: function(lrs) {
      var lrsView = new LrsListView({ model: lrs });
      this.$el.append(lrsView.render().el);
    }

  });

  return LrsView;

});