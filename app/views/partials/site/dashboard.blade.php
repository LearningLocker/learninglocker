@extends('layouts.master')

@section('head')
  @parent
  <!-- load in one page application with requirejs -->
  <script data-main="{{ URL() }}/assets/js/admin/config" src="{{ URL() }}/assets/js/libs/require/require.js"></script>
    
@stop

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