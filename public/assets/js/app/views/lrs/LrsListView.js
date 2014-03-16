define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'models/lrs/LrsModel',
  'collections/lrs/LrsCollection'

], function($, _, Backbone, Marionette, LrsModel, LrsCollection){

  var LrsListView = Backbone.Marionette.ItemView.extend({

    tagName: 'tr',

    initialize: function() {
      this.model.on('destroy', this.unrender, this);
      this.model.on('change', this.render, this);
    },

    events: {
      'click a.delete': 'deleteLrs'
    },

    deleteLrs: function() {
      this.model.destroy({
        success:function () {
          //prompt('LRS deleted successfully');
        }
      });
     // return false;
    },

    render: function() {
      var compiledTemplate = _.template( $( "#lrsTemplate" ).html(), this.model.toJSON() );
      this.$el.html( compiledTemplate );
      return this;
    },

    unrender: function() {
      this.remove();
    }

  });

  return LrsListView;

});