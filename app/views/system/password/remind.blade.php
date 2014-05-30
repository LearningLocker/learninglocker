@extends('layouts.loggedout')

@section('content')

  @if (Session::has('error'))
    {{ Session::get('error') }}
  @elseif (Session::has('success'))
    {{ trans('reminders.password_reset_sent') }}
  @endif

  <h1 class="col-sm-12">{{ trans('users.password_remind') }}</h1>

  {{ Form::open(array('route' => 'password.request')) }}

    <p>{{ Form::label('email', 'Email') }}
    {{ Form::text('email','',array('class' => 'form-control')) }}</p>

    <p>{{ Form::submit('Submit',array('class' => 'btn btn-primary')) }}</p>

  {{ Form::close() }}

@stop