define([
  'locker',
  'jquery',
  'text!./itemView.html',
  'typeahead'
], function (locker, jquery, template) {
  return locker.ItemView.extend({
    template: template,
    typeaheadUrl: '',
    _matchTypeahead: function (query, cb) {
      var matches = [];
      var substrRegex = new RegExp(query, 'i');
   
      $.each(this._typeaheadKeys, function (i, str) {
        if (substrRegex.test(str)) {
          matches.push({value: str});
        }
      });

      cb(matches);
    },
    _typeaheadKeys: [],
    _initialiseTypeahead: function () {
      var trigger = (function () {
        this.ui.typeahead.trigger('change');
      }).bind(this);

      this.ui.typeahead.typeahead({
        minlength: 1
      }, {
        name: 'keys',
        displayKey: 'value',
        source: this._matchTypeahead
      }).on(
        'typeahead:selected',
        trigger
      ).on(
        'typeahead:autocompleted',
        trigger
      );
    },
    _requestKeys: function () {
      jquery.ajax(this.typeaheadUrl, {
        beforeSend: function (xhr) {
          var auth = btoa(window.lrs.key + ':' + window.lrs.secret);
          xhr.setRequestHeader ('Authorization', 'Basic ' + auth);
        }
      }).done(function (data, status, xhr) {
        this._typeaheadKeys = data;
        this._initialiseTypeahead();
      }).fail(function (xhr, status, error) {

      });
    },
    onRender: function () {
      this._requestKeys();
    }
  });
});