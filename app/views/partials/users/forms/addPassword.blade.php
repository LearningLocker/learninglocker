{{ Form::model($user, array('route' => array('users.addPassword', $user->_id), 
      'method' => 'PUT', 'class' => 'form-horizontal')) }}
<div class="bordered">
  <h4>Add Password</h4>
  <div class="form-group">
    {{ Form::label('password', 'Password', array('class' => 'col-sm-4 control-label')) }}
    <div class="col-sm-8">
      {{ Form::password('password',array('class' => 'form-control')) }}
    </div>
  </div>
  <div class="form-group">
    {{ Form::label('password_confirmation', 'Password confirm', array('class' => 'col-sm-4 control-label')) }}
    <div class="col-sm-8">
      {{ Form::password('password_confirmation',array('class' => 'form-control')) }}
    </div>
  </div>
  <div class="form-group">
    <div class="col-sm-offset-4 col-sm-8">
      {{ Form::submit('Add password', array('class' => 'btn btn-primary')) }}
    </div>
  </div>
</div>
{{ Form::close() }}