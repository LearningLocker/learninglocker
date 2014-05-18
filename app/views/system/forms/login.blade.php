@extends('layouts.loggedout')

@section('content')

  @if(Session::has('success'))
    <div class="clearfix">
      <div class="alert alert-info">
        {{ Lang::get('reminders.reset') }}
      </div>
    </div>
  @endif

  <h1 class="col-sm-10 col-sm-offset-2">{{ trans('site.login') }}</h1>

  {{ Form::open(array('route' => 'login.store', 'class' => 'form-horizontal')) }}

    <div class="form-group">
      {{ Form::label('email', 'Email', array('class' => 'col-sm-2 control-label')) }}
      <div class="col-sm-10">
        {{ Form::text('email','',array('class' => 'form-control')) }}
      </div>
    </div>

    <div class="form-group">
      {{ Form::label('password', 'Password', array('class' => 'col-sm-2 control-label')) }}
      <div class="col-sm-10">
        {{ Form::password('password',array('class' => 'form-control')) }}
      </div>
    </div>

    <div class="form-group">
      <div class="col-sm-10 col-lg-offset-2">
        {{ Form::submit('Submit',array('class' => 'btn btn-primary')) }}
      </div>
    </div>

  {{ Form::close() }}

@stop