<form method="POST" action="{{ URL() }}/lrs/{{ $lrs->_id }}/client/create" class="pull-right">
  <input type="hidden" name="_token" value="<?php echo csrf_token(); ?>" />
  <button type="submit" class="btn btn-primary" >
  	<i class='icon icon-plus'></i> {{ Lang::get('lrs.client.new_client') }}
  </button>
</form>