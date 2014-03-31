@extends('layouts.loggedout')

@section('content')

  <h1 class="col-sm-10 col-sm-offset-2">Login</h1>

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
  
    <div>
      <a href="{{ URL() }}/password/reset" class="pull-right">Forgotten password?</a>
    </div>

  {{ Form::close() }}

@stop