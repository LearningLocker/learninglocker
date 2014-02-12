@extends('layouts.master')

@section('sidebar')
  @include('partials.site.sidebars.admin')
@stop


@section('content')

  @if($errors->any())
  <ul class="alert alert-danger">
    {{ implode('', $errors->all('<li>:message</li>'))}}
  </ul>
  @endif

  @include('partials.site.elements.page_title', array('page' => 'Edit overall settings'))

  {{ Breadcrumbs::render('site.edit', $site) }}
  
  <div class="row">
    <div class="col-xs-12 col-sm-8 col-lg-8">
      @include('partials.site.forms.edit')
    </div>
  </div>

@stop