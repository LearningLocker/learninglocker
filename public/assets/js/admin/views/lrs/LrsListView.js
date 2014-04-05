define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'models/lrs/LrsModel',
  'collections/lrs/LrsCollection'

], function($, _, Backbone, Marionette, LrsModel, LrsCollection){

  var LrsListView = Backbone.Marionette.ItemView.extend({

    template:'#lrsTemplate',
    tagName: 'tr',

    initialize: function() {
      this.model.on('destroy', this.unrender, this);
      this.model.on('change', this.render, this);
    },

    events: {
      'click button.delete': 'deleteLrs'
    },

    deleteLrs: function() {
      confirm = confirm('Are you sure?');
      if( confirm == true ){
        this.model.destroy({});
      }
    },

    unrender: function() {
      this.remove();
    }

  });

  return LrsListView;

});