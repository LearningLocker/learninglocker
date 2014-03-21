define([
  'underscore',
  'backbone',
  'app'
], function(_, Backbone, App) {
  
  var TimelineModel = Backbone.Model.extend({

    //urlRoot: '../lrs/' + App.lrs_id + '/stats',
    urlRoot: function(){
      return '../lrs/' + App.lrs_id + '/stats';
    },
    idAttribute: "_id"
  });

  return TimelineModel;

});