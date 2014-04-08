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
    <table class="table table-striped table-bordered">
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Created</th>
          <th>Run</th>
          <th></th>
        </tr>
      </thead>

      @foreach( $reports as $r )
        <?php
          $stored = new Carbon\Carbon($r->created_at);
          if( strlen($r->description) > 150 ){
            $desc = substr($r->description, 0, 150) . '...';
          }else{
            $desc = $r->description;
          }
        ?>
        <tr>
          <td>
            {{ $r->name }}
          </td>
          <td>
            {{ $r->description }}
          </td>
          <td>
            {{$stored->toDayDateTimeString()}}
          </td>
          <td>
            <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/reporting/show/{{ $r->_id }}" class="btn btn-success btn-sm"><i class="icon-play-circle"></i> Run</a>
          </td>
          <td>
            @include('partials.reporting.forms.delete', array('lrs' => $lrs->_id, 'report' => $r->_id))
          </td>
        </tr>
      @endforeach
    </table>
  @else
    <p>No reports have been saved.</p>
  @endif

@stop
