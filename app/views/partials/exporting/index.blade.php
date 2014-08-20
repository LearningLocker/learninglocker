@extends('layouts.master')

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop

@section('content')

  <div class="page-header">
    <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/exporting/create" class="btn btn-primary pull-right">
      <i class="icon icon-plus"></i> {{ Lang::get('exporting.create') }}
    </a>
    <h1>{{ Lang::get('statements.exporting') }}</h1>
  </div>

  {{ Breadcrumbs::render('exporting', $lrs) }}

  @if( true || $exports )
    <table class="table table-striped table-bordered">
      <thead>
        <tr>
          <th>{{ trans('exporting.name') }}</th>
          <th>{{ trans('exporting.desc') }}</th>
          <th>{{ trans('exporting.created') }}</th>
          <th>{{ trans('exporting.run') }}</th>
          <th>{{ trans('exporting.download') }}</th>
          <th>{{ trans('exporting.delete') }}</th>
        </tr>
      </thead>

      @foreach( $exports as $export )
        <?php
          $stored = new Carbon\Carbon($export->created_at);
          if( strlen($export->description) > 150 ){
            $desc = substr($export->description, 0, 150) . '...';
          }else{
            $desc = $export->description;
          }
        ?>
        <tr>
          <td>
            {{ $export->name }}
          </td>
          <td>
            {{ $export->description }}
          </td>
          <td>
            {{$stored->toDayDateTimeString()}}
          </td>
          <td>
            <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/exporting/show/{{ $export->_id }}" class="btn btn-success btn-sm"><i class="icon-play-circle"></i> {{ trans('exporting.run') }}</a>
          </td>
          <td>
            <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/exporting/show/{{ $export->_id }}" class="btn btn-primary btn-sm"><i class="icon-download"></i> {{ trans('exporting.download') }}</a>
          </td>
          <td>
            @include('partials.exporting.forms.delete', array('lrs' => $lrs->_id, 'export' => $export->_id))
          </td>
        </tr>
      @endforeach
    </table>
  @else
    <p>No exports have been saved.</p>
  @endif

@stop
