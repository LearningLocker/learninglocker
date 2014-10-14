requirejs.config({
  shim: {
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
    }
  },
  paths: {
    jquery: '//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min',
    underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min',
    backbone: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
    marionette: '//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.0.2/backbone.marionette.min',
    text: '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min',
    beagle: '//cdn.rawgit.com/ht2/beagle/1.0.3/build/export',
    basicauth: '//cdn.rawgit.com/fiznool/backbone.basicauth/master/backbone.basicauth',
    typeahead: '//cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.10.4/typeahead.bundle.min'
  },
  packages: [
    {
      name: 'locker',
      location: './libs/Locker',
      main: 'export.js'
    }
  ]
});

require(['./app'], function(App) {
  return App.start();
});