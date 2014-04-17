{{ Form::model($site, array('route' => array('site.update', $site->_id), 
      'method' => 'PUT', 'class' => 'form-horizontal')) }}
  <div class="form-group">
    {{ Form::label('name', Lang::get('site.name'), array('class' => 'col-sm-4 control-label' )) }}
    <div class="col-sm-8">
      {{ Form::text('name', $site->name,array('class' => 'form-control')) }}
    </div>
  </div>
  <div class="form-group">
    {{ Form::label('description', Lang::get('site.description'), array('class' => 'col-sm-4 control-label' )) }}
    <div class="col-sm-8">
      {{ Form::text('description', $site->description,array('class' => 'form-control')) }}
    </div>
  </div>
  <div class="form-group">
    {{ Form::label('email', Lang::get('site.email'), array('class' => 'col-sm-4 control-label' )) }}
    <div class="col-sm-8">
      {{ Form::text('email', $site->email,array('class' => 'form-control')) }}
      <span class="help-block">{{ Lang::get('site.help.email') }}</span>
    </div>
  </div>
  <div class="form-group">
    {{ Form::label('create_lrs', Lang::get('site.create_lrs'), array('class' => 'col-sm-4 control-label' )) }}
    <div class="col-sm-8">
      <span class='label label-default'><i class="icon icon-check"></i> {{ Lang::get('site.super_admin') }}</span>
      {{ Form::checkbox('create_lrs[]', 'plus') }} {{ Lang::get('site.plus') }}
      {{ Form::checkbox('create_lrs[]', 'observer') }} {{ Lang::get('site.observers') }}
      <input type="hidden" name="create_lrs[]" value="super" />
      <span class="help-block">{{ Lang::get('site.help.create_lrs') }}</span>
    </div>
  </div>
  <div class="form-group">
    {{ Form::label('registration', Lang::get('site.registration'), array('class' => 'col-sm-4 control-label' )) }}
    <div class="col-sm-8">
      {{ Form::radio('registration', 'Open') }} {{ Lang::get('site.open') }}
      {{ Form::radio('registration', 'Closed') }} {{ Lang::get('site.closed') }}
      <span class="help-block">{{ Lang::get('site.help.registration') }}</span>
    </div>
  </div>
  <div class="form-group">
    {{ Form::label('open', 'Restrict registration (email domain)', array('class' => 'col-sm-4 control-label' )) }}
    <div class="col-sm-8">
      {{ Form::text('domain', $site->domain, array('class' => 'form-control')) }}
      <span class="help-block">{{ Lang::get('site.help.restrict') }}</span>
    </div>
  </div>
  <hr>
  <div class="form-group">
    <div class="col-sm-offset-4 col-sm-8">
      <p>{{ Form::submit(Lang::get('site.submit'), array('class'=>'btn btn-primary')) }}</p>
    </div>
  </div>
{{ Form::close() }}