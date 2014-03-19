@extends('layouts.master')

@section('head')
  @parent
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
  @parent
  <!-- HTML templates for use with backbone -->
  @include('partials.lrs.backbone.templates')
@stop