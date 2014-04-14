@extends('layouts.master')

@section('sidebar')
  @if( Auth::user()->role == 'super' )
    @include('partials.site.sidebars.admin')
  @else
    @include('partials.lrs.sidebars.home')
  @endif
@stop

@section('content')
  
  @include('partials.site.elements.page_title', array('page' => Lang::get('apps.show')))

  {{ Breadcrumbs::render('apps.show') }}

  <div class="row">
    <div class="col-xs-12 col-sm-12 col-lg-12">
      <ul class="nav nav-tabs">
        <li class="active"><a href="#details" data-toggle="tab">Details</a></li>
        <li><a href="#settings" data-toggle="tab">Settings</a></li>
        <li><a href="#keys" data-toggle="tab">Keys</a></li>
        <li><a href="#permissions" data-toggle="tab">Permissions</a></li>
      </ul>
      <!-- Tab panes -->
      <div class="tab-content">
        <div class="tab-pane active" id="details">
          <h3><a href="{{ URL() }}/oauth/apps/{{ $app->_id }}">{{ $app->name }}</a></h3>
          <ul class="app-listing">
            <li>{{ $app->description }}</li>
            <li><b>App website:</b> <a href="{{ $app->website }}">{{ $app->website }}</a></li>
            <li><b>Organisation:</b> <a href="{{ $app->organisation['website'] }}">{{ $app->organisation['name'] }}</a></li>
            <li><b>Owner:</b> {{ $app->owner['name'] }} | {{ $app->owner['email'] }} | {{ $app->owner['role'] }}</li>
            <li><b>Created:</b> {{ $app->created_at }}</li>
          </ul>
          <hr>
          <div class="well">
            @include('partials.oauth.forms.delete', array('app' => $app) )
          </div>
        </div>
        <div class="tab-pane" id="settings">
          @include('partials.oauth.forms.edit')
        </div>
        <div class="tab-pane" id="keys">
          <ul class="app-listing">
            <h3>Application settings</h3>
            <span class="help-block">Keep the "API secret" a secret. This key should never be human-readable in your application.</span>
            <li><b>Client ID:</b> {{ $app->client_id }}</li>
            <li><b>Secret:</b> {{ $app->secret }}</li>
            <li><b>Access level:</b> full access (<a href="">change level</a>)</li>
            <div class="well">
              <button class="btn btn-default">Regenerate keys</button>
            </div>
          </ul>
        </div>
        <div class="tab-pane" id="permissions">
          <p>Put in permission levels and info.</p>
        </div>
      </div>
    </div>
  </div>

@stop