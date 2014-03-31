@extends('layouts.master')

@section('head')
  @parent
  <!-- load in one page application with requirejs -->
  <script data-main="{{ URL() }}/assets/js/reporting/config" src="{{ URL() }}/assets/js/libs/require/require.js"></script>
  {{ HTML::style('assets/css/typeahead.css')}}
@stop

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop

@section('content')

  @include('partials.site.elements.page_title', array('page' => Lang::get('statements.reporting') ))

  {{ Breadcrumbs::render('reporting.create', $lrs) }}

  <div class="row">
    <div class="col-xs-12 col-sm-12">
      @include('partials.reporting.selector')
    </div>
  </div>

  <div id="appContainer" class="builder clearfix">
    <div class='row'>
      <div class="col-xs-12 col-sm-8">
        <!-- Tab panes -->
        <div class="tab-content reporting">
          <div class="tab-pane active" id="actor">
            @include('partials.reporting.forms.actor')
          </div>
          <div class="tab-pane" id="verb">
            @include('partials.reporting.forms.verb')
          </div>
          <div class="tab-pane" id="activity">
            @include('partials.reporting.forms.activity')
          </div>
          <div class="tab-pane" id="context">
            @include('partials.reporting.forms.context')
          </div>
          <div class="tab-pane" id="result">
            @include('partials.reporting.forms.result')
          </div>
        </div>
      
        @include('partials.reporting.display')
      </div>
      <div class="col-xs-12 col-sm-4">
        @include('partials.reporting.list')
      </div>
    </div>

    <div class="row">
      <div class="col-xs-12 col-sm-12">
        @include('partials.reporting.graphing')
      </div>
    </div>

  </div>
  
@stop

@section('scripts')
  @parent
  <!-- {{ HTML::script('assets/js/libs/typeahead/typeahead.min.js') }} -->
  @include('partials.reporting.backbone.templates')
@stop

