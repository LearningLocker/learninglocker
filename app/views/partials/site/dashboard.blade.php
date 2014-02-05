@extends('layouts.master')

@section('sidebar')
	@include('partials.site.sidebars.admin')
@stop

@section('content')
	
	@include('partials.site.elements.page_title', array('page' => 'Learning Locker Dashboard'))

	<div class="row">
		<div class="col-xs-12 col-sm-12 col-lg-12">
			<div class="statement-graph clearfix">
				<h3>Statements <span>{{ $stats['statement_count'] }}</span></h3>
				<p class="averages">Your daily average is <span style="color:#00cc00;"> {{ $stats['statement_avg'] }} statements</span> with 
				<span style="color:#b85e80">{{ $stats['learner_avg'] }} learners</span> participating.</p>
				@include('partials.graphs.view.dashboard')
			</div>
		</div>
	</div>
	<div class="row">
		<div class="col-xs-12 col-sm-4 col-lg-4">
			<div class="bordered stats-box">
				<span>{{ $stats['lrs_count'] }}</span>
				Total LRSs
			</div>
		</div>
		<div class="col-xs-12 col-sm-4 col-lg-4">
			<div class="bordered stats-box">
				<span>{{ $stats['statement_count'] }}</span>
				Total Statements
			</div>
		</div>
		<div class="col-xs-12 col-sm-4 col-lg-4">
			<div class="bordered stats-box">
				<span>{{ $stats['user_count'] }}</span>
				Total Users
			</div>
		</div>
	</div>

@stop

@section('footer')
	@parent
	@include('partials.graphs.js.morris')
	@include('partials.graphs.data.dashboard')
@stop