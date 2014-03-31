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

  @include('partials.site.elements.page_title', array('page' => 'Learning Locker Dashboard'))

  <div id="appContainer">
    
  </div>

@stop

@section('footer')
 
  @include('partials.site.backbone.templates')
  
@stop