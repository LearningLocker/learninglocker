@extends('layouts.master')

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop


@section('content')
  
  @if($errors->any())
  <ul class="alert alert-danger">
    {{ implode('', $errors->all('<li>:message</li>'))}}
  </ul>
  @endif

  @include('partials.site.elements.page_title', array('page' => Lang::get('statements.reporting') ))

  {{ Breadcrumbs::render('reporting', $lrs) }}

  <div class="row">
    <div class="col-xs-12 col-sm-12">
      @include('partials.reporting.selector')
      <p>Report tool will be coming soon.</p>
    </div>
  </div>
  
@stop

