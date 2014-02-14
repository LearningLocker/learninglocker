<form method="POST" action="{{ url() }}/statements/{{ $statement['_id'] }}" class="pull-left" style="margin-right:5px;" 
onsubmit="return confirm('Are you sure you want to void this statement? THERE IS NO UNDO.');">
  <input type="hidden" name="_token" value="{{ csrf_token() }}" />
  <input name="_method" type="hidden" value="DELETE">
  <button type="submit" class="btn btn-xs btn-danger" title="Void this statement"><i class="icon-remove"></i></button>
</form>
