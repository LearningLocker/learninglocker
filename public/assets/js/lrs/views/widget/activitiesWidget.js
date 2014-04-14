define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'app'
], function($, _, Backbone, Marionette, App){

  var ActivitiesWidgetView = Backbone.Marionette.ItemView.extend({

    template:'#activitiesWidget',

  });

  return ActivitiesWidgetView;

});