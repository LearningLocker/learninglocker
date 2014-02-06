<div class="col-xs-12 col-sm-6 col-md-8">
	<div class="panel panel-default">
		<div class="panel-heading">
			Tracking course activity over time
		</div>
		<div class="panel-body">
			<div id="multiple_line"></div>
		</div>
	</div>
</div>
<div class="col-xs-12 col-sm-6 col-md-4">
	<div class="panel panel-default">
		<div class="panel-heading">
			Courses represented
		</div>
		<div class="panel-body">
			<div class="list-group">
			@foreach( $data as $b )
				@foreach( $b as $key => $value )
					@if( $key == 'name' )
						<a href="#" class="list-group-item">
							<span class="badge" title="Number of learners">14</span>
							{{ reset( $value ) }}
						</a>
					@endif
				@endforeach
			@endforeach
			</div>
		</div>
	</div>
</div>