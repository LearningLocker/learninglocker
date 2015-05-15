<form method="POST" action="{{ URL() }}/lrs/{{ $lrs->_id }}/client/create">
  <input type="hidden" name="_token" value="<?php echo csrf_token(); ?>" />
  <button type="submit" class="btn btn-success" >
  	<i class='icon icon-plus'></i> {{ Lang::get('lrs.client.new_client') }}
  </button>
</form>