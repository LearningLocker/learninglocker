@extends('layouts.master')

@section('sidebar')
  @include('layouts.sidebars.blank')
@stop

@section('content')

  @include('partials.site.elements.page_title', array('page' => 'Account settings'))

  @if($errors->any())
    <ul class="alert alert-danger">
      {{ implode('', $errors->all('<li>:message</li>'))}}
    </ul>
  @endif

  <div class="row">
    <div class="col-xs-12 col-sm-8 col-lg-8">
      <div class="bordered">
        <p>
          <b>{{ Lang::get('users.email') }}:</b> {{ $user->email }}
          @if($user->verified == 'yes')
            <span class="label label-success pull-right">
              {{ Lang::get('users.verified') }} <i class="icon icon-check"></i>
            </span>
          @else
            <span class="label label-default pull-right">
              {{ Lang::get('users.unverified') }}
            </span>
            @include('partials.users.forms.resendEmailVerification')
          @endif
        </p>
        <p><b>{{ Lang::get('users.role') }}:</b> {{ $user->role }}</p>
      </div>
      @include('partials.users.forms.account')
      @include('partials.users.forms.password')
    </div>
  </div>

@stop