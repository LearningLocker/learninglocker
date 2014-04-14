{{ Form::model($user, array('route' => array('users.update', $user->_id), 
      'method' => 'PUT', 'class' => 'form-horizontal')) }}
<div class="bordered">
  <h4>{{ Lang::get('site.details') }}</h4>
  <div class="form-group">
    {{ Form::label('name', Lang::get('site.name'), array('class' => 'col-sm-4 control-label' )) }}
    <div class="col-sm-8">
      {{ Form::text('name',$user->name, array('class' => 'form-control')) }}
    </div>
  </div>
  <div class="form-group">
    {{ Form::label('email', Lang::get('users.email'), array('class' => 'col-sm-4 control-label' )) }}
    <div class="col-sm-8">
      {{ Form::text('email',$user->email, array('class' => 'form-control')) }}
    </div>
  </div>
  <div class="form-group">
    <div class="col-sm-offset-4 col-sm-8">
      {{ Form::submit(Lang::get('site.submit'), array('class' => 'btn btn-primary')) }}
    </div>
  </div>
</div>
{{ Form::close() }}