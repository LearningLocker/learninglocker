{{ Form::model($lrs, array('route' => array('lrs.destroy', $lrs->_id), 
  'method' => 'DELETE', 'class' => 'pull-right', 'onsubmit' => 'return confirm("Are you sure?")')) }}
  <button type="submit" class="btn btn-danger btn-xs"><i class="icon-trash"></i></button>
{{ Form::close() }}
