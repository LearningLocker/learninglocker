
define([
  'underscore',
  'backbone',
  'marionette',
  'typeahead',
  'app',
  'morris'
], function(_, Backbone, Marionette, Typeahead, App, Morris) {

  var query = {};
  var query_display = {};

  $(document).ready(function() {

    var substringMatcher = function(strs) {
      return function findMatches(q, cb) {
        var matches, substringRegex;
     
        // an array that will be populated with substring matches
        matches = [];
     
        // regex used to determine if a string contains the substring `q`
        substrRegex = new RegExp(q, 'i');
     
        $.each(strs, function(i, str) {
          if (substrRegex.test(str)) {
            matches.push(item.label);
          }
        });
     
        cb(matches);
      };
    };

    var grouping = '';//<?php echo $grouping ?>;

    // constructs the suggestion engine
    var setGrouping = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('id'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      limit: 6,
      remote: {
          url: 'grouping/%QUERY',
          filter: function (grouping) {
              return $.map(grouping, function(group) {
                return { 
                  id: group.context.contextActivities.grouping.id
                };
              });
          }
      }
    });
     
    // kicks off the loading/processing of `local` and `prefetch`
    setGrouping.initialize();
     
    $('#grouping-list .typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 2
      },
      {
        name: 'grouping',
        displayKey: 'id',
        source: setGrouping.ttAdapter()
      }
    ).on('typeahead:selected', onGroupingSelected).on('typeahead:autocompleted', onGroupingSelected);

    function onGroupingSelected($e, datum) {
     
      checkbox = buildCheckboxes('grouping', datum.id, datum.id);

      $('#grouping-selected').append(checkbox);

      buildQueryArray('context.contextActivities.grouping.id', datum.id);

      buildQueryDisplay('context', datum.id)

      displayQuery();

    }

    var parents = '';//{{ $parents }};

    // constructs the suggestion engine
    var setParents = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('id'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      limit: 6,
      remote: {
          url: 'parents/%QUERY',
          filter: function (parents) {
              return $.map(parents, function(parent) {
                return { 
                  id: parent.context.contextActivities.parent.id
                };
              });
          }
      }
    });
     
    // kicks off the loading/processing of `local` and `prefetch`
    setParents.initialize();
     
    $('#parents-list .typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 2
      },
      {
        name: 'parents',
        displayKey: 'id',
        source: setParents.ttAdapter()
      }
    ).on('typeahead:selected', onContextSelected).on('typeahead:autocompleted', onContextSelected);

    function onContextSelected($e, datum) {
      
      checkbox = buildCheckboxes('parents', datum.id, datum.id);

      $('#parents-selected').append(checkbox);
     
      buildQueryArray('context.contextActivities.parent.id', datum.id);

      buildQueryDisplay('context', datum.id)
      displayQuery();

    }
     
    //var activities = '';//{{ $activities }};

    // constructs the suggestion engine
    var setActivities = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('id'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      limit: 6,
      remote: {
          url: 'activities/%QUERY',
          filter: function (activities) {
              return $.map(activities, function(activity) {
                //get first value of name object, if not available, use id
                var setName = activity.object.definition.name[Object.keys(activity.object.definition.name)[0]];
                if( setName == 'undefined' ){
                  setName = activity.object.id;
                }
                return { 
                  id: activity.object.id,
                  name: setName
                };
              });
          }
      }
    });


    // kicks off the loading/processing of `local` and `prefetch`
    setActivities.initialize();
     
    $('#activity-list .typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 2
      },
      {
        name: 'activities',
        displayKey: 'id',
        source: setActivities.ttAdapter()
      }
    ).on('typeahead:selected', onActivitySelected).on('typeahead:autocompleted', onActivitySelected);

    function onActivitySelected($e, datum) {
      
      checkbox = buildCheckboxes('activities', datum.id, datum.name);
    
      $('#activities-selected').append(checkbox);
      
      buildQueryArray('object.id', datum.id);

      buildQueryDisplay('activity', datum.name)

      displayQuery();

    }

    // constructs the suggestion engine
    var setActors = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      limit: 6,
      //local: $.map(actors, function(actor) { return { name: actor }; })
      remote: {
          url: 'actors/%QUERY',
          filter: function (actors) {
              return $.map(actors, function(actor) {
                return { 
                  name: actor.name, mbox:actor.mbox
                };
              });
          }
      }
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
    
      checkbox = buildCheckboxes('actor', datum.mbox, datum.name);

      $('#actors-selected').append(checkbox);
      
      //build query which will be sent to API
      buildQueryArray('actor.mbox', datum.mbox);

      buildQueryDisplay('actor', datum.name);
      displayQuery();

    }

    //handle checkboxes
    $(document).on( 'change', ':checkbox', function() {

      if(this.checked) {

        //result.score handle query creation differently so don't do this
        if( this.value != 'result.score' ){

          buildQueryDisplay( $(this).data('type'), $(this).data('display') );

          //if actor everyone selected, don't add to query as it is not needed.
          if( this.value != 'everyone' ){
            buildQuery($(this).data('type'), this.value);
          }

        }

      }else{

        //removing result scores needs a different process
        if( this.value == 'result.score' ){

          //remove result score from query
          removeQueryResultScore( $(this).data('type') );

          //now remove from query display
          delete query_display[$(this).data('type')];

          //empty fields and close inputs
          removeScoreInputs( $(this).attr("id") );

        }else{

          //remove from query object
          removeFromQuery( $(this).data('type'), this.value );
        
          //remove from display object
          removeDisplayString( $(this).data('type'), $(this).data('display') );

        }

      }

      //redraw display
      displayQuery();

    });

    //handle radio inputs for success and completion
    $(document).on( 'change', ':radio', function() {
      radioName = $(this).attr('name');
      if( $(this).val() == 'true' ){
        getValue = true;
      }else{
        getValue = false;
      }
      if( radioName == 'success' ){
        query_display['result.success'] = 'With success as ' + getValue;
        query['result.success'] = getValue;
      }
      if( radioName == 'completion' ){
        query_display['result.completion'] = 'With completion as ' + getValue;
        query['result.completion'] = getValue;
      }
      displayQuery();
    });

    //clear the result success section
    $('#success-clear').click(function(e){
      e.preventDefault();
      $('input[name=success]').attr('checked',false);
      delete query['result.success'];
      delete query_display['result.success'];
      displayQuery();
    });

    //clear the result completion section
    $('#completion-clear').click(function(e){
      e.preventDefault();
      $('input[name=completion]').attr('checked',false);
      delete query['result.completion'];
      delete query_display['result.completion'];
      displayQuery();
    });

    //result scaled, raw, min and max

    $('#scaled').change(function(){
      displayScoreInputs( this, 'scaled' );
    });

    $('#raw').change(function(){
      displayScoreInputs( this, 'raw' );
    });

    $('#min').change(function(){
      displayScoreInputs( this, 'min' );
    });

    $('#max').change(function(){
      displayScoreInputs( this, 'max' );
    });

    function displayScoreInputs( item, inputType ){
      var values = setScoreInput( inputType );
      $(values['form']).prop("disabled", !$(item).is(':checked'));
      $(values['to']).prop("disabled", !$(item).is(':checked'));
      $(values['value']).show();
    };

    function removeScoreInputs( scoreType ){
      from  = '#' + scoreType + '_from';
      to    = '#' + scoreType + '_to';
      values = '#' + scoreType + '_values';
      $(from).val('');
      $(to).val('');
      $(values).hide();
    }

    function setScoreInput( inputType ){
      var values = [];
      switch( inputType ){
        case 'scaled':
          values.form  = '#scaled_from';
          values.to    = '#scaled_to';
          values.value = '#scaled_values';
          break;
        case 'raw':
          values.form  = '#raw_from';
          values.to    = '#raw_to';
          values.value = '#raw_values';
          break;
        case 'min':
          values.form  = '#min_from';
          values.to    = '#min_to';
          values.value = '#min_values';
          break;
        case 'max':
          values.form  = '#max_from';
          values.to    = '#max_to';
          values.value = '#max_values';
          break;
      }
      return values;
    }

    $('.explore-option').click( function(e){
      $(".explore-option").removeClass("active");
      $(this).addClass('active');
    });

    $('#clear').click( function(e){
      e.preventDefault();
      window.top.location=window.top.location;
    });

    $('#save').click( function(){
      $('.create-report').toggle();
    });

    $('#createReport').submit( function(e){
      e.preventDefault();
      var setName = $('#createReport').find('input[name="name"]').val();
      var setDescription = $('#createReport').find('input[name="description"]').val();
      var setQuery = query;
      ajaxData = { query: setQuery, name: setName, description: setDescription, lrs: App.lrs_id };
      console.log( ajaxData );
      jQuery.ajax({
        url: 'save',
        type: 'POST',
        data: JSON.stringify( ajaxData ),
        contentType: 'application/json',
        dataType: 'json',
        success: function () {
          $('#createReport').find('input[name="name"]').val('');
          $('#createReport').find('input[name="description"]').val('');
          $('.create-report').hide();
          $('#create-message').toggle().html('That report has now saved');
        },
        error: function( error ) {}
      });
    });

    $('#getStatements').click( function(e){
      e.preventDefault();
      $('.showStatements').toggle();
      jQuery.ajax({
        url: 'statements',
        type: 'GET',
        data: 'filter=' + JSON.stringify( query ),
       contentType: 'application/json',
        dataType: 'json',
        success: function (json) {
          statements = statementDisplay(json);
          count = json.length;
          $('#statementCount').html('(' + count + ')');
          $('#statements').html(statements);
        },
        error: function( error ) {}
      });
    });

    $('#run').click( function(e){
      e.preventDefault();
      //show save and clear query as well as get statements
      $('#save').show();
      $('#clear').show();
      $('#getStatements').show();
      $('#statements').html('');
      $('#statementCount').html('');
      $('.showStatements').hide();
      console.log( query );
      jQuery.ajax({
        url: 'data',
        type: 'GET',
        data: 'filter=' + JSON.stringify( query ),
        contentType: 'application/json',
        dataType: 'json',
        success: function (json) {
          $('#line-example').empty();
          if( jQuery.isEmptyObject(json) ){
            $('#line-example').html('<p class="alert alert-danger">There are no results for that query.</p>');
          }else{
            displayGraph(json);
          }
        },
        error: function( error ) {}
      });
    });

    $('#scaled_values').click( function(e){
      scaled_from = $('#scaled_from').val();
      scaled_to   = $('#scaled_to').val();
      buildQueryResultScore('result.score.scaled', ['<>', scaled_from, scaled_to]);
      buildActualDisplay('result.score.scaled', 'Scaled from ' + scaled_from + ' to ' + scaled_to);
      displayQuery();
    });
    $('#raw_values').click( function(e){
      raw_from = $('#raw_from').val();
      raw_to   = $('#raw_to').val();
      buildQueryResultScore('result.score.raw', ['<>', raw_from, raw_to]);
      buildActualDisplay('result.score.raw', 'Raw from ' + raw_from + ' to ' + raw_to);
      displayQuery();
    });
    $('#min_values').click( function(e){
      min_from = $('#min_from').val();
      min_to   = $('#min_to').val();
      buildQueryResultScore('result.score.min', ['<>', min_from, min_to]);
      buildActualDisplay('result.score.min', 'Min from ' + min_from + ' to ' + min_to);
      displayQuery();
    });
    $('#max_values').click( function(e){
      max_from = $('#max_from').val();
      max_to   = $('#max_to').val();
      buildQueryResultScore('result.score.max', ['<>', max_from, max_to]);
      buildActualDisplay('result.score.max', 'Max from ' + max_from + ' to ' + max_to);
      displayQuery();
    });

  });

  function removeFromQuery( dataType, value ){
    var setType = getType( dataType );
    query[setType] = _.without(query[setType], encodeURIComponent(value));
  }

  function buildCheckboxes(dataType, value, display){
    var checkbox = '<div class="col-xs-12 col-sm-4">';
    checkbox += '<div class="checkbox">';
    checkbox += '<label><input type="checkbox" value="' + value + '" data-type="'+dataType+'" data-display="'+display+'" checked> ' + display + '</label>';
    checkbox += '</div></div>';
    return checkbox;
  }

  function displayQuery(){

    var displayString = '';

    //build display string
    if( query_display['actor'] ){
      displayString += query_display['actor'] + ' ';
    }
    if( query_display['verb'] ){
      displayString += query_display['verb'] + ' ';
    }
    if( query_display['activities'] ){
      displayString += query_display['activities'] + ' ';
    }
    if( query_display['activity_type'] ){
      displayString += query_display['activity_type'] + ' ';
    }
    if( query_display['context'] ){
      displayString += query_display['context'] + ' ';
    }
    if( query_display['context.platform'] ){
      displayString += query_display['context.platform'] + ' ';
    }
    if( query_display['context.instructor'] ){
      displayString += query_display['context.instructor'] + ' ';
    }
    if( query_display['context.language'] ){
      displayString += query_display['context.language'] + ' ';
    }
    if( query_display['result.score.scaled'] ){
      displayString += query_display['result.score.scaled'] + ' ';
    }
    if( query_display['result.score.max'] ){
      displayString += query_display['result.score.max'] + ' ';
    }
    if( query_display['result.score.min'] ){
      displayString += query_display['result.score.min'] + ' ';
    }
    if( query_display['result.score.raw'] ){
      displayString += query_display['result.score.raw'] + ' ';
    }
    if( query_display['result.response'] ){
      displayString += query_display['result.response'] + ' ';
    }
    if( query_display['result.attachment'] ){
      displayString += query_display['result.attachment'] + ' ';
    }
    if( query_display['result.signed'] ){
      displayString += query_display['result.signed'] + ' ';
    }
    if( query_display['result.success'] ){
      displayString += query_display['result.success'] + ' ';
    }
    if( query_display['result.completion'] ){
      displayString += query_display['result.completion'] + ' ';
    }
    $('#display-query').html( displayString );
  }

  function removeDisplayString(dataType, value){
    str = query_display[dataType];
    str = str.replace(value, '');
    str = str.replace(/^,/, '');
    query_display[dataType] = str;
  }


  function buildQueryDisplay(data_type, data_display){
    switch( data_type ){
      case 'actor':
        buildActualDisplay( 'actor', data_display );
        break;
      case 'verb':
        buildActualDisplay( 'verb', data_display );
        break;
      case 'activity':
        buildActualDisplay( 'activities', data_display );
        break;
      case 'activity_type':
        buildActualDisplay( 'activity_type', data_display );
        break;
      case 'context':
        buildActualDisplay( 'context', data_display );
        break;
      case 'context.platform':
        buildActualDisplay( 'context.platform', data_display );
        break;
      case 'context.language':
        buildActualDisplay( 'context.language', data_display );
        break;
      case 'context.instructor':
        buildActualDisplay( 'context.instructor', data_display );
        break;
      case 'result.score.scaled':
        buildActualDisplay( 'result.score.scaled', data_display );
        break;
      case 'result.score.max':
        buildActualDisplay( 'result.score.max', data_display );
        break;
      case 'result.score.min':
        buildActualDisplay( 'result.score.min', data_display );
        break;
      case 'result.score.raw':
        buildActualDisplay( 'result.score.raw', data_display );
        break;
      case 'result.completion':
        buildActualDisplay( 'result.completion', data_display );
        break;
      case 'result.attachments':
        buildActualDisplay( 'result.attachments', data_display );
        break;
      case 'result.response':
        buildActualDisplay( 'result.response', data_display );
        break;
      case 'result.success':
        buildActualDisplay( 'result.success', data_display );
        break;
    }
  }

  function buildQueryArray(array_key, data){
    if ( query[array_key] ) {
      var existing = query[array_key];
      existing.push( encodeURIComponent(data) );
      query[array_key] = existing;
    }else{
      query[array_key] = [encodeURIComponent(data)];
    }
  }

  //add result scores to the query array
  function buildQueryResultScore(array_key, data){
    query[array_key] = data;
  }

  //remove result scores from from query array
  function removeQueryResultScore( dataType ){
    delete query[dataType];
  }

  function buildQuery(data_type, data){
    switch( data_type ){
      case 'actor':
        buildQueryArray('actor.mbox', data);
        break;
      case 'verb':
        buildQueryArray('verb.id', data);
        break;
      case 'activity_type':
        buildQueryArray('object.definition.type', data);
        break;
      case 'activity':
        buildQueryArray('object.id', data);
        break;
      case 'context.platform':
        buildQueryArray('context.platform', data);
        break;
      case 'context.instructor':
        buildQueryArray('context.instructor', data);
        break;
      case 'context.language':
        buildQueryArray('context.language', data);
        break;
      case 'parent':
        buildQueryArray('context.contextActivities.parent.id', data);
        break;
      case 'grouping':
        buildQueryArray('context.contextActivities.grouping.id', data);
        break;
      case 'result.completion':
        if( data == 'true' ){
          query['result.completion'] = true;
        }else{
          query['result.completion'] = false;
        }
        break;
      case 'result.attachments':
        break;
      case 'result.response':
        break;
      case 'result.success':
        if( data == 'true' ){
          query['result.success'] = true;
        }else{
          query['result.success'] = false;
        }
        break;
    }
  }

  function getType(data_type){
    switch( data_type ){
      case 'actor':
        return 'actor.mbox';
        break;
      case 'verb':
        return 'verb.id';
        break;
      case 'activity_type':
        return 'object.definition.type';
        break;
      case 'activity':
        return 'object.id';
        break;
      case 'context.platform':
        return 'context.platform';
        break;
      case 'context.instructor':
        return 'context.instructor';
        break;
      case 'context.language':
        return 'context.language';
        break;
      case 'parent':
        return 'context.contextActivities.parent.id';
        break;
      case 'grouping':
        return 'context.contextActivities.grouping.id';
        break;
      case 'result.completion':
        return 'result.completion';
        break;
      case 'result.attachments':
        return 'result.attachments';
        break;
      case 'result.response':
        return 'result.response';
        break;
      case 'result.success':
        return 'result.success';
        break;
      case 'result.max':
        return 'result.max';
        break;
      case 'result.min':
        return 'result.min';
        break;
      case 'result.raw':
        return 'result.raw';
        break;
      case 'result.scaled':
        return 'result.scaled';
        break;
    }
  }

  function buildActualDisplay( segment, display ){
    if( query_display[segment] ){
      var contents = query_display[segment];
      contents = contents.replace(/"/g, ""); //remove final quote mark
      var new_values = '"' + contents + ' ' + display + '"';
    }else{
      new_values = '"' + display + '"';
    }
    query_display[segment] = new_values;
  }

  function statementDisplay(json) {

    var statement = '';
    var arr = $.makeArray( json );
    $.each(arr, function(index, value) {
      var object = '';var verb = '';
      if( typeof value.verb.display !== 'undefined' ){
        verb = value.verb.display[Object.keys(value.verb.display)[0]];
      }
      if( typeof value.object.definition !== 'undefined' ){
        if( typeof value.object.definition.name !== 'undefined' ){
          object = value.object.definition.name[Object.keys(value.object.definition.name)[0]];
        }
      }
      statement += '<p>' + value.actor.name + ' ' + verb + ' ' + object + '</p>';
    });
    //console.log( statement );
    return statement;
  }

  function buildGraph(json) {

    var morrisData = [];
    $.each(json, function() {
      var setDate = this.date[0].substring(0,10);
      var setData = { y: setDate, a: this.count, b: 2 };
      morrisData.push(setData);
    });
    return morrisData;
  }

  function displayGraph(json) {
      Morris.Bar({
        element: 'line-example',
        data: buildGraph(json),
        xkey: 'y',
        ykeys: ['a'],
        labels: ['Number of statements']
      });
  }

});