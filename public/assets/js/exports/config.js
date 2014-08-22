//the require library is configuring paths
require.config({
  paths: {
    jquery: '../libs/jquery/jquery.1.10.2',
    underscore: '../libs/lodash/lodash',
    backbone: '../libs/backbone/backbone.min',
    marionette: '../libs/backbone/backbone.marionette',
    text: '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min',
    'backbone.wreqr': '../libs/backbone/backbone.wreqr',
    'backbone.babysitter' : '../libs/backbone/backbone.babysitter',
    'bootstrap': '../libs/bootstrap/bootstrap.min'
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
    bootstrap: {
      deps: ['jquery'],
      exports: 'Bootstrap'
    }
  },
});

require(['./app'], function (App) {
  App.start()
});