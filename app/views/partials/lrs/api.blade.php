@extends('layouts.master')

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop


@section('content')
  
  <div class="page-header">
    <h1>{{ Lang::get('lrs.api.settings') }}</h1>
  </div>

  <div class="row">
    <div class="col-xs-12 col-sm-8 col-lg-8">
      <p>This will be details on this LRS's API.</p>
    </div>
  </div>
  
@stop