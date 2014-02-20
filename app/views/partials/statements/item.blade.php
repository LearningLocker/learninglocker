<?php 
  $avatar = \app\locker\helpers\Helpers::getGravatar( substr($statement['actor']['mbox'], 7), '20');
  $verb   = $statement['verb']['display'];
  if( isset( $statement['object']['definition']['name'] )){
    $object = $statement['object']['definition']['name'];
    $object = reset( $object );
  } else {
    $object = "Unknown object";
  }
  $verb   = reset( $verb );

  $stored = new Carbon\Carbon($statement['stored']);
?>
<div class="row">
  <div class="col-xs-12 col-sm-12 col-lg-12">
    <div class="statement-row clearfix">

      <span onclick="$('.state-{{ $statement['_id'] }}').toggle();"><i class="icon icon-cog lightgrey pull-left"></i></span>

      <span class="pull-left statement-avatar">
          <img src="{{ $avatar }}" alt='avatar' />
      </span> 
        
      {{ $statement['actor']['name'] }}
        
      <span onclick="$('.rstate-{{ $statement['_id'] }}').toggle();" class="toggle label label-verb verb"><b>{{ $verb }}</b></span>

      <a href="{{ $statement['object']['id'] }}">{{{ $object }}}</a>

      <small>| {{ $stored->diffForHumans() }} ({{ $stored->toDayDateTimeString() }})</small>

      <div class="readable-statement rstate-{{ $statement['_id'] }}" style="display:none;">
        @include('partials.statements.elements.readable', array( 'statement' => $statement, 'lrs' => $lrs->_id ))
      </div>

      <div class="full-statement state-{{ $statement['_id'] }}" style="display:none;">
        <?php $statement = \app\locker\Helpers\Helpers::replaceHtmlEntity( $statement->toArray() ); ?>
        <pre><?php echo json_encode($statement,JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES); ?></pre>
      </div>

    </div>
  </div>
</div>