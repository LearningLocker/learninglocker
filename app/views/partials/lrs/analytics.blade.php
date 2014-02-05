@extends('layouts.master')

@section('sidebar')
	@include('partials.lrs.sidebars.lrs')
@stop


@section('content')
	@include('partials.analytics.index', array('data' => $data, 'lrs' => $lrs))
@stop

@section('footer')
	@parent
	@include('partials.graphs.js.d3')
	@include('partials.graphs.js.easypiechart')
@stop