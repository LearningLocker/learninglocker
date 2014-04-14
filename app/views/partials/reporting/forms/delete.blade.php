 {{ Form::open(array('url' => 'lrs/'.$lrs.'/reporting/delete/'.$report, 
  'method' => 'DELETE', 'class' => 'pull-right', 'onsubmit' => 'return confirm("Are you sure?")')) }}
  <button type="submit" class="btn btn-default btn-danger btn-sm">{{ Lang::get('site.delete') }}</button>
{{ Form::close() }}