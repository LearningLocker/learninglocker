define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'typeahead'
], function($,_, Backbone, Marionette, Typeahead){

  var App = new Backbone.Marionette.Application();
  
  App.layouts = {};
  App.collections = {};
  App.views = {};
  App.models = {};

  //a hack to get current LRS @todo find a better way
  path = window.location.pathname.split( '/' );
  for ( i = 0; i < path.length; i++ ) {
    if( path[i] == 'lrs' ){
      //find at which point 'lrs' is as we know the next path item is the id
      var array_num = i;
    }
  }
  array_position = array_num + 1;
  App.lrs_id = path[array_position];

  App.addRegions({
    pageRegion: '#statements'
  });

  App.addInitializer(function (options) {

    //add our csrf token to every ajax request
    $.ajaxPrefilter(function(options, originalOptions, jqXHR){
      var token;
      if( !options.crossDomain ){
        token = $('meta[name="token"]').attr('content');
        if( token ){
          return jqXHR.setRequestHeader('X-CSRF-Token', token);
        }
      }
    });
  
    if (Backbone.history){
      Backbone.history.start();
    }
  });

  return App;

});