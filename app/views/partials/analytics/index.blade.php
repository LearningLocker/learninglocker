@extends('layouts.master')

@section('sidebar')
	@include('partials.lrs.sidebars.lrs')
@stop

@section('content')
	@if($errors->any())
	<ul class="alert alert-danger">
	  {{ implode('', $errors->all('<li>:message</li>'))}}
	</ul>
	@endif

	@include('partials.site.elements.page_title', array('page' => Lang::get('statements.analytics') ))

	{{ Breadcrumbs::render('analytics', $lrs) }}

	<div class="row">
		<div class="col-xs-12 col-sm-12">
			@include('partials.analytics.elements.selector', array('lrs' => $lrs, 'selected' => $selected) )
			<hr>
		</div>
		@if ( $selected == 'verbs' )
			@include('partials.analytics.elements.verbs', array('data' => $data['verbs']))
		@elseif ( $selected == 'badges')
			@include('partials.analytics.elements.badges', array('data' => $data['badges']))
		@elseif ( $selected == 'courses')
			@include('partials.analytics.elements.courses', array('data' => $data['courses']))
		@elseif ( $selected == 'articles')
			@include('partials.analytics.elements.articles', array('data' => $data['articles']))
		@elseif ( $selected == 'participation')
			@include('partials.analytics.elements.participation', array('data' => $data['participation']))
		@elseif ( $selected == 'scores')
			@include('partials.analytics.elements.scores', array('data' => $data['scores']))
		@endif
	</div>
@stop

@section('footer')
	@parent
	@include('partials.graphs.js.morris')
	@include('partials.graphs.js.easypiechart')
	@include('partials.graphs.data.multiple_line')
	{{ HTML::script('js/grabber.js') }}
	{{ HTML::script('js/main_grabber.js') }}
@stop