define([
  'locker',
  './TypeAhead/ItemView',
  'text!./editLayout.html'
], function(locker, TypeaheadView, template) {
  return locker.LayoutView.extend({
    template: template,
    relations: {
      actors: locker.CompositeView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      verbs: locker.CompositeView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      activities: locker.CompositeView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      activityTypes: locker.CompositeView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      parents: locker.CompositeView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      groups: locker.CompositeView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      platforms: locker.CompositeView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      instructors: locker.CompositeView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      languages: locker.CompositeView.extend({
        itemView: TypeaheadView.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      })
    }
  });
});