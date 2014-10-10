define([
  'jquery',
  'backbone',
  './fields/collection',
  'basicauth'
], function ($, Backbone, FieldsCollection) {
  return Backbone.Model.extend({
    idAttribute: "_id",
    defaults: {
    	lrs: null,
    	report: null,
    	name: trans('exporting.new.name'),
    	description: trans('exporting.new.description')
    },
    credentials: {
      username: window.lrs.key,
      password: window.lrs.secret
    },

    initialize: function () {
      if (!this.setFields) {
        this.setFields = true;
        this.set({'fields': new FieldsCollection([{
          from: 'statement.id',
          to: 'id'
        }])});
      }
      window.fields = this.get('fields');
    },

    downloadJSON: function () {
      return $.ajax({
        url: this.url() + '/show',
        headers: Backbone.BasicAuth.getHeader({
          username: this.credentials.username,
          password: this.credentials.password
        })
      })
    },

    downloadCSV: function () {
      return $.ajax({
        url: this.url() + '/show/csv',
        headers: Backbone.BasicAuth.getHeader({
          username: this.credentials.username,
          password: this.credentials.password
        })
      })
    },

    parse: function (response) {
      if (!this.setFields) {
        this.setFields = true;
        response.fields = new FieldsCollection(response.fields);
      } else {
        response.fields = this.get('fields');
      }
      return response;
    },

    validate: function (attrs, opts) {
      if (attrs.report == null) {
        return trans('exporting.errors.noReport');
      }
      if (attrs.fields && attrs.fields.length < 1) {
        return trans('exporting.errors.noFields');
      }
    }
  });
});