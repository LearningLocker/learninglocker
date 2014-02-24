{{ Form::model($app, array('route' => array('oauth.apps.destroy', $app->_id), 
  'method' => 'DELETE', 'onsubmit' => 'return confirm("Are you sure?")')) }}
  <button type="submit" class="btn btn-default btn-danger">{{ Lang::get('site.delete') }}</button>
{{ Form::close() }}