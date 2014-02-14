<?php
//grab gravatar if available
$grav_url = \app\locker\helpers\Helpers::getGravatar( $user['email'], '50');

?>
<div class='user-list'>
  @if ( $lrs->owner['_id'] != $user['_id'] )
    <div class="meta pull-right">
      @include('partials.lrs.forms.removeUser', array('lrs' => $lrs, 'user' => $user))
    </div>
  @endif
  <div class="user-avatar">
    <img src="{{ $grav_url }}" alt="Avatar" class="pull-left avatar img-circle" />
  </div>
  <div class="user-details">
    <div class="user-details-item">
      {{ $user['email'] }}
    </div>
    <div class="user-details-item">
      <b>{{ Lang::get('users.role') }}:</b> {{ $user['role'] }}
    </div>
  </div>
</div>