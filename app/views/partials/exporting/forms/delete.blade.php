 {{ Form::open(array('url' => 'lrs/'.$lrs.'/exporting/delete/'.$export, 
  'method' => 'DELETE', 'class' => '', 'onsubmit' => 'return confirm("Are you sure?")')) }}
  <button type="submit" class="btn btn-danger btn-sm">
  	<i class="icon-trash"></i> {{ Lang::get('exporting.delete') }}
  </button>
{{ Form::close() }}