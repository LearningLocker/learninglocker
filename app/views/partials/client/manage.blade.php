@extends('layouts.master')

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop


@section('content')

  @include('partials.site.elements.page_title', array('page' => Lang::get('lrs.client.manageclients')))

  <div class="col-xs-12 col-sm-8 col-lg-8">
    <p>{{ Lang::get('lrs.client.manageclients_intro') }}</p>
    <div class="bordered clearfix">
      Hello world
    </div>
  </div>

@stop