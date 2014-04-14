@extends('layouts.master')

@section('sidebar')
  @include('layouts.sidebars.blank')
@stop


@section('content')

  <h3>Migration tool</h3>
  <p>Migrate all statements from dev version to v1.0.</p>
  <div class='alert alert-danger'>
    <p><b>WARNING: please make sure you have a backup of your data before running this at it will change/delete data.</b></p>
  </div>
  <h4>Steps</h4>
  <ul>
    <li>First you need to rename the mongodb collection statements => old_statements. 
      You can do this by opening a terminal, get the mongo shell running and using the following command:<br />
      <div class="well">
        db.statements.renameCollection('old_statements')
      </div><br />
      Once done, refresh this page and move on to the next step.
    </li>
    <li>Next, click on the migrate button under each LRS listed below to migrate the statements.</li>
  </ul> 
  <div id="loading" style="margin:10px 0 10px 0;display:none;"><img src="{{ URL() }}/assets/img/ajax-loader.gif" /></div>
  <ul class="list-group col-sm-8">
  @foreach($lrs as $l)
    <?php
      $count = OldStatement::where('context.extensions.http://learninglocker&46;net/extensions/lrs._id', $l->_id)->count();
      $count_new = Statement::where('lrs._id', $l->_id)->count();
    ?>
    @if( $count > 0 )
    <li class="list-group-item">
      <span class="badge">{{ $count }}</span>
      <p>{{ $l->title }}</p>
      @if( isset($count_new) && $count_new != 0 )
        <div class="label label-success">{{ $count_new }}</div>
      @endif 
      <div class="label label-success new_count" style="font-size:16px;padding:8px;"></div>
      @if( !isset($count_new) || $count_new == 0 ) 
        <div class="migrate btn btn-primary btn-sm" data-lrs="{{$l->_id}}"><i class="icon-play-circle"></i> Migrate</div>
      @endif
    </li>
    @endif
  @endforeach
  </ul>
@stop
@section('scripts')
  @parent
  <script>

    $('.migrate').click( function(e){
      e.preventDefault();
      $("#loading").show();
      var lrs = $(this).data('lrs');
      var target = $(this);
      jQuery.ajax({
        url: 'migrate/' + lrs,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        success: function (json) {
          $("#loading").hide();
          target.prev(".new_count").html(json.count + ' <i class="icon icon-check"></i>');
          target.removeClass('btn btn-primary btn-sm');
          target.html('');
        },
        error: function( error ) {}
      });
    });

    $('#rename').click( function(e){
      e.preventDefault();
      jQuery.ajax({
        url: 'migrate/rename',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        success: function (json) {
          console.log(json);
        },
        error: function( error ) {}
      });
    });

  </script>
@stop