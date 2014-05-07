<script>
//note: we can't use jquery's document ready because learning locker loads jquery in the footer. I blame bootstrap. 
document.addEventListener('DOMContentLoaded', function(){
	//set up authoirty
	var oneIfiHasBeenSelected = false;
	$('.client-authority-ifi').each(function(){
		var currentInput = $(this).find('input');
		if (currentInput.val() == ''){
			$(this).addClass('hide');
		}
		else
		{
			oneIfiHasBeenSelected = true;
			var selectedIfi = currentInput.attr('name');
			if (selectedIfi == 'account_homePage' || selectedIfi == 'account_name'){
				selectedIfi = 'account'
			}
			$('.client-authority-ifi-select select').val(selectedIfi);
			
			//stop the search
			return false;
		}
	});
	
	//if all ifis are blank, show the email field. 
	if (!oneIfiHasBeenSelected){
		$('.client-authority-mbox').removeClass('hide');
	}
	
	//adjust authoirty if ifi changes
	$('.client-authority-ifi-select select').change(function(){
		var selectedIfi = $(this).val();
		
		$('.client-authority-ifi').each(function(){
			if ($(this).hasClass('client-authority-' + selectedIfi)){
				$(this).removeClass('hide');
			}
			else
			{
				$(this).addClass('hide');
				$(this).find('input').val('');
			}
		});
	});
});	
</script>

{{ Form::model($client, array('route' => array('client.update', $client->_id),
'method' => 'PUT', 'class' => 'form-horizontal')) }}
<div class="well">
	<h3>Authority</h3>
	<div class="form-group client-authority-name">
		{{ Form::label('description', Lang::get('site.name'), array('class' => 'col-sm-2 control-label' )) }}
		<div class="col-sm-10">
			{{ Form::text('name', $client->authority['name'],array('class' => 'form-control')) }}
		</div>
	</div>
	<div class="form-group client-authority-ifi-select">
		{{ Form::label('title', Lang::get('lrs.client.authority.ifi'), array('class' => 'col-sm-2 control-label' )) }}
		<div class="col-sm-10">
			{{ Form::select('size', array(
			'mbox' => Lang::get('lrs.client.authority.mbox'),
			'mbox_sha1sum' => Lang::get('lrs.client.authority.mbox_sha1sum'),
			'openid' => Lang::get('lrs.client.authority.openid'),
			'account' => Lang::get('lrs.client.authority.account'),
			),'', array('class' => 'form-control')) }}
		</div>
	</div>
	<div class="form-group client-authority-mbox client-authority-ifi">
		{{ Form::label('description', Lang::get('lrs.client.authority.mbox'), array('class' => 'col-sm-2 control-label' )) }}
		<div class="col-sm-10">
			{{ Form::text('mbox', (isset($client->authority['mbox']) ? $client->authority['mbox'] : ''),array('class' => 'form-control')) }}
		</div>
	</div>
	<div class="form-group client-authority-mbox_sha1sum client-authority-ifi">
		{{ Form::label('description', Lang::get('lrs.client.authority.mbox_sha1sum'), array('class' => 'col-sm-2 control-label' )) }}
		<div class="col-sm-10">
			{{ Form::text('mbox_sha1sum', (isset($client->authority['mbox_sha1sum']) ? $client->authority['mbox_sha1sum'] : ''),array('class' => 'form-control')) }}
		</div>
	</div>
	<div class="form-group client-authority-openid client-authority-ifi">
		{{ Form::label('description', Lang::get('lrs.client.authority.openid'), array('class' => 'col-sm-2 control-label' )) }}
		<div class="col-sm-10">
			{{ Form::text('openid', (isset($client->authority['openid']) ? $client->authority['openid'] : ''),array('class' => 'form-control')) }}
		</div>
	</div>
	<div class="form-group client-authority-account client-authority-ifi">
		{{ Form::label('description', Lang::get('lrs.client.authority.accounthomepage'), array('class' => 'col-sm-2 control-label' )) }}
		<div class="col-sm-10">
			{{ Form::text('account_homePage', (isset($client->authority['account']['homePage']) ? $client->authority['account']['homePage'] : ''),array('class' => 'form-control')) }}
		</div>
	</div>
	<div class="form-group client-authority-account client-authority-ifi">
		{{ Form::label('description', Lang::get('lrs.client.authority.accountname'), array('class' => 'col-sm-2 control-label' )) }}
		<div class="col-sm-10">
			{{ Form::text('account_name', (isset($client->authority['account']['name']) ? $client->authority['account']['name'] : ''),array('class' => 'form-control')) }}
		</div>
	</div>

</div>

<div class="well">
	<h3>Metadata</h3>
	<div class="form-group">
		{{ Form::label('description', Lang::get('site.description'), array('class' => 'col-sm-2 control-label' )) }}
		<div class="col-sm-10">
			{{ Form::text('description', $client->description,array('class' => 'form-control')) }}
		</div>
	</div>
</div>
<hr>
<div class="form-group">
	<div class="col-sm-offset-2 col-sm-10">
		<p>
			{{ Form::submit(Lang::get('site.submit'), array('class'=>'btn btn-primary')) }}
		</p>
	</div>
</div>

{{ Form::close() }}