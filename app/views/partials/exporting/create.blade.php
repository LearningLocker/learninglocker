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

  <div class="panel panel-default">
    <div class="panel-heading">
      Select fields
    </div>
    <div class="panel-body">
      <ul class="list-group">
        <li id="field-list" class="input-group">
          <input type="text" class="form-control typeahead" placeholder="Enter field name" />
          <span class="btn btn-danger input-group-addon">
            <i class="icon icon-minus"></i>
          </span>
        </li>
        <li id="field-list" class="input-group">
          <input type="text" class="form-control typeahead" placeholder="Enter field name" />
          <span class="btn btn-danger input-group-addon">
            <i class="icon icon-minus"></i>
          </span>
        </li>
      </ul>
      <div class="btn btn-success">
        <i class="icon icon-plus"></i> {{ Lang::get('exporting.addField') }}
      </div>
    </div>
  </div>
  <div class="btn btn-primary">
    <i class="icon icon-play-circle"></i> {{ Lang::get('exporting.run') }}
  </div>
  <div class="btn btn-primary">
    <i class="icon icon-download"></i> {{ Lang::get('exporting.download') }}
  </div>

@stop

@section('scripts')
  @include('partials.exporting.backbone.templates')
@stop

