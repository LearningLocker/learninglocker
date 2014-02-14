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

  @include('partials.site.elements.page_title', array('page' => Lang::get('statements.generator') ))

  {{ Breadcrumbs::render('generator', $lrs) }}

  <div class="row">
    <div class="col-xs-12 col-sm-8 col-lg-8">
      @include('partials.statements.forms.add')
    </div>
    <div class="col-xs-12 col-sm-4 col-lg-4">
      <h4>Instructions</h4>
      <p>This is a super simple tool to test statement creation. If there is a need for a full manual statement creation, we will provide more options.</p>
    </div>
  </div>
  
  
@stop