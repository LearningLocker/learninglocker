<?php
//grab gravatar if available
$grav_url = \Locker\Helpers\Helpers::getGravatar( $user->email, '50');

?>
<div class='user-list clearfix'>
  @if($user->verified == 'yes')
    <span class="label label-success pull-right">
      {{ Lang::get('users.verified') }} <i class="icon icon-check"></i>
    </span>
  @else
    <span class="label label-default pull-right">
      {{ Lang::get('users.unverified') }}
    </span>
  @endif
  <div class="user-avatar">
    <img src="{{ $grav_url }}" alt="Avatar" class="pull-left avatar img-circle" />
    @if ( Auth::user()->_id != $user['_id'] )
      @include('partials.users.forms.delete', array('user' => $user))
    @endif
    @if( $user->verified != 'yes')
      @include('partials.site.forms.verifyUser', array('user' => $user))
    @endif
  </div>
  <div class="user-details">
    <div class="user-details-item">
      {{ $user->name }}
    </div>
    <div class="user-details-item">
      {{ $user->email }}
    </div>
    <div class="user-details-item">
      @if ( Auth::user()->_id != $user['_id'] )
        <button class="btn btn-link btn-lg edit-role"><i class="icon icon-expand-alt"></i></button>
      @endif
      <b>{{ Lang::get('users.role') }}:</b> {{ $user->role }}
      @if ( Auth::user()->_id != $user['_id'] )
        @include('partials.users.forms.changeRole', array('listed_user' => $user))
      @endif
    </div>
    <div class="user-details-item">
      @if(isset($user->lrs_owned) && !empty($user->lrs_owned))
        <b>LRSs owned:</b> 
        @foreach( $user->lrs_owned as $l)
          <a href="{{ URL() }}/lrs/{{ $l['_id'] }}">{{ $l['title'] }}</a>, 
        @endforeach
      @endif
    </div>
  </div>
</div>