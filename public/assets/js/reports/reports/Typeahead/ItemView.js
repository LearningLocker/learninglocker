define([
  'underscore',
  'locker',
  'jquery',
  'text!./itemView.html',
  'typeahead'
], function (_, locker, jquery, template) {
  return locker.ItemView.extend({
    template: template,
    ui: {
      typeahead: '#typeahead-value'
    },
    typeaheadUrl: '',
    _matchTypeahead: function (query, cb) {
      this._requestKeys(this.typeaheadUrl + '/' + query).done((function (data, status, xhr) {
        cb(this._getTypeaheadKeys(data, query));
      }).bind(this));
    },
    _requestKeys: _.memoize(function (url) {
      return jquery.ajax(url, {
        beforeSend: function (xhr) {
          var auth = btoa(window.lrs.key + ':' + window.lrs.secret);
          xhr.setRequestHeader('Authorization', 'Basic ' + auth);
        }
      });
    }),
    _getTypeaheadKeys: function (data) {
      return {value: data};
    },
    onRender: function () {
      var trigger = (function () {
        this.ui.typeahead.trigger('change');
      }).bind(this);

      this.ui.typeahead.typeahead({
        minlength: 1
      }, {
        name: 'keys',
        displayKey: 'value',
        source: this._matchTypeahead.bind(this)
      }).on(
        'typeahead:selected',
        trigger
      ).on(
        'typeahead:autocompleted',
        trigger
      );
      return locker.ItemView.prototype.onRender.apply(this, Array.prototype.slice.call(arguments));
    },
    changeValue: function(e) {
      var changes = {};
      var prop = e.currentTarget.id.split('-').pop(); // Allows for collectionname-prop.
      changes[prop] = e.currentTarget.value;
      this.model.set(changes);
    }
  });
});
