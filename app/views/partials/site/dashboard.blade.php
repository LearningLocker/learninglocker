@extends('layouts.master')

@section('sidebar')
  @include('partials.site.sidebars.admin')
@stop

@section('content')
  
  @include('partials.site.elements.page_title', array('page' => 'Learning Locker Dashboard'))

  <p>New dashboard coming soon.</p>

@stop

@section('footer')
  @parent
  @include('partials.graphs.js.morris')
  @include('partials.graphs.data.dashboard')
@stop