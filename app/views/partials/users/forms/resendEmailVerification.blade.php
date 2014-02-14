<form action="{{ URL() }}/email/resend" method="POST">
  <input type="submit" class="btn-link pull-right" value="{{ Lang::get('users.verify_resend') }}" />
</form>