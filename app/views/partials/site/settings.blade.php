@extends('layouts.master')

@section('sidebar')
  @include('partials.site.sidebars.admin')
@stop

@section('content')
  
  <a href="{{ URL() }}/site/{{ $site->_id }}/edit" class="btn btn-primary pull-right">{{ Lang::get('site.edit') }}</a>
  @include('partials.site.elements.page_title', array('page' => 'Overall settings'))

  <div class="row">
    <div class="col-xs-12 col-sm-12 col-lg-12">
      <div class="table-responsive">
        <table class="table table-bordered table-striped">
          <tbody>
            <tr>
              <td class="col-sm-2"><b>{{ Lang::get('site.name') }}</b></td>
              <td>{{ $site->name }}</td>
            </tr>
            <tr>
              <td><b>{{ Lang::get('site.description') }}</b></td>
              <td>{{ $site->description }}</td>
            </tr>
            <tr>
              <td><b>{{ Lang::get('site.email') }}</b></td>
              <td>{{ $site->email }}</td>
            </tr>
            <tr>
              <td><b>{{ Lang::get('site.language') }}</b></td>
              <td>{{ $site->lang }}</td>
            </tr>
            <tr>
              <td><b>{{ Lang::get('site.create_lrs') }}</b></td>
              <td>@foreach( $site->create_lrs as $u ) {{ $u }}, @endforeach</td>
            </tr>
            <tr>
              <td><b>{{ Lang::get('site.api_status') }}</b></td>
              <td><span class="label @if($site->api == 'On') label-success @else label-danger @endif">API {{ $site->api }}</span></td>
            </tr>
            <tr>
              <td><b>{{ Lang::get('site.registration') }}</b></td>
              <td>
                <span class="label @if($site->registration == 'Open') label-success @else label-danger @endif">
                  {{ $site->registration }}
                </span>
              </td>
            </tr>
            <tr>
              <td><b>{{ Lang::get('site.restrict') }}</b></td>
              <td>@if( $site->domain ) @ {{ $site->domain }} @else Not set @endif</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

@stop