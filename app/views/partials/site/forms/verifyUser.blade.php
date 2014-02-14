{{ Form::model($user, array('route' => array('user.verify', $user->_id), 'method' => 'PUT')) }}
  <button type="submit" class="btn btn-xs btn-primary btn-user-list pull-left">Verify</button>
{{ Form::close() }}