{{ Lang::get('reminders.password_reset') }}

{{ Lang::get('reminders.password_reset_form') }}: {{ URL::to('password/reset', array($token)) }}
