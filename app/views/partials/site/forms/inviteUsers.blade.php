{{ Form::open(array('route' => array('site.invite'), 
      'method' => 'POST', 'class' => 'form-horizontal')) }}
  <div class="form-group">
    {{ Form::label('emails', Lang::get('users.invite.email'), array('class' => 'col-sm-4 control-label' )) }}
    <div class="col-sm-8">
      {{ Form::textarea('emails', '', array('class' => 'form-control')) }}
    </div>
  </div>
  <div class="form-group">
    {{ Form::label('message', 'Message (optional)', array('class' => 'col-sm-4 control-label' )) }}
    <div class="col-sm-8">
      {{ Form::textarea('message', Lang::get('users.invite.sample'), array('class' => 'form-control')) }}
    </div>
  </div>
  <div class="form-group">
    {{ Form::label('role', 'Role', array('class' => 'col-sm-4 control-label' )) }}
    <div class="col-sm-8">
      {{ Form::radio('role', 'super') }} {{ Lang::get('users.roles.super') }}<br />
      {{ Form::radio('role', 'plus') }} {{ Lang::get('users.roles.plus') }}<br />
      {{ Form::radio('role', 'observer') }} {{ Lang::get('users.roles.observer') }}
      <span class="help-block">{{ Lang::get('users.roles.help') }}</span>
    </div>
  </div>
  <hr>
  <div class="col-sm-8 col-sm-offset-4">
    <button type="submit" class="btn btn-primary">{{ Lang::get('users.invite.invite') }}</button>
  </div>
{{ Form::close() }}