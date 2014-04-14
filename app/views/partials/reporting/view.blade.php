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
  <div class="row">
    <div class="col-sm-12 col-md-8">
      <div class="panel panel-default">
        <div class="panel-heading">
          Related statements <span id="statementCount"></span>
        </div>
        <div class="panel-body">
          <div id="statements"></div>
        </div>
      </div>
    </div>
  </div>
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
          if( jQuery.isEmptyObject(json) ){
            $('#line-example').html('<p class="alert alert-danger">There are no results for that query.</p>');
          }else{
            displayGraph(json);
          }
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
      Morris.Bar({
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
        statement += setStatementDisplay(value);
      });
      return statement;
    }

    function setStatementDisplay(value){
      var object = '';var verb = '';
      if( typeof value.statement.verb.display !== 'undefined' ){
        verb = value.statement.verb.display[Object.keys(value.statement.verb.display)[0]];
      }
      if( typeof value.statement.object.definition !== 'undefined' ){
        if( typeof value.statement.object.definition.name !== 'undefined' ){
          object = value.statement.object.definition.name[Object.keys(value.statement.object.definition.name)[0]];
        }
      }
      return '<div class="statement-row"><p>' + value.statement.actor.name + ' (' + value.statement.actor.mbox + ') ' + verb + ' ' + object + '</p></div>';
    }

  </script>
@stop
