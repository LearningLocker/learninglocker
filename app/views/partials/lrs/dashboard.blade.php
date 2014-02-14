@extends('layouts.master')

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop

@section('content')
  
  <div class="page-header">
    <h1>{{ Lang::get('site.dash') }}</h1>
  </div>

  <div class="row">
    <div class="col-xs-12 col-sm-12 col-lg-12">
      <div class="statement-graph clearfix">
        <h3>{{ Lang::get('statements.statements') }} <span>{{ $stats['statement_count'] }}</span></h3>
        <p class="averages">
          Your daily average is 
          <span style="color:#00cc00;"> {{ $stats['statement_avg'] }} {{ lcfirst(Lang::get('statements.statements')) }}</span> with 
          <span style="color:#b85e80">{{ $stats['learner_avg'] }} learners</span> participating.
        </p>
        @include('partials.graphs.view.dashboard')
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col-xs-12 col-sm-4 col-lg-4">
      <div class="bordered stats-box">
        <span>{{ $stats['actor_count'] }}</span>
        {{ Lang::get('site.total_learners') }}
      </div>
    </div>
    <div class="col-xs-12 col-sm-4 col-lg-4">
      <div class="bordered stats-box">
        <span>{{ $stats['source_count'] }}</span>
        {{ Lang::get('site.activity_sources') }}
      </div>
    </div>
    <div class="col-xs-12 col-sm-4 col-lg-4">
      <div class="bordered stats-box">
        <span>0</span>
        {{ Lang::get('site.xapi_calls') }}
      </div>
    </div>
  </div>

@stop

@section('footer')
  @parent
  @include('partials.graphs.js.morris')
  @include('partials.graphs.data.dashboard')
@stop