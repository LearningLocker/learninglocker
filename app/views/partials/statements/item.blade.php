<?php
  /*
  |----------------------------------------------------------------------------
  | The following is so we can handle legacy statements that are stored 
  | with the lrs as an extension. V1.0 and forward does not do this so
  | eventually we will be able to remove this hack.
  |----------------------------------------------------------------------------
  */
  $statement_lrs = $statement['lrs']['_id'];
  $statement = $statement['statement'];
  $json = $statement;
  
  $avatar = \app\locker\helpers\Helpers::getGravatar( substr($statement['actor']['mbox'], 7), '20');

  if( isset($statement['verb']['display']) ){
    $verb = $statement['verb']['display'];
    $verb = reset( $verb );
  }else{
    $verb = $statement['verb']['id'];
  }

  if( isset( $statement['object']['definition'] )){
    if( isset( $statement['object']['definition']['name'] )){
      $object = $statement['object']['definition']['name'];
      $object = reset( $object );
    }else {
      $object = $statement['object']['id'];
    }
  }else {
    $object = $statement['object']['id'];
  }

  $stored = new Carbon\Carbon($statement['stored']);
?>

<div class="row">
  <div class="col-xs-12 col-sm-12 col-lg-12">
    <div class="statement-row clearfix">

      <span onclick="$('.state-{{ $statement['id'] }}').toggle();"><i class="icon icon-cog lightgrey pull-left"></i></span>

      <span class="pull-left statement-avatar">
          <img src="{{ $avatar }}" alt='avatar' class="img-circle" />
      </span> 
        
      {{ $statement['actor']['name'] }}
      
      <i>{{ $verb }}</i>
        
      <a href="{{ $statement['object']['id'] }}">{{{ $object }}}</a>

      <small>| {{ $stored->diffForHumans() }} ({{ $stored->toDayDateTimeString() }})</small>

      <div class="full-statement state-{{ $statement['id'] }}" style="display:none;">
        <?php $statement = \app\locker\Helpers\Helpers::replaceHtmlEntity( $json ); ?>
        <pre><?php echo json_encode($statement,JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES); ?></pre>
      </div>

    </div>
  </div>
</div>