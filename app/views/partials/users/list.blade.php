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

@section('scripts')
  @parent
  <script type="text/javascript">
  
    $('.lrs-user-role').on('change', function() {
      var user = $(this).data('user');
      var role = $(this).val();
      var lrs = '<?php echo $lrs->_id; ?>';
      var token = $('meta[name="token"]').attr('content');
    
      jQuery.ajax({
        beforeSend: function (request){
          request.setRequestHeader("X-CSRF-Token", token);
        },
        url: '../../lrs/'+ lrs + '/users/' + user + '/changeRole/' + role,
        type: 'PUT',
        contentType: 'application/json',
        dataType: 'json',
        success: function (json) {
          $(this).blur();
          alert('Role successfully changed');
        },
        error: function( error ) {
          console.log(error);
        }
      });
    });
  </script>
@stop