@extends('layouts.master')

@section('sidebar')
  @if( isset($admin_dash) )
    @include('partials.site.sidebars.admin')
  @else
    @include('partials.lrs.sidebars.home')
  @endif
@stop

@section('content')
  
  <div class="page-header">
    @if( isset($admin_dash) )
      <a href="{{ URL() }}/lrs/create" class="btn btn-primary pull-right"><i class="icon icon-plus"></i> {{ Lang::get('lrs.add') }}</a>
    @endif
    <h1>{{ Lang::get('lrs.list') }}</h1>
  </div>

  <div class="row">

    @if ( isset($lrs) && !empty($lrs) )

    <table class="table table-striped table-bordered">
      <thead>        
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>User #</th>
          <th>Created</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>

      @foreach( $lrs as $l )
        <div class="col-xs-12 col-sm-12 col-lg-12">
          @include('partials.lrs.item', array('lrs' => $l))
        </div>
      @endforeach

      </tbody>

    @endif

    @if ( count($lrs) == 0 )
      <div class="col-xs-12 col-sm-12 col-lg-12">
        <p>{{ Lang::get('lrs.none') }}</p>
      </div>
    @endif

  </div>

@stop