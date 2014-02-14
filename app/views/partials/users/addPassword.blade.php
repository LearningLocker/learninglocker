@extends('layouts.master')

@section('sidebar')
  @include('layouts.sidebars.blank')
@stop

@section('content')

  <header class="page-header">
    <h1>{{ Lang::get('users.password_add') }}</h1>
    <p>{{ Lang::get('users.password_instructions') }}</p>
  </header>

  <div class="row">
    <div class="col-xs-12 col-sm-8 col-lg-8">
      @include('partials.users.forms.addPassword')
    </div>
  </div>

@stop