//the require library is configuring paths
require.config({
  paths: {
    jquery: '../bower_components/jquery/dist/jquery.min',
    underscore: '../bower_components/underscore/underscore',
    backbone: '../bower_components/backbone/backbone',
    marionette: '../bower_components/backbone.marionette/lib/backbone.marionette.min',
    text: '../bower_components/text/text',
    basicauth: '../bower_components/backbone.basicauth/backbone.basicauth',
    typeahead: '../bower_components/typeahead.js/dist/typeahead.jquery.min',
    bootstrap: '../bower_components/bootstrap/dist/js/bootstrap.min',
    fileSaver: '../bower_components/FileSaver.js/FileSaver.min'
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
      deps: ['jquery'],
      exports: 'Typeahead'
    },
    fileSaver: {
      exports: 'fileSaver'
    }
  },
});

require(['./app'], function (App) {
  App.start()
});