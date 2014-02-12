{{ Form::model($user, array('route' => array('users.destroy', $user->_id), 
  'method' => 'DELETE', 'onsubmit' => 'return confirm("Are you sure you want to delete?")')) }}
  <button type="submit" class="btn btn-default btn-xs btn-user-list pull-left">{{ Lang::get('site.delete') }}</button>
{{ Form::close() }}