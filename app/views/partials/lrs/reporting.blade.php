@extends('layouts.master')

@section('sidebar')
	@include('partials.lrs.sidebars.lrs')
@stop


@section('content')
  
	@include('partials.reporting.index')
	
@stop