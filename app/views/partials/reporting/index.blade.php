@extends('layouts.master')

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop

@section('content')

  <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/reporting/create" class="btn btn-default pull-right">
    <i class="icon icon-plus"></i> {{ Lang::get('reporting.create') }}
  </a>

  @include('partials.site.elements.page_title', array('page' => Lang::get('statements.reporting') ))

  {{ Breadcrumbs::render('reporting', $lrs) }}

  @if( $reports )
    @foreach( $reports as $r )
      <div class="col-sm-4">
        <div class="bordered">
          <h4>{{ $r->name }}</h4>
          <p>{{ $r->description }}</p>
          <button class="btn btn-danger btn-sm pull-right">Delete</button>
          <button class="btn btn-default btn-sm">Run</button>
        </div>
      </div>
    @endforeach
  @else
    <p>No reports have been saved.</p>
  @endif

@stop
