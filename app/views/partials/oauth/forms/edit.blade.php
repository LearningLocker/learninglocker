
  @if($errors->any())
  <ul class="alert alert-danger">
    {{ implode('', $errors->all('<li>:message</li>'))}}
  </ul>
  @endif

  <h3>Application settings</h3>
  <div class="row">
    <div class="col-xs-12 col-sm-8 col-lg-8">
      {{ Form::model($app, array('route' => array('oauth.apps.update', $app->_id), 
      'method' => 'PUT', 'class' => 'form-horizontal')) }}

        <div class="form-group">
          {{ Form::label('name', 'Name', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('name', $app->name,array('class' => 'form-control')) }}
            <span class="help-block">Your application name.</span>
          </div>
        </div>

        <div class="form-group">
          {{ Form::label('description', Lang::get('site.description'), array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('description', $app->description,array('class' => 'form-control')) }}
            <span class="help-block">Your application description, which will be shown in user-facing authorization screens.</span>
          </div>
        </div>
        <div class="form-group">
          {{ Form::label('website', 'Website', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('website', $app->website,array('class' => 'form-control')) }}
            <span class="help-block">Your application's publicly accessible home page, where users can go to download, make use of, 
              or find out more information about your application.</span>
          </div>
        </div>
        <div class="form-group">
          {{ Form::label('callback', 'Callback URL', array('class' => 'col-sm-2 control-label' )) }}
          <div class="col-sm-10">
            {{ Form::text('callback', $app->callbackurl, array('class' => 'form-control')) }}
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
                {{ Form::text('organisation', $app->organisation['name'], array('class' => 'form-control')) }}
                <span class="help-block">The organization or company behind this application, if any.</span>
              </div>
            </div>
            <div class="form-group">
              {{ Form::label('org_url', 'Website', array('class' => 'col-sm-2 control-label' )) }}
              <div class="col-sm-10">
                {{ Form::text('org_url', $app->organisation['website'], array('class' => 'form-control')) }}
                <span class="help-block">The organization or company behind this application, if any.</span>
              </div>
            </div>
          </div>
        </div>
        <hr>
        <div class="form-group">
          <div class="col-sm-12">
            <p>{{ Form::submit(Lang::get('site.edit'), array('class'=>'btn btn-primary')) }}</p>
          </div>
        </div>
        
      {{ Form::close() }}
    </div>
  </div>