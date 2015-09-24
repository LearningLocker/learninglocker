{{ trans('users.invite.has_invited', ['INVITOR' => $sender->name, 'LRS_TITLE' => $title]) }}

{{ $custom_message }}

{{ trans('users.invite.instructions') }}
{{ $url }}
