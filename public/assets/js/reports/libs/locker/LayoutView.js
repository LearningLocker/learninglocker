define([
  'marionette',
  './ItemView'
], function(Marionette, ItemView) {
  return Marionette.LayoutView.extend({
    // Adds utility methods (these should not override Marionette methods).
    _eachRelation: function (fn) {
      if (this.relations) {
        Object.keys(this.relations).forEach(fn);
      }
      return this.relations;
    },
    _initializeRelations: function () {
      var self = this;
      self._eachRelation(function (relation) {
        self.addRegion(relation, '#' + relation);
      });
    },
    _showRelations: function () {
      var self = this;
      self._modelSuccess(function () {
        self._eachRelation(function (relation) {
          self[relation].show(new self.relations[relation]({
            collection: self.model.get(relation)
          }));
        });
      });
    },
    _initializeModel: function () {
      this._modelSuccess = this.model.fetch().success;
      this._modelSuccess(this.render);
    },
    _initHelperEvents: ItemView.prototype._initHelperEvents,
    _initializeTemplate: ItemView.prototype._initializeTemplate,
    _modelSuccess: function (fn) {},

    // Extends Marionette.
    events: {},
    initialize: function (options) {
      this._initializeRelations();
      ItemView.prototype.initialize.apply(this, options);
      this._initializeModel();
    },
    onShow: function () {
      this._showRelations();
    },
    onRender: function () {
      this.$el.find('[data-toggle="tooltip"]').tooltip();
    },

    // Defines callbacks for helper events.
    trash: ItemView.prototype.trash,
    save: ItemView.prototype.save,
    changeValue: function(e) {
      var changes = {};
      var prop = e.currentTarget.id;
      var collection = this.model.collection;
      var url = collection ? collection.nestedUrl : '';

      // Checks that prop belongs to model.
      // Allows for collectionname-prop.
      // Avoids changing properties that have the same name as nested model properties.
      if (prop.indexOf('-') === -1 || prop.split('-')[0] === url) {
        changes[prop] = e.currentTarget.value;
        this.model.set(changes);
      }
    }
  });
});
