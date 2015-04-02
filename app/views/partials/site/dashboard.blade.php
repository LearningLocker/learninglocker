@extends('layouts.master')

@section('sidebar')
  @include('partials.site.sidebars.admin')
@stop

@section('content')

  <header class="page-header">
    <div id="actionContainer"></div>
    <h2>Admin Dashboard</h2>
  </header>

  <div id="appContainer">
    
  </div>

@stop

@section('footer')
  @include('partials.site.backbone.templates')
  
@stop

@section('script_bootload')
  @parent

  <!-- load in one page application with requirejs -->
  <script data-main="{{ URL() }}/assets/js/admin/config" src="{{ URL() }}/assets/js/libs/require/require.js"></script>
 
  <script type='text/javascript'>
    window.LL.stats = {{ json_encode( $stats ) }};
    window.LL.graph_data = {{ json_encode( $graph_data ) }};
  </script>
@stop