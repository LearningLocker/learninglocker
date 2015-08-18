<?php
//grab gravatar if available
$grav_url = \Locker\Helpers\Helpers::getGravatar( $user['email'], '50');

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
      @if ( $lrs->owner['_id'] != $user['_id'] )
        <select class="form-control lrs-user-role" data-user="{{ $user['_id'] }}">
          <option value="admin" @if($user['role'] == 'admin') selected @endif>Admin</option>
          <option value="observer" @if($user['role'] != 'admin') selected @endif>Observer</option>
        </select>
      @else
        <b>Owner</b>
      @endif
    </div>
  </div>
</div>