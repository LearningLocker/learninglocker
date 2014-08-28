//the require library is configuring paths
require.config({
  paths: {
    jquery: '../libs/jquery/jquery.1.10.2',
    underscore: '../libs/lodash/lodash',
    backbone: '../libs/backbone/backbone.min',
    marionette: '//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.0.2/backbone.marionette.min',
    text: '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min',
    'backbone.wreqr': '../libs/backbone/backbone.wreqr',
    'backbone.babysitter' : '../libs/backbone/backbone.babysitter',
    'bootstrap': '../libs/bootstrap/bootstrap.min',
    'typeahead': '../libs/typeahead/typeahead.min',
    'basicauth': '../libs/backbone/backbone.basicauth'
  },
  shim : {
    jquery : {
      exports : 'jquery'
    },
    underscore : {
      exports : '_'
    },
    backbone : {
      deps : ['jquery', 'underscore'],
      exports : 'Backbone'
    },
    marionette : {
      deps : ['jquery', 'underscore', 'backbone'],
      exports : 'Marionette'
    },
    basicauth : {
      deps : ['jquery', 'underscore', 'backbone'],
      exports : 'BasicAuth'
    },
    bootstrap: {
      deps: ['jquery'],
      exports: 'Bootstrap'
    },
    typeahead: {
      deps: ["jquery"],
      exports: "Typeahead"
    }
  },
});

require(['./app'], function (App) {
  App.start()
});