<div class="panel panel-primary">
  <div class="panel-heading">
    	<h3 class="panel-title">
    		<div class="pull-left" >
    		{{ ($client->title) ? ($client->title) : Lang::get('lrs.client.unnamed_client') }}
    		</div>
    		&nbsp;
    		<div class="pull-right" style="margin-top: -6px;">
		    	@if ( app\locker\helpers\Lrs::lrsEdit($lrs) )
				<a href="{{ URL() }}/lrs/{{ $lrs->_id }}/client/{{ $client->_id }}/edit" class="btn btn-success btn-sm pull-right" title="{{ Lang::get('site.edit') }}">
					<i class="icon-pencil"></i><span class="hidden-xs"> Edit</span>
				</a>
				@endif
				@if ( app\locker\helpers\Lrs::lrsEdit($lrs) )
				  @include('partials.client.forms.delete')
				@endif
			</div>
    	</h3>
  </div>
  <div class="panel-body">
    <table class="table table-striped table-bordered table-xs-rows break-words">        
        <tr>
          <th scope="row">Description</th>
          <td>{{ $client->description }}</td>
        </tr>
        <tr>
          <th scope="row">Username</th></th>
          <td>{{ $client->api['basic_key'] }}</td>
        </tr>
        <tr>
          <th scope="row">Password</th></th>
          <td>{{ $client->api['basic_secret'] }}</td>
        </tr>
	</table>
  </div>
</div>