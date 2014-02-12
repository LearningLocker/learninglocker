<form method="POST" action="{{ URL() }}/lrs/{{ $lrs->_id }}/apikey" class="pull-right">
  <input type="hidden" name="_token" value="<?php echo csrf_token(); ?>" />
  <input type="submit" value="{{ Lang::get('lrs.endpoint.new_key_secret') }}" class="btn btn-primary btn-xs" />
</form>