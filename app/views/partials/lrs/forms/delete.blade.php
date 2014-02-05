{{ Form::model($lrs, array('route' => array('lrs.destroy', $lrs->_id), 
	'method' => 'DELETE', 'class' => 'pull-right', 'onsubmit' => 'return confirm("Are you sure?")')) }}
	<button type="submit" class="btn btn-default btn-danger btn-sm">{{ Lang::get('site.delete') }}</button>
{{ Form::close() }}