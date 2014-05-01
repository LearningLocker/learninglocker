@extends('layouts.master')

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop


@section('content')

  @include('partials.site.elements.page_title', array('page' => Lang::get('lrs.endpoint.submit')))

  <div class="col-xs-12 col-sm-8 col-lg-8">
    <p>{{ Lang::get('lrs.endpoint.instructions') }}</p>
    <div class="alert alert-success clearfix">
      <div class="col-sm-10">
        <b>{{ URL() }}/data/xAPI/</b>
      </div>
    </div>
    <div class="bordered clearfix">
      @include('partials.lrs.forms.apikey')
      <h4>{{ Lang::get('lrs.endpoint.basic_http') }}</h4>
      <div class="col-sm-2">
        <b>{{ Lang::get('site.username') }}</b>
      </div>
      <div class="col-sm-10">
        {{ $lrs->api[0]['basic_key']}}
      </div>
      <div class="col-sm-2">
        <b>{{ Lang::get('site.password') }}</b>
      </div>
      <div class="col-sm-10">
        {{ $lrs->api[0]['basic_secret'] }}
      </div>
    </div>
    <div class="bordered clearfix">
      <h4>{{ Lang::get('lrs.api.oauth') }}</h4>
      <p>Coming soon.</p>
    </div>
  </div>

@stop