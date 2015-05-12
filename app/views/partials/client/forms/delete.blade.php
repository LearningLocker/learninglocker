{{ Form::model($client, array('route' => array('client.destroy', $lrs->_id, $client->_id), 
  'method' => 'DELETE', 'onsubmit' => 'return confirm("Are you sure?")')) }}
  <button type="submit" class="btn btn-danger btn-sm"><i class="icon-trash"></i></button>
{{ Form::close() }}