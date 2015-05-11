@extends('layouts.master')

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop


@section('content')

	@include('partials.client.forms.create')

  @include('partials.site.elements.page_title', array('page' => Lang::get('lrs.client.manageclients')))

  <div class="col-md-10">
    <p>{{ Lang::get('lrs.client.manageclients_intro') }}</p>
     <div class="alert alert-success clearfix">
      <div class="col-sm-10">
        <b>Endpoint for all clients:</b> <span class="break-words">{{ URL() }}/data/xAPI/</span>
      </div>
    </div>
    <div class="row">

    @if ( isset($clients) && !empty($clients) )

      @foreach( $clients as $client )
          @include('partials.client.item', array( 'client' => $client ))
      @endforeach

    @endif

    @if ( count($clients) == 0 )
      <div class="col-xs-12 col-sm-12 col-lg-12">
        <p class="bg-warning">{{ Lang::get('lrs.client.none') }}</p>
      </div>
    @endif

  </div>
  </div>

@stop