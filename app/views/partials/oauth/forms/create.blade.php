@extends('layouts.master')

@section('sidebar')
  @if( \Locker\Helpers\Access::isRole('super') )
    @include('partials.site.sidebars.admin')
  @else
    @include('layouts.sidebars.blank')
  @endif
@stop


@section('content')
  @if($errors->any())
  <ul class="alert alert-danger">
    {{ implode('', $errors->all('<li>:message</li>'))}}
  </ul>
  @endif

  <div class="page-header">
    <h1>Register a new app</h1>
  </div>
  {{ Breadcrumbs::render('apps.create') }}

  <div class="row">
    <div class="col-xs-12 col-sm-8 col-lg-8">
      {{ Form::open(array('route' => 'oauth.apps.store', 'class' => 'form-horizontal')) }}

        <div class="form-group">
          {{ Form::label('name', 'Name', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('name', '',array('class' => 'form-control')) }}
            <span class="help-block">Your application name.</span>
          </div>
        </div>

        <div class="form-group">
          {{ Form::label('description', Lang::get('site.description'), array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('description', '',array('class' => 'form-control')) }}
            <span class="help-block">Your application description, which will be shown in user-facing authorization screens.</span>
          </div>
        </div>
        <div class="form-group">
          {{ Form::label('website', 'Website', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('website', '',array('class' => 'form-control')) }}
            <span class="help-block">Your application's publicly accessible home page, where users can go to download, make use of, 
              or find out more information about your application.</span>
          </div>
        </div>
        <div class="form-group">
          {{ Form::label('callback', 'Callback URL', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('callback', '',array('class' => 'form-control')) }}
            <span class="help-block">Where should we return after successfully authenticating?</span>
          </div>
        </div>
        <div class="panel panel-default">
          <div class="panel-heading">
            Organisation
          </div>
          <div class="panel-body">
            <div class="form-group">
              {{ Form::label('organisation', 'Organisation', array('class' => 'col-sm-2 control-label' )) }}
              <div class="col-sm-10">
                {{ Form::text('organisation', '',array('class' => 'form-control')) }}
                <span class="help-block">The organization or company behind this application, if any.</span>
              </div>
            </div>
            <div class="form-group">
              {{ Form::label('org_url', 'Website', array('class' => 'col-sm-2 control-label' )) }}
              <div class="col-sm-10">
                {{ Form::text('org_url', '',array('class' => 'form-control')) }}
                <span class="help-block">The organization or company behind this application, if any.</span>
              </div>
            </div>
          </div>
        </div>
        <div class="panel panel-success">
          <div class="panel-heading">
            What type of access does your application need?
          </div>
          <div class="panel-body">
            <div class="radio">
              <label>
                {{ Form::radio('scope', '0', true) }}
                Read only
              </label>
            </div>
            <div class="radio">
              <label>
                {{ Form::radio('scope', '1') }}
                Read and write
              </label>
            </div>
            <div class="radio">
              <label>
                {{ Form::radio('scope', '2') }}
                Read / write and manage
              </label>
            </div>
          </div>
        </div>
        <div class="panel panel-danger">
          <div class="panel-heading">
            Developer rules and regulations
          </div>
          <div class="panel-body">
            <div class="checkbox">
              {{ Form::checkbox('rules') }}
              Check this if you agree with the developer <a href="">rules and regulations</a>.
            </div>
          </div>
        </div>
        <hr>
        <div class="form-group">
          <div class="col-sm-12">
            <p>{{ Form::submit(Lang::get('site.create'), array('class'=>'btn btn-primary')) }}</p>
          </div>
        </div>
        
      {{ Form::close() }}
    </div>
  </div>
@stop
