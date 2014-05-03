@extends('layouts.master')

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop


@section('content')

	@include('partials.client.forms.create')

  @include('partials.site.elements.page_title', array('page' => Lang::get('lrs.client.manageclients')))

  <div class="col-xs-12 col-sm-8 col-lg-8">
    <p>{{ Lang::get('lrs.client.manageclients_intro') }}</p>
     <div class="alert alert-success clearfix">
      <div class="col-sm-10">
        <b>{{ URL() }}/data/xAPI/</b>
      </div>
    </div>
    <div class="bordered clearfix">
		 @foreach ( $clients as $client )
		        
		    @include('partials.client.item', array( 'client' => $client ))
		
		  @endforeach
    </div>
  </div>

@stop