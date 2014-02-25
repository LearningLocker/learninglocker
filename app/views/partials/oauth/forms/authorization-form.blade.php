@extends('layouts.master')

@section('content')
  
  <div class="row">
    <div class="col-xs-12 col-sm-12 col-lg-12">

      <div class="page-header">
        <h1>Authorize an app</h1>
      </div>
      <p>Client application <a href="">{{ $app_details->name }}</a> by 
        <a href="">{{ $app_details->organisation['name'] }}</a> would like to access your data here in Learning Locker.</p>

      <p>@todo Put in the scope to tell the user what the app can access and do on their behalf.</p>
      
      {{ Form::open(array('url' => 'oauth/authorize', 'method' => 'POST', 'class' => 'form-horizontal')) }}

        <div class="checkbox">
          <label>
            {{ Form::checkbox('deny', '1') }}
            {{ Form::label('deny', 'Deny', array()) }}
          </label>
        </div>

        <div class="checkbox">
          <label>
            {{ Form::checkbox('approve', '1') }}
            {{ Form::label('Approve', 'Approve', array()) }}
          </label>
        </div>

        {{ Form::hidden('client_id', $params['client_id']) }}
        {{ Form::hidden('redirect_uri', $params['redirect_uri']) }}
        {{ Form::hidden('response_type', $params['response_type']) }}
        <hr>
        <div class="form-group">
          <div class="col-sm-12">
            {{ Form::submit('Submit',array('class' => 'btn btn-locker')) }}
          </div>
        </div>

      {{ Form::close() }}

    </div>
  </div>

@stop