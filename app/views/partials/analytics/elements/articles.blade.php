<div class="col-xs-12 col-sm-12 col-md-12">
	<div class="panel panel-default">
		<div class="panel-heading">
			<span class="pull-right badge badge-default">
				{{ count( $data ) }}
			</span>
			Articles
		</div>
		<div class="panel-body">

			<div class="assertions">
				@foreach( $data as $b )
					{{ $b }}<br />
				@endforeach
			</div>
		</div>
	</div>
</div>