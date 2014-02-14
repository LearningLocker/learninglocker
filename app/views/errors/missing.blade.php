@extends('layouts.master')


@section('content')
  <div class="container">
        <h2>404 <small>{{ trans('ui.error.404') }}</small></h2>
    @if( !empty($message) )
      <h4>{{ $message }}</h4>
    @endif

    @if( \Config::get('app.debug') )
      <hr>
      <h4>Debug</h4>
      {{ var_dump( \DB::getQueryLog() ) }}
    @endif
  </div>
@endsection