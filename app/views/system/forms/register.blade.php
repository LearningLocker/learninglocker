@extends('layouts.loggedout')

@section('content')

  <h1 class="col-sm-8 col-sm-offset-4">{{ trans('site.register') }}</h1>

  {{ Form::open(array('route' => 'register.store', 'class' => 'form-horizontal')) }}

    <div class="form-group">
      {{ Form::label('name', 'Name', array('class' => 'col-sm-4 control-label')) }}
      <div class="col-sm-8">
        {{ Form::text('name', '', array('class' => 'form-control', 'required' => true)) }}
      </div>
    </div>
    <div class="form-group">
      {{ Form::label('email', 'Email', array('class' => 'col-sm-4 control-label')) }}
      <div class="col-sm-8">
        {{ Form::email('email', '', array('class' => 'form-control', 'required' => true)) }}
      </div>
    </div>
    <div class="form-group">
      {{ Form::label('password', 'Password', array('class' => 'col-sm-4 control-label')) }}
      <div class="col-sm-8">
        {{ Form::password('password',array('class' => 'form-control', 'required' => true)) }}
      </div>
    </div>
    <div class="form-group">
      {{ Form::label('password_confirmation', 'Password confirm', array('class' => 'col-sm-4 control-label')) }}
      <div class="col-sm-8">
        {{ Form::password('password_confirmation',array('class' => 'form-control', 'required' => true)) }}
      </div>
    </div>
    <div class="form-group">
      <div class="col-sm-8 col-sm-offset-4">
        {{ Form::submit('Submit',array('class' => 'btn btn-primary')) }}
      </div>
    </div>

  {{ Form::close() }}
      

@stop