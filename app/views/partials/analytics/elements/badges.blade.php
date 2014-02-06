<div class="col-xs-12 col-sm-12 col-md-12">
	<div class="panel panel-default">
		<div class="panel-heading">
			<span class="pull-right badge badge-default">
				{{ count( $data ) }}
			</span>
			Badges Earned
		</div>
		<div class="panel-body">

			<div id='badges'></div>
		
			<div class="assertions">
				@foreach( $data as $b )
					<div data-url="{{ $b }}" class='badge-assertion'>An assertion</div>
				@endforeach
			</div>
		</div>
	</div>
</div>