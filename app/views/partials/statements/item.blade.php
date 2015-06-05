<?php
 
  //$statement_lrs = $statement['lrs']['_id'];
  $statement = $statement['statement'];
  $json = $statement;
  
  if( isset($statement['actor']['mbox']) ){
    $avatar_id = substr($statement['actor']['mbox'], 7);
  } else {
    $avatar_id = 'hello@learninglocker.net';
  }

  $avatar = \Locker\Helpers\Helpers::getGravatar( $avatar_id, '20');

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
    if (!is_array($verb)) {
      $verb = [$verb];
    }
    $verb = reset( $verb );
  }else{
    $verb = $statement['verb']['id'];
  }

  //if using verb id for display, or display is an iri, truncate for display
  if(filter_var($verb, FILTER_VALIDATE_URL)){
    $verb = substr( $verb, strrpos( $verb, '/' )+1 );
  }

  //set object id for display
  $object_id = isset($statement['object']['id']) ? $statement['object']['id'] : '#';

  //set object for display

  //is the object of type agent?
  if( isset($statement['object']['objectType']) && $statement['object']['objectType'] == 'Agent' ){
    if( isset($statement['object']['name']) ){
      $object = $statement['object']['name'];
    }else{
      $object = isset($statement['object']['mbox']) ? $statement['object']['mbox'] : 'no name available';
    }
  }elseif( isset($statement['object']['objectType']) && $statement['object']['objectType'] == 'SubStatement' ){
    $object = 'A SubStatement'; //@todo not sure how to handle substatement display?
  }else{
    //assume it is a statement ref or activity
    if( isset( $statement['object']['definition']['name'] )){
      //does an acitivyt name exists?
      $object = $statement['object']['definition']['name'];
      if (!is_array($object)) {
        $object = [$object];
      }
      $object = reset( $object );
    }elseif( isset( $statement['object']['definition']['description'] )){
      //if not does a description exist?
      $object = $statement['object']['definition']['description'];
      if (!is_array($object)) {
        $object = [$object];
      }
      $object = reset( $object );
    }else{
      //last resort, or in the case of statement ref, use the id
      $object = $statement['object']['id'];
    }
  }

  $stored = new Carbon\Carbon($statement['stored']);
?>

<div class="row">
  <div class="col-xs-12 col-sm-12 col-lg-12">
    <div class="statement-row clearfix">

      <span onclick="$('.state-{{ $statement['id'] }}').toggle();"><i class="icon icon-cog lightgrey pull-left"></i></span>

      <span class="pull-left statement-avatar">
          <img src="{{ $avatar }}" alt='avatar' class="img-circle avatar" />
      </span> 
        
      {{ $name }}
      
      <i>{{ $verb }}</i>
        
      <a href="{{ $object_id }}">{{{ $object }}}</a>

      <small>| {{ $stored->diffForHumans() }} ({{ $stored->toDayDateTimeString() }})</small>

      <div class="full-statement state-{{ $statement['id'] }}" style="display:none;">
        <?php $statement = \Locker\Helpers\Helpers::replaceHtmlEntity( $json ); ?>
        <pre>{{{ json_encode($statement,JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) }}}</pre>
      </div>

    </div>
  </div>
</div>
