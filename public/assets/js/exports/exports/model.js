define([
  'backbone',
  './fields/collection',
  'basicauth'
], function (Backbone, FieldsCollection) {
  return Backbone.Model.extend({
    idAttribute: "_id",
    defaults: {
    	lrs: null,
    	report: null,
    	fields: new FieldsCollection(),
    	name: '',
    	description: ''
    },
    credentials: {
      username: window.lrs.key,
      password: window.lrs.secret
    },

    runJSON: function () {
      return $.ajax({
        url: this.url() + '/show',
        headers: Backbone.BasicAuth.getHeader({
          username: this.credentials.username,
          password: this.credentials.password
        })
      });
    },

    runCSV: function () {
      return $.ajax({
        url: this.url() + '/show/csv',
        headers: Backbone.BasicAuth.getHeader({
          username: this.credentials.username,
          password: this.credentials.password
        })
      });
    },

    parse: function (response) {
      response.fields = new FieldsCollection(response.fields);
      return response;
    },

    validate: function (attrs, opts) {
      if (attrs.report == null) {
        return 'Must have a report';
      }
    }
  });
});