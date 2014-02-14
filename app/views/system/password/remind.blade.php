@extends('layouts.loggedout')

@section('content')

  @if (Session::has('error'))
    {{ Session::get('error') }}
  @elseif (Session::has('success'))
    An email with the password reset has been sent.
  @endif

  <h1 class="col-sm-12">Password Reminder</h1>

  {{ Form::open(array('route' => 'password.request')) }}

    <p>{{ Form::label('email', 'Email') }}
    {{ Form::text('email','',array('class' => 'form-control')) }}</p>

    <p>{{ Form::submit('Submit',array('class' => 'btn btn-locker')) }}</p>

  {{ Form::close() }}

@stop