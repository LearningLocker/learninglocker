<div class="panel panel-default">
	<div class="panel-heading">
		Popular verbs
	</div>
	<div class="panel-body">
		@include('partials.analytics.data.verblist', array('verbs' => $data['result'], 'total' => $data['total'], 'lrs' => $lrs))
	</div>
</div>