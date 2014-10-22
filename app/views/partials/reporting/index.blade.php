@extends('layouts.master')

@section('head')
  @parent
  <script>
    window.lrs = {
      key: '{{ $lrs->api['basic_key']}}',
      secret: '{{ $lrs->api['basic_secret'] }}'
    };
  </script>
  {{ HTML::style('assets/css/exports.css')}}
  {{ HTML::style('assets/css/typeahead.css')}}
@stop

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop

@section('content')

  <div class="page-header">
    <h1>{{ Lang::get('statements.reporting') }}</h1>
  </div>

  <div id="content"></div>

  <script data-main="{{ URL() }}/assets/js/reports/config" src="{{ URL() }}/assets/js/libs/require/require.js"></script>
@stop
