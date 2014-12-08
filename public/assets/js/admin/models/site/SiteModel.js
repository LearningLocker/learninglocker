define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  
  var SiteModel = Backbone.Model.extend({
    urlRoot: window.LL.siteroot + '/site/settings',
    idAttribute: "_id"
  });

  return SiteModel;

});