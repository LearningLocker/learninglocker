define([
  'underscore',
  'backbone',
  'marionette',
  'typeahead',
  'app'
], function(_, Backbone, Marionette, Typeahead, App ) {

  var actors = '';//{{ $actors }};

  // constructs the suggestion engine
  var setActors = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 6,
    local: $.map(actors, function(actor) { return { name: actor.name, mbox: actor.mbox }; })
  });
   
  // kicks off the loading/processing of `local` and `prefetch`
  setActors.initialize();
   
  $('#actor-list .typeahead').typeahead({
      hint: true,
      highlight: true,
      minLength: 2
    },
    {
      name: 'actors',
      displayKey: 'name',
      source: setActors.ttAdapter()
    }
  ).on('typeahead:selected', onActorSelected).on('typeahead:autocompleted', onActorSelected);

  function onActorSelected($e, datum) {
  
    checkbox = buildCheckboxes(datum.mbox, datum.name);

    $('#actors-selected').append(checkbox);
    $('#build-query').append('"actor.mbox":"' + datum.mbox + '",');

    //build query which will be sent to API
    buildQueryArray('actor.mbox', datum.mbox);

    buildQueryDisplay('actor', datum.name);
    displayQuery();

  }

});