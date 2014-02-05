@if($errors->any())
<ul class="alert alert-danger">
  {{ implode('', $errors->all('<li>:message</li>'))}}
</ul>
@endif

@include('partials.site.elements.page_title', array('page' => Lang::get('statements.analytics') ))

{{ Breadcrumbs::render('analytics', $lrs) }}

<div class="row">
	<div class="col-xs-12 col-sm-12">
		@include('partials.analytics.elements.selector', array('lrs' => $lrs) )
		<hr>
	</div>
	<div class="col-xs-12 col-sm-6 col-md-4">
		@include('partials.analytics.verblist', array('data' => $data['verbs'], 'lrs' => $lrs))
	</div>
	<div class="col-xs-12 col-sm-6 col-md-4">
		@include('partials.analytics.verblist', array('data' => $data['verbs'], 'lrs' => $lrs))
	</div>
	<div class="col-xs-12 col-sm-6 col-md-4">
		@include('partials.analytics.verblist', array('data' => $data['verbs'], 'lrs' => $lrs))
	</div>
</div>