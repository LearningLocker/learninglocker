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
        if( strlen($r->description) > 150 ){
          $desc = substr($r->description, 0, 150) . '...';
        }else{
          $desc = $r->description;
        }
      ?>
      <div class="col-sm-6 col-md-4">
        <div class="bordered report-box">
          <h4>{{ $r->name }}</h4>
          <p><span class="label label-default">Created: {{$stored->toDayDateTimeString()}}</span></p>
          <p>{{ $desc }}</p>
          <div class="report-box-footer">
            <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/reporting/delete/{{ $r->_id }}" 
              class="btn btn-danger btn-sm pull-right" onClick="return confirm('Are you sure you want to delete');"><i class="icon-trash"></i></button>
            <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/reporting/show/{{ $r->_id }}" class="btn btn-success btn-sm"><i class="icon-play-circle"></i> Run</a>
          </div>
        </div>
      </div>
    @endforeach
  @else
    <p>No reports have been saved.</p>
  @endif

@stop
