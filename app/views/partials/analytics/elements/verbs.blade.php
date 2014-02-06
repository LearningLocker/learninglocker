<div class="col-xs-12 col-sm-6 col-md-8">
	<div class="panel panel-default">
		<div class="panel-heading">
			Popular three verbs usage over time
		</div>
		<div class="panel-body">
			<div id="multiple_line"></div>
		</div>
	</div>
</div>
<div class="col-xs-12 col-sm-6 col-md-4">
	<div class="panel panel-default">
		<div class="panel-heading">
			Popular verbs
		</div>
		<div class="panel-body">
			@include('partials.analytics.data.popular_verbs', array('verbs' => $data['result'], 'total' => $data['total'], 'lrs' => $lrs))
		</div>
	</div>
</div>