{{ Form::model($user, array('route' => array('users.password', $user->_id), 
      'method' => 'PUT', 'class' => 'form-horizontal')) }}
<div class="bordered">
  <h4>{{ Lang::get('users.password_change') }}</h4>
  <div class="form-group">
    {{ Form::label('current_password', Lang::get('users.password_current'), array('class' => 'col-sm-4 control-label')) }}
    <div class="col-sm-8">
      {{ Form::password('current_password',array('class' => 'form-control')) }}
    </div>
  </div>
  <div class="form-group">
    {{ Form::label('password', Lang::get('users.password'), array('class' => 'col-sm-4 control-label')) }}
    <div class="col-sm-8">
      {{ Form::password('password',array('class' => 'form-control')) }}
    </div>
  </div>
  <div class="form-group">
    {{ Form::label('password_confirmation', Lang::get('users.password_again'), array('class' => 'col-sm-4 control-label')) }}
    <div class="col-sm-8">
      {{ Form::password('password_confirmation',array('class' => 'form-control')) }}
    </div>
  </div>
  <div class="form-group">
    <div class="col-sm-offset-4 col-sm-8">
      {{ Form::submit(Lang::get('users.password_change'), array('class' => 'btn btn-primary')) }}
    </div>
  </div>
</div>
{{ Form::close() }}