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
      <?php
        $stored = new Carbon\Carbon($r->created_at);
      ?>
      <div class="col-sm-6 col-md-4">
        <div class="bordered">
          <h4>{{ $r->name }}</h4>
          <p>{{ $r->description }}</p>
          <p><span class="label label-info">Created: {{$stored->toDayDateTimeString()}}</span></p>
          <hr>
          <button class="btn btn-danger btn-xs pull-right">Delete</button>
          <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/reporting/show/{{ $r->_id }}" class="btn btn-default btn-xs">Run</a>
        </div>
      </div>
    @endforeach
  @else
    <p>No reports have been saved.</p>
  @endif

@stop
