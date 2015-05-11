@extends('layouts.master')

@section('head')
  @parent
  <script>
    window.lrs = {
      key: '{{ $client->api['basic_key']}}',
      secret: '{{ $client->api['basic_secret'] }}'
    };
  </script>
  <!-- load in one page application with requirejs -->
  <script data-main="{{ URL() }}/assets/js/lrs/config" src="{{ URL() }}/assets/js/libs/require/require.js"></script>
@stop

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop

@section('content')
  
  <div id="appContainer">

  </div>

@stop

@section('footer')
  <!-- HTML templates for use with backbone -->
  @include('partials.lrs.backbone.templates')
@stop


@section('script_bootload')
  @parent
 
  <script type='text/javascript'>
    window.LL.stats = {{ json_encode( $stats ) }};
    window.LL.graph_data = {{ json_encode( $graph_data ) }};
  </script>
@stop