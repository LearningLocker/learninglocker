@extends('layouts.master')

@section('sidebar')
  @include('partials.lrs.sidebars.lrs')
@stop

@section('head')
  @parent
  {{ HTML::style('assets/css/exports.css')}}
@stop

@section('content')

  @include('partials.site.elements.page_title', array('page' => trans('lrs.client.manageclients')))

  <div>
    <div class="alert alert-success clearfix">
      <div class="col-sm-10">
        <b>{{ trans('lrs.endpoint.endpoint') }}:</b> <span class="break-words">{{ URL() }}/data/xAPI/</span>
      </div>
    </div>
    <div>

    @if ( isset($clients) && !empty($clients) )

      <table class="table table-bordered">
        <thead>
          <tr>
            <th>{{trans('site.name')}}</th>
            <th>{{trans('site.username')}}</th>
            <th>{{trans('site.password')}}</th>
            <th class="text-center">{{trans('site.edit')}}</th>
            <th class="text-center">{{trans('site.delete')}}</th>
          <tr>
        </thead>
        <tbody>
          @foreach( $clients as $index => $client )
              <tr class="{{ Session::get('success') === trans('lrs.client.created_success') && $index === ($clients->count() - 1) ? 'flash' : '' }}">@include('partials.client.item', array( 'client' => $client ))
          @endforeach
</tr>
        </tbody>
      </table>

    @endif

    @if ( count($clients) == 0 )
      <div class="col-xs-12 col-sm-12 col-lg-12">
        <p class="bg-warning">{{trans('lrs.client.none')}}</p>
      </div>
    @endif

    @include('partials.client.forms.create')

    </div>
  </div>

@stop
