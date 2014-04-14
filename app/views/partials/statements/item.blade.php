<?php
 
  $statement_lrs = $statement['lrs']['_id'];
  $statement = $statement['statement'];
  $json = $statement;
  
  if( isset($statement['actor']['mbox']) ){
    $avatar = \app\locker\helpers\Helpers::getGravatar( substr($statement['actor']['mbox'], 7), '20');
  }else{
    $avatar = 'http://placehold.it/20X20';
  }

  if( isset($statement['actor']['name']) && $statement['actor']['name'] != ''){
    $name = $statement['actor']['name'];
  }elseif(isset($statement['actor']['mbox']) && $statement['actor']['mbox'] != '' ){
    $name = $statement['actor']['mbox'];
  }elseif(isset($statement['actor']['openid']) && $statement['actor']['openid'] != '' ){
    $name = $statement['actor']['openid'];
  }elseif( isset($statement['actor']['account']['name']) && $statement['actor']['account']['name'] != '' ){
    $name = $statement['actor']['account']['name'];
  }else{
    $name = 'no name available';
  }

  if( isset($statement['verb']['display']) ){
    $verb = $statement['verb']['display'];
    $verb = reset( $verb );
  }else{
    $verb = $statement['verb']['id'];
  }

  $object_id = isset($statement['object']['id']) ? $statement['object']['id'] : '#';

  if( isset( $statement['object']['definition'] )){
    if( isset( $statement['object']['definition']['name'] )){
      $object = $statement['object']['definition']['name'];
      $object = reset( $object );
    }else {
      $object = isset($statement['object']['id']) ? $statement['object']['id'] : $statement['object']['mbox'];
    }
  }else {
    $object = isset($statement['object']['id']) ? $statement['object']['id'] : $statement['object']['mbox'];
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
        
      {{ $name }}
      
      <i>{{ $verb }}</i>
        
      <a href="{{ $object_id }}">{{{ $object }}}</a>

      <small>| {{ $stored->diffForHumans() }} ({{ $stored->toDayDateTimeString() }})</small>

      <div class="full-statement state-{{ $statement['id'] }}" style="display:none;">
        <?php $statement = \app\locker\Helpers\Helpers::replaceHtmlEntity( $json ); ?>
        <pre><?php echo json_encode($statement,JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES); ?></pre>
      </div>

    </div>
  </div>
</div>