define([
  'underscore',
  'backbone',
  'app',
  '../../../admin/models/site/GraphModel'
], function(_, Backbone, App, GraphModel ) {


  var LrsGraphModel = GraphModel.extend({
    urlRoot: function(){
      return window.LL.siteroot + '/lrs/' + App.lrs_id + '/graphdata';
    }
  });

  return LrsGraphModel;

});