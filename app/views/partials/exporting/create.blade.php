@extends('layouts.master')

@section('head')
  @parent
  <!-- load in one page application with requirejs -->
  <script data-main="{{ URL() }}/assets/js/exporting/config" src="{{ URL() }}/assets/js/libs/require/require.js"></script>
  {{ HTML::style('assets/css/typeahead.css')}}
@stop

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop

@section('content')

  @include('partials.site.elements.page_title', array('page' => Lang::get('statements.exporting') ))

  {{ Breadcrumbs::render('exporting.create', $lrs) }}

  <div id="fields"></div>

@stop

@section('scripts')
  @include('partials.exporting.backbone.templates')
@stop

