@extends('layouts.loggedout')

@section('content')

  @if(Session::has('error'))
    <div class="clearfix">
      <div class="alert alert-danger">
        {{ Session::get('error') }}
      </div>
    </div>
  @endif

  <h1 class="col-sm-12">{{ trans('reminders.password_reset') }}</h1>

  {{ Form::open(array('route' => array('password.update'))) }}

    <p>{{ Form::label('email', 'Email') }}
    {{ Form::text('email','',array('class' => 'form-control', 'required' => true)) }}</p>

    <p>{{ Form::label('password', 'Password') }}
    {{ Form::password('password',array('class' => 'form-control', 'required' => true)) }}</p>

    <p>{{ Form::label('password_confirmation', 'Password confirm') }}
    {{ Form::password('password_confirmation',array('class' => 'form-control', 'required' => true)) }}</p>

    {{ Form::hidden('token', $token) }}

    <p>{{ Form::submit('Submit',array('class' => 'btn btn-primary')) }}</p>

  {{ Form::close() }}

@stop