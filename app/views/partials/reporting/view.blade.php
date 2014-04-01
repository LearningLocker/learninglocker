@extends('layouts.master')

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop

@section('content')

  @include('partials.site.elements.page_title', array('page' => Lang::get('reporting.view') ))

  {{ Breadcrumbs::render('reporting.view', $lrs) }}

  <h4>{{ $report->name }}</h4>
  <p>{{ $report->description }}</p>
  <div id="line-example"></div>
  <hr>
  <h4>Related statements <span id="statementCount"></span></h4>
  <hr>
  <div id="statements"></div>
@stop

@section('scripts')
  @parent
  {{ HTML::script('assets/js/libs/morrisjs/raphael.min.js') }}
  {{ HTML::script('assets/js/libs/morrisjs/morris.min.js') }}
  <script>

    $( document ).ready(function() {
      var query = {{ json_encode($report->query) }};
      //get graph
      jQuery.ajax({
        url: '../data',
        type: 'GET',
        data: 'filter=' + JSON.stringify( query ),
        contentType: 'application/json',
        dataType: 'json',
        success: function (json) {
          $('#line-example').empty();
          displayGraph(json);
        },
        error: function( error ) {
          
        }
      });
      //get statements
      jQuery.ajax({
        url: '../statements',
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
        error: function( error ) {
          
        }
      });
    });

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
      Morris.Line({
        element: 'line-example',
        data: buildGraph(json),
        xkey: 'y',
        ykeys: ['a'],
        labels: ['Number of statements']
      });
    };

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
        statement += '<div class="statement-row"><p>' + value.actor.name + ' ' + verb + ' <a href="">' + object + '</a></p></div>';
      });
      return statement;
    }

  </script>
@stop
