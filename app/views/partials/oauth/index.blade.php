@extends('layouts.master')

@section('sidebar')
  @if( Auth::user()->role == 'super' )
    @include('partials.site.sidebars.admin')
  @else
    @include('partials.lrs.sidebars.home')
  @endif
@stop


@section('content')

  <a href="{{ URL() }}/oauth/apps/create" class="btn btn-primary pull-right"><i class="icon icon-plus"></i> Create New App</a>
  @include('partials.site.elements.page_title', array('page' => 'Manage Apps'))

  <div class="row">
    @if( $apps )
      @foreach( $apps as $a )
        @include('partials.oauth.item', array('app' => $a))
      @endforeach
    @else
      <p>No apps have been created yet.</p>
    @endif
  </div>

@stop