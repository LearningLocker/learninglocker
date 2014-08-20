//the require library is configuring paths
require.config({
  baseUrl:"../../../assets/js/reporting",
  paths: {
    jquery: "../libs/jquery/jquery.1.10.2",
    underscore: "../libs/lodash/lodash",
    backbone: "../libs/backbone/backbone.min",
    marionette: "../libs/backbone/backbone.marionette",
    'backbone.wreqr': '../libs/backbone/backbone.wreqr',
    'backbone.babysitter' : '../libs/backbone/backbone.babysitter',
    'bootstrap': '../libs/bootstrap/bootstrap.min',
    'datepicker': '../libs/bootstrap/bootstrap-datepicker',
    'raphael': '../libs/morrisjs/raphael.min',
    'morris': '../libs/morrisjs/morris.min',
    'typeahead': '../libs/typeahead/typeahead.min',
    'reporting': 'lib/reporting',
    'datepicker_custom': 'lib/datepicker'
  },
  shim : {
    jquery : {
      exports : 'jquery'
    },
    morris : {
      deps : ['jquery', 'raphael'],
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
    typeahead: {
      deps: ["jquery", "bootstrap"],
      exports: "Typeahead"
    },
    datepicker: {
      deps: ["jquery", "bootstrap"],
      exports: "Datepicker"
    },
    reporting: {
      deps: ["jquery", "typeahead"],
      exports: "Reporting"
    }
  },
});

require(["init/app"], function(){});