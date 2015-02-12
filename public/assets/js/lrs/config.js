//the require library is configuring paths
require.config({
  baseUrl:"../assets/js/lrs",
  paths: {
    jquery: "../libs/jquery/jquery.1.10.2",
    underscore: "../libs/lodash/lodash",
    backbone: "../libs/backbone/backbone.min",
    marionette: "../libs/backbone/backbone.marionette",
    'backbone.wreqr': '../libs/backbone/backbone.wreqr',
    'backbone.babysitter' : '../libs/backbone/backbone.babysitter',
    bootstrap: '../libs/bootstrap/bootstrap.min',
    raphael: '../libs/morrisjs/raphael.min',
    morris: '../libs/morrisjs/morris.min',
    admin : '../admin',
    basicauth: '../bower_components/backbone.basicauth/backbone.basicauth'
  },
  shim : {
    jquery : {
      exports : 'jQuery'
    },
    morris : {
      deps : ['jquery','raphael'],
      exports : 'Morris'
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
      deps: ["jquery"],
      exports: "Bootstrap"
    },
    basicauth : {
      deps : ['jquery', 'underscore', 'backbone'],
      exports : 'BasicAuth'
    }
  },
});

require(["init/app"], function(){});