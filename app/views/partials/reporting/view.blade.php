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
          {{ trans('reporting.related') }} <span id="statementCount"></span>
        </div>
        <div class="panel-body">
          @if($statements)
            @foreach($statements as $s)
              @include('partials.statements.item', array( 'statement' => $s ))
            @endforeach
            {{ $statements->links() }}
          @endif
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
      console.log(query);
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

  </script>
@stop
