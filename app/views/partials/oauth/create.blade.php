@extends('layouts.master')

@section('sidebar')
  @if( \Locker\Helpers\Access::isRole('super') )
    @include('partials.site.sidebars.admin')
  @else
    @include('layouts.sidebars.blank')
  @endif
@stop


@section('content')
  @if($errors->any())
  <ul class="alert alert-danger">
    {{ implode('', $errors->all('<li>:message</li>'))}}
  </ul>
  @endif

  <div class="page-header">
    <h1>{{ Lang::get('app.create') }}</h1>
  </div>
  {{ Breadcrumbs::render('apps.create') }}

  <div class="row">
    <div class="col-xs-12 col-sm-8 col-lg-8">
      @include('partials.oauth.forms.create')
    </div>
  </div>
@stop