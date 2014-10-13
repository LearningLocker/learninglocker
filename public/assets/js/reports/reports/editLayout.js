define([
  'locker',
  './TypeAhead/ItemView'
  'text!./editLayout.html'
], function(locker, TypeaheadView, template) {
  return locker.LayoutView.extend({
    template: template,
    relations: {
      actors: locker.CollectionView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      verbs: locker.CollectionView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      activities: locker.CollectionView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      activityTypes: locker.CollectionView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      parents: locker.CollectionView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      groups: locker.CollectionView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      platforms: locker.CollectionView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      instructors: locker.CollectionView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      languages: locker.CollectionView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      })
    }
  });
});