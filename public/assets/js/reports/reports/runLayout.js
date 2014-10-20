define([
  'jquery',
  'locker',
  'text!./runLayout.html',
  'morris'
], function(jquery, locker, template, morris) {
  return locker.LayoutView.extend({
    template: template,
    _renderGraph: function () {
      jquery.ajax(this.model.url() + '/graph', {
        beforeSend: function (xhr) {
          var auth = btoa(window.lrs.key + ':' + window.lrs.secret);
          xhr.setRequestHeader('Authorization', 'Basic ' + auth);
        }
      }).done(function (data) {
        var morrisData = [];

        $.each(data, function() {
          var setDate = this.date[0].substring(0,10);
          var setData = { y: setDate, a: this.count, b: 2 };
          morrisData.push(setData);
        });

        Morris.Bar({
          element: 'graph',
          data: morrisData,
          xkey: 'y',
          ykeys: ['a'],
          labels: ['Number of statements']
        });
      });
    },
    onShow: function () {
      this._modelSuccess(function () {
        this._renderGraph();
      }.bind(this));
    }
  });
});