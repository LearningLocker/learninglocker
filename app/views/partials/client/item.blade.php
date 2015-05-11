<?php
	$authorityIdentifier;
	$authorityHTML;

	if (array_key_exists('mbox', $client->authority)){
		$authorityIdentifier = Lang::get('lrs.client.authority.mbox');
		$authorityHTML = substr($client->authority['mbox'],7);
		
	} else if (array_key_exists('mbox_sha1sum', $client->authority)){
		$authorityIdentifier = Lang::get('lrs.client.authority.mbox_sha1sum');
		$authorityHTML = $client->authority['mbox_sha1sum'];
		
	} else if(array_key_exists('openid', $client->authority)){
		$authorityIdentifier = Lang::get('lrs.client.authority.openid');
		$authorityHTML = $client->authority['openid'];
		
	} else if (array_key_exists('account', $client->authority)){
		$authorityIdentifier = Lang::get('lrs.client.authority.account');
		$authorityHTML = $client->authority['account']['homePage'].'/'.$client->authority['account']['name'];
			
	} else  {
		$authorityIdentifier = Lang::get('lrs.client.authority.ifi');
		$authorityHTML = '';
	}
	
?>
<tr>
  <td>{{ $client->authority['name'] }}</td>
  <td>{{$authorityIdentifier}}</td>
  <td>{{ $authorityHTML }}</td>
  <td>{{ chunk_split($client->api['basic_key'], 20, '</br>') }}</td>
  <td>{{ chunk_split($client->api['basic_secret'], 20, '</br>') }}</td>
  <td>
    <a
      href="{{ URL() }}/lrs/{{ $lrs->_id }}/client/{{ $client->_id }}/edit"
      class="btn btn-success btn-sm pull-right"
      title="{{ Lang::get('site.edit') }}"
    >
      <i class="icon-pencil"></i>
    </a>
  </td>
  <td>@include('partials.client.forms.delete')</td>
</tr>
<a name="{{ $client->_id }}"></a>
