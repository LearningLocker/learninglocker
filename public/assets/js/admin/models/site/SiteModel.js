define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  
  var SiteModel = Backbone.Model.extend({
    urlRoot: 'site/settings',
    idAttribute: "_id"
  });

  return SiteModel;

});