requirejs.config({
  shim: {
    bootstrap: {
      deps: ['jquery']
    },
    underscore: {
      deps: [],
      exports: '_'
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    marionette: {
      deps: ['backbone'],
      exports: 'Marionette'
    },
    basicauth : {
      deps : ['jquery', 'underscore', 'backbone'],
      exports : 'BasicAuth'
    },
    morris : {
      deps : ['jquery', 'raphael'],
      exports : 'Morris'
    }
  },
  paths: {
    jquery: '../bower_components/jquery/dist/jquery.min',
    bootstrap: '../bower_components/bootstrap/dist/js/bootstrap.min',
    underscore: '../bower_components/underscore/underscore',
    backbone: '../bower_components/backbone/backbone',
    marionette: '../bower_components/backbone.marionette/lib/backbone.marionette.min',
    text: '../bower_components/text/text',
    beagle: '../bower_components/beagle/build/export',
    basicauth: '../bower_components/backbone.basicauth/backbone.basicauth',
    typeahead: '../bower_components/typeahead.js/dist/typeahead.jquery.min',
    raphael: '../bower_components/raphael/raphael-min',
    morris: '../bower_components/morris.js/morris.min'
  },
  packages: [
    {
      name: 'locker',
      location: './libs/locker',
      main: 'export.js'
    }
  ]
});

require(['./app', 'jquery'], function(App) {
  return App.start();
});
