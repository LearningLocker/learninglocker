
define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'typeahead',
  'app',
  'morris'
], function($, _, Backbone, Marionette, Typeahead, App, Morris) {

/*
|-----------------------------------------------------------------------------------
| This library needs to be replaced by something far better as this was quick and dirty 
| to demo basic reporting.
| Make it modular, use backbone properly and bring in better graphing / options.
|-----------------------------------------------------------------------------------
*/

  var query = {};
  var query_display = {};
  var since = '';
  var until = '';

  //show uri when hovered over
  $('.form-tooltip').tooltip();

/*
|---------------------------------------------------------------------------------
| Typeahead functions with bloodhound.
|---------------------------------------------------------------------------------
*/

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

  /*
  |-------------------------------------------------------------------------------
  | Typeahead grouping
  |-------------------------------------------------------------------------------
  */

  var grouping = '';

  // constructs the suggestion engine
  var setGrouping = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('id'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 6,
    remote: {
        url: 'typeahead/grouping?query=%QUERY',
        filter: function (grouping) {
          return filterReplies(grouping, 'grouping');
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
      displayKey: function(data){
        return setDisplayKey(data);
      },
      source: setGrouping.ttAdapter()
    }
  ).on('typeahead:selected', onGroupingSelected).on('typeahead:autocompleted', onGroupingSelected);

  function onGroupingSelected($e, datum) {

    setTypeaheadQuery('grouping', 
                      datum, 
                      '#grouping-selected', 
                      'statement.context.contextActivities.grouping.id', 
                      'context');

  }

  /*
  |-------------------------------------------------------------------------------
  | Typeahead parents
  |-------------------------------------------------------------------------------
  */

  var parents = '';

  // constructs the suggestion engine
  var setParents = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('id'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 6,
    remote: {
        url: 'typeahead/parents?query=%QUERY',
        filter: function (parents) {
          return filterReplies(parents, 'parents');
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
      displayKey: function(data){
        return setDisplayKey(data);
      },
      source: setParents.ttAdapter()
    }
  ).on('typeahead:selected', onContextSelected).on('typeahead:autocompleted', onContextSelected);

  function onContextSelected($e, datum) {

    setTypeaheadQuery('parents', 
                      datum, 
                      '#parents-selected', 
                      'statement.context.contextActivities.parent.id', 
                      'context');

  }

  /*
  |-------------------------------------------------------------------------------
  | Typeahead activities
  |-------------------------------------------------------------------------------
  */
     
  // constructs the suggestion engine
  var setActivities = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('id'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 6,
    remote: {
        url: 'typeahead/activities?query=%QUERY',
        filter: function (activities) {
          return filterReplies(activities, 'activities');
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
      displayKey: function(data){
        return setDisplayKey(data);
      },
      source: setActivities.ttAdapter()
    }
  ).on('typeahead:selected', onActivitySelected).on('typeahead:autocompleted', onActivitySelected);

  function onActivitySelected($e, datum) {
    setTypeaheadQuery('activities', 
                      datum, 
                      '#activities-selected', 
                      'statement.object.id', 
                      'activity');
  }

  /*
  |-------------------------------------------------------------------------------
  | Typeahead actors
  |-------------------------------------------------------------------------------
  */

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
              name: actor.name, mbox:actor.mbox, account:actor.account, openid:actor.openid
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
    if( datum.mbox ){
      buildQueryArray('statement.actor.mbox', datum.mbox);
    }else if ( datum.account.name ){
      buildQueryArray('statement.actor.account.name', datum.account.name);
    } else if (datum.openid) {
      buildQueryArray('statement.actor.openid', datum.openid);
    }
    //build query for display
    buildQueryDisplay('actor', datum.name);
    //redraw query display
    displayQuery();
  }

  /**
   * Set query display, api query and then display
   *
   **/
  function setTypeaheadQuery(segment, datum, destinationClass, queryKey, displayKey){

    //get id and name from the object
    var idAndName = setIdAndName(datum);
    //build checkbox
    checkbox = buildCheckboxes(segment, idAndName.id, idAndName.name);
    $(destinationClass).append(checkbox);
    //build query to send to API endpoint
    buildQueryArray(queryKey, idAndName.id);
    //build query for display
    buildQueryDisplay(displayKey, idAndName.name);
    //redraw query display
    displayQuery();

  }

  /**
   * Set display key
   **/
  function setDisplayKey(data){
    var id, name, str = "";

    //Check if there is an ID value
    if( !_.isUndefined(data.id) ){
      id = data.id;
    }

    //check to see if definition is set
    if( !_.isUndefined(data.definition) ){
      //Check for a name value
      if( !_.isUndefined(data.definition.name) ){
        var namedef = data.definition.name;

        if( !_.isUndefined(namedef['en-GB']) ){ //See if there is a english versin
          name = namedef['en-GB'];
        } else { //otherwise use the first object in the name definition (if any)
          var namedef_keys = Object.keys(namedef);
          if( namedef_keys.length > 0 ){
            name = namedef[ namedef_keys[0] ];
          }
        }
      }
    }

    //concat the resulting strings
    if( !_.isUndefined(id) ) str += id;
    if( !_.isUndefined(name) ) str += " (" + name + ")";
    return str;
  }

  /**
   * Filter and returns to typeahead
   **/
  function filterReplies(data, segment){
    
    var segment_array = [];
    var existing_ids = [];

    _.each( data, function(d){
      switch(segment){
        case 'activities': var contextSegment = d.statement.object; break;
        case 'grouping'  : var contextSegment = d.statement.context.contextActivities.grouping; break;
        case 'parents'   : var contextSegment = d.statement.context.contextActivities.parent; break;
      }
      //var contextSegment = d + for_context;
      //console.log( contextSegment );
      if( contextSegment instanceof Array ){

        //if item is an array, then loop through each one
        _.each( contextSegment, function(S){                
          if( !_.isUndefined(S.id) ){
            if( _.indexOf(existing_ids, S.id) === -1 ){
              segment_array.push(S);
              existing_ids.push( S.id );
            }
          }                    
        });
      } else {
        //only add to array if not already added to index
        if( !_.isUndefined(contextSegment.id) ){
          if( _.indexOf(existing_ids, contextSegment.id) === -1 ){
            segment_array.push(contextSegment);
            existing_ids.push( contextSegment.id );
          }
        }
      }
    });      
    return segment_array;
  }

  /**
   * Set id and name for a given object
   **/
  function setIdAndName(data){
    var id = data.id;
    //check to see if definition is set
    if( !_.isUndefined(data.definition) ){
      //Check for a name value
      if( !_.isUndefined(data.definition.name) ){
        var namedef = data.definition.name;
        if( !_.isUndefined(namedef['en-GB']) ){ //See if there is a english versin
          name = namedef['en-GB'];
        } else { //otherwise use the first object in the name definition (if any)
          var namedef_keys = Object.keys(namedef);
          if( namedef_keys.length > 0 ){
            name = namedef[ namedef_keys[0] ];
          }
        }
      }
    } else {
      name = id;
    }
    return {id: id, name: name};
  }

/*
|----------------------------------------------------------------------------------------
| End of typeahead
|----------------------------------------------------------------------------------------
*/

/*
|----------------------------------------------------------------------------------------
| Dates
|----------------------------------------------------------------------------------------
*/

  $('#add-dates').click(function(){
    if( $('#since').val().length !== 0 ){
      since = $('#since').val();
      //blank existing, if there
      delete query_display['since'];
      buildQueryDisplay('since', 'since: ' + since);
    }
    if( $('#until').val().length !== 0 ){
      until = $('#until').val();
      delete query_display['until'];
      buildQueryDisplay('until', 'until: ' + until);
    }
    displayQuery();
  });

/*
|---------------------------------------------------------------------------------------
| Handle checkbox selections
|---------------------------------------------------------------------------------------
*/

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

/*
|-------------------------------------------------------------------------------
| Handle radio inputs for success and completion
|-------------------------------------------------------------------------------
*/

  $(document).on( 'change', ':radio', function() {
    radioName = $(this).attr('name');
    if( $(this).val() == 'true' ){
      getValue = true;
    }else{
      getValue = false;
    }
    if( radioName == 'success' ){
      query_display['result.success'] = 'With success as ' + getValue;
      query['statement.result.success'] = getValue;
    }
    if( radioName == 'completion' ){
      query_display['result.completion'] = 'With completion as ' + getValue;
      query['statement.result.completion'] = getValue;
    }
    displayQuery();
  });

  //clear the result success section
  $('#success-clear').click(function(e){
    e.preventDefault();
    $('input[name=success]').attr('checked',false);
    delete query['statement.result.success'];
    delete query_display['result.success'];
    displayQuery();
  });

  //clear the result completion section
  $('#completion-clear').click(function(e){
    e.preventDefault();
    $('input[name=completion]').attr('checked',false);
    delete query['statement.result.completion'];
    delete query_display['result.completion'];
    displayQuery();
  });

/*
|-------------------------------------------------------------------------------
| Result scaled, raw, min and max
|-------------------------------------------------------------------------------
*/

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

  $('#scaled_values').click( function(e){
    scaled_from = $('#scaled_from').val();
    scaled_to   = $('#scaled_to').val();
    buildQueryResultScore('statement.result.score.scaled', ['<>', scaled_from, scaled_to]);
    buildQueryDisplay('result.score.scaled', 'Scaled from ' + scaled_from + ' to ' + scaled_to);
    displayQuery();
  });
  $('#raw_values').click( function(e){
    raw_from = $('#raw_from').val();
    raw_to   = $('#raw_to').val();
    buildQueryResultScore('statement.result.score.raw', ['<>', raw_from, raw_to]);
    buildQueryDisplay('result.score.raw', 'Raw from ' + raw_from + ' to ' + raw_to);
    displayQuery();
  });
  $('#min_values').click( function(e){
    min_from = $('#min_from').val();
    min_to   = $('#min_to').val();
    buildQueryResultScore('statement.result.score.min', ['<>', min_from, min_to]);
    buildQueryDisplay('result.score.min', 'Min from ' + min_from + ' to ' + min_to);
    displayQuery();
  });
  $('#max_values').click( function(e){
    max_from = $('#max_from').val();
    max_to   = $('#max_to').val();
    buildQueryResultScore('statement.result.score.max', ['<>', max_from, max_to]);
    buildQueryDisplay('result.score.max', 'Max from ' + max_from + ' to ' + max_to);
    displayQuery();
  });

/*
|-------------------------------------------------------------------------
| Create report, run, save and clear
|-------------------------------------------------------------------------
*/

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
    console.log( query );
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

    var data_query = 'filter=' + JSON.stringify( query );

    //if since set, add to data_query string
    if( since !== '' ){
      data_query += '&since=' + since;
    }

    //if until set, add to data_query string
    if( until !== '' ){
      data_query += '&until=' + until;
    }

    jQuery.ajax({
      url: 'data',
      type: 'GET',
      data: data_query,
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

/*
|-----------------------------------------------------------------------------------
| Build query inputs and array for reporting endpoint
|-----------------------------------------------------------------------------------
*/

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
        buildQueryArray('statement.actor.mbox', data);
        break;
      case 'verb':
        buildQueryArray('statement.verb.id', data);
        break;
      case 'activity_type':
        buildQueryArray('statement.object.definition.type', data);
        break;
      case 'activity':
        buildQueryArray('statement.object.id', data);
        break;
      case 'context.platform':
        buildQueryArray('statement.context.platform', data);
        break;
      case 'context.instructor':
        buildQueryArray('statement.context.instructor', data);
        break;
      case 'context.language':
        buildQueryArray('statement.context.language', data);
        break;
      case 'parent':
        buildQueryArray('statement.context.contextActivities.parent.id', data);
        break;
      case 'grouping':
        buildQueryArray('statement.context.contextActivities.grouping.id', data);
        break;
      case 'result.completion':
        if( data == 'true' ){
          query['statement.result.completion'] = true;
        }else{
          query['statement.result.completion'] = false;
        }
        break;
      case 'result.attachments':
        break;
      case 'result.response':
        break;
      case 'result.success':
        if( data == 'true' ){
          query['statement.result.success'] = true;
        }else{
          query['statement.result.success'] = false;
        }
        break;
    }
  }

  function getType(data_type){
    switch( data_type ){
      case 'actor':
        return 'statement.actor.mbox';
        break;
      case 'verb':
        return 'statement.verb.id';
        break;
      case 'activity_type':
        return 'statement.object.definition.type';
        break;
      case 'activity':
        return 'statement.object.id';
        break;
      case 'context.platform':
        return 'statement.context.platform';
        break;
      case 'context.instructor':
        return 'statement.context.instructor';
        break;
      case 'context.language':
        return 'statement.context.language';
        break;
      case 'parent':
        return 'statement.context.contextActivities.parent.id';
        break;
      case 'grouping':
        return 'statement.context.contextActivities.grouping.id';
        break;
      case 'result.completion':
        return 'statement.result.completion';
        break;
      case 'result.attachments':
        return 'statement.result.attachments';
        break;
      case 'result.response':
        return 'statement.result.response';
        break;
      case 'result.success':
        return 'statement.result.success';
        break;
      case 'result.max':
        return 'statement.result.max';
        break;
      case 'result.min':
        return 'statement.result.min';
        break;
      case 'result.raw':
        return 'statement.result.raw';
        break;
      case 'result.scaled':
        return 'statement.result.scaled';
        break;
    }
  }

/*
|-----------------------------------------------------------------------------------
| Build query display functions.
|-----------------------------------------------------------------------------------
*/

  function removeDisplayString(dataType, value){
    str = query_display[dataType];
    str = str.replace(value, '');
    str = str.replace(/^,/, '');
    query_display[dataType] = str;
  }

  function buildQueryDisplay( segment, display ){

    if( segment === 'activity' ){
      segment = 'activities';
    }

    if( query_display[segment] ){
      var contents = query_display[segment];
      contents = contents.replace(/"/g, ""); //remove final quote mark
      var new_values = '"' + contents + ' ' + display + '"';
    }else{
      new_values = '"' + display + '"';
    }
    query_display[segment] = new_values;
  }

  //draw the actual query display from the latest query_display array
  function displayQuery(){

    var displayString = '';

    for (var i in query_display) {
       displayString += query_display[i] + ", ";
    }

    $('#display-query').html( displayString );
  }

/*
|-------------------------------------------------------------------------
| Display statements
|-------------------------------------------------------------------------
*/

  function statementDisplay(json) {

    var statement = '';
    var arr = $.makeArray( json );
    _.each( arr, function(value){
      var object = '';var verb = '';
      if( !_.isUndefined(value.statement.verb.display) ){
        verb = value.statement.verb.display[Object.keys(value.statement.verb.display)[0]];
      }
      if( !_.isUndefined(value.statement.object.definition) ){
        if( !_.isUndefined(value.statement.object.definition.name) ){
          object = value.statement.object.definition.name[Object.keys(value.statement.object.definition.name)[0]];
        }
      }
      statement += '<div class="statement-row"><p>' + value.statement.actor.name + ' ' + verb + ' ' + object + '</p></div>';
    });
    return statement;

  }

/*
|-------------------------------------------------------------------------
| Morris graph functions
|-------------------------------------------------------------------------
*/

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