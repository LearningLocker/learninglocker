define([
  'jquery',
  'underscore',
  'marionette',
  'text!./exportTemplate.html',
  'fileSaver'
], function ($, _, Marionette, template) {
  return Marionette.ItemView.extend({
    template: _.template(template),
    events: {
      'click #save': 'save',
      'click #json': 'downloadJSON',
      'click #csv': 'downloadCSV',
      'change #name': 'changeName',
      'change #description': 'changeDescription'
    },

    initialize: function (options) {
      this.options = options || {};
    },

    save: function () {
      var self = this;
      var opts = {
        success: function (model, response, options) {
          alert(trans('exporting.actions.saved'));
          self.options.created = true;
        },
        error: function (model, response, options) {
          alert(response);
          if (!self.options.created) {
            self.options.collection.remove(self.model);
          }
        }
      }

      this.model.set({'report': this.options.reports.selected.id});

      if (!this.model.isValid()) {
        alert(this.model.validationError);
      } else if (this.options.collection) {
        this.options.collection.create(this.model.toJSON(), opts);
      } else {
        this.model.save({}, opts);
      }
    },

    downloadJSON: function () {
      if (!this.options.created) {
        alert(trans('exporting.errors.mustSave'));
      } else {
        this.model.downloadJSON().done(function (data) {
          saveTextAs(JSON.stringify(data, null, 2), 'download.json');
        }).fail(function (jqXHR, status, error) {
          alert(jqXHR.responseJSON.message || error);
        });
      }
    },

    downloadCSV: function () {
      if (!this.options.created) {
        alert(trans('exporting.errors.mustSave'));
      } else {
        this.model.downloadCSV().done(function (data) {
          saveTextAs(data, 'download.csv');
        }).fail(function (jqXHR, status, error) {
          alert(jqXHR.responseJSON.message || error);
        });
      }
    },

    changeName: function (e) {
      this.model.set('name', e.currentTarget.value);
    },

    changeDescription: function (e) {
      this.model.set('description', e.currentTarget.value);
    }
  });
});