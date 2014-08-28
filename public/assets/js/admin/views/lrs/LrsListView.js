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
      if (confirm(trans('site.sure'))) {
        this.model.destroy({});
      }
    },

    unrender: function() {
      this.remove();
    }

  });

  return LrsListView;

});
