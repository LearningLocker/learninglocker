define([
  'marionette',
  'locker',
  './TypeAhead/ItemView',
  './TypeAhead/CompositeView',
  'text!./editLayout.html'
], function(marionette, locker, TypeaheadItem, TypeaheadComposite, template) {
  return locker.LayoutView.extend({
    template: template,
    relations: {
      actors: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      verbs: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      activities: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      activityTypes: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      parents: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      groups: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      platforms: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      instructors: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      }),
      languages: TypeaheadComposite.extend({
        childView: TypeaheadItem.extend({
          typeaheadUrl: '../../api/v1/bla'
        })
      })
    }
  });
});