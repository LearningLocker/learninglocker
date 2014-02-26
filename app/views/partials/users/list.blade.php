@extends('layouts.master')

@section('sidebar')
  @if( isset($admin_dash) )
    @include('partials.site.sidebars.admin')
  @else
    @include('partials.lrs.sidebars.lrs')
  @endif
@stop

@section('content')

  <header class="page-header">
    @if( isset($admin_dash) )
      <a href="{{ URL() }}/site/invite" class="btn btn-primary pull-right">
        {{ Lang::get('users.invite.invite') }}</a>
    @else
      <a href="{{ URL() }}/lrs/{{ $lrs->_id }}/users/invite" class="btn btn-primary pull-right">
        {{ Lang::get('users.invite.invite') }}</a>
    @endif
    <h1>{{ Lang::get('users.users') }}</h1>
  </header>

  <div class="row">

    @if ( isset($users) )

      @foreach( $users as $u )
        <div class="col-xs-12 col-sm-4 col-lg-4">
          @if( isset($admin_dash) )
            @include('partials.users.item-site', array('user' => $u))
          @else
            @include('partials.users.item-lrs', array('user' => $u))
          @endif
        </div>
      @endforeach

    @endif

  </div>

@stop