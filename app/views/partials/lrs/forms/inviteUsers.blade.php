{{ Form::open(array('route' => array('site.invite'), 
      'method' => 'POST', 'class' => 'form-horizontal')) }}
  <div class="form-group">
    {{ Form::label('emails', Lang::get('users.invite.email'), array('class' => 'col-sm-4 control-label' )) }}
    <div class="col-sm-8">
      {{ Form::textarea('emails', '',array('class' => 'form-control')) }}
    </div>
  </div>
  <div class="form-group">
    {{ Form::label('message', Lang::get('users.invite.message'), array('class' => 'col-sm-4 control-label' )) }}
    <div class="col-sm-8">
      {{ Form::textarea('message', Lang::get('users.invite.sample'),array('class' => 'form-control')) }}
    </div>
  </div>
  {{ form::hidden('lrs', $lrs->_id) }}
  {{ form::hidden('role', 'observer') }}
  <hr>
  <div class="col-sm-8 col-sm-offset-4">
    <button type="submit" class="btn btn-primary">{{ Lang::get('users.invite.invite') }}</button>
  </div>
{{ Form::close() }}