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
		$authorityHTML = '
			<b>'.Lang::get('lrs.client.authority.accountname').':</b> '.$client->authority['account']['name'].'<br/>
			<b>'.Lang::get('lrs.client.authority.accounthomepage').':</b> '.$client->authority['account']['homePage']
		;
			
	} else  {
		$authorityIdentifier = Lang::get('lrs.client.authority.ifi');
		$authorityHTML = '';
	}
	
?>
<a name="{{ $client->_id }}"></a>
<div class="panel panel-primary">
  <div class="panel-heading">
    	<h3 class="panel-title">
    		<div class="pull-left" >
    			{{ ($client->authority['name']) ? ($client->authority['name']) : Lang::get('lrs.client.unnamed_client') }}
    		</div>
    		&nbsp;
    		<div class="pull-right" style="margin-top: -6px;">
				<a href="{{ URL() }}/lrs/{{ $lrs->_id }}/client/{{ $client->_id }}/edit" class="btn btn-success btn-sm pull-right" title="{{ Lang::get('site.edit') }}">
					<i class="icon-pencil"></i><span class="hidden-xs"> {{ Lang::get('site.edit') }}</span>
				</a>
				@include('partials.client.forms.delete')
			</div>
    	</h3>
  </div>
  <div class="panel-body">
  	<h4>
  		Authority
  	</h4>
    <table class="table table-striped table-bordered table-xs-rows break-words">        
        <tr>
          <th scope="row">{{Lang::get('site.name')}}</th>
          <td>{{ $client->authority['name'] }}</td>
        </tr>
        <tr>
          <th scope="row">{{$authorityIdentifier}}</th>
          <td>{{ $authorityHTML }}</td>
        </tr>
	</table>
  	<h4> 		
  		<div class="pull-left" >Credentials </div>
    	&nbsp;
    	<div class="pull-right hidden" style="margin-top: -6px;">
			<a href="{{ URL() }}/lrs/{{ $lrs->_id }}/client/{{ $client->_id }}/refreshcredentials" class="btn btn-default btn-sm pull-right" title="{{ Lang::get('lrs.endpoint.new_key_secret') }}">
				<i class="icon-refresh"></i><span class="hidden-xs"> {{ Lang::get('lrs.endpoint.new_key_secret') }}</span>
			</a>
		</div>
	</h4>
    <table class="table table-striped table-bordered table-xs-rows break-words">        
        <tr>
          <th scope="row">{{Lang::get('site.username')}}</th>
          <td>{{ $client->api['basic_key'] }}</td>
        </tr>
        <tr>
          <th scope="row">{{Lang::get('site.password')}}</th>
          <td>{{ $client->api['basic_secret'] }}</td>
        </tr>
	</table>
	<h4>Other information</h4>
    <table class="table table-striped table-bordered table-xs-rows break-words">        
        <tr>
          <th scope="row">{{Lang::get('site.description')}}</th>
          <td>{{ $client->description }}</td>
        </tr>
	</table>
  </div>
</div>