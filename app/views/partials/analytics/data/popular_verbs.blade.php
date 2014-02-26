<?php
  $subtotal = 0;
  foreach( $verbs as $v ){
    $subtotal = $subtotal + $v['count'];
  }
?>

<table class="table table-striped">
  <thead>
    <tr>
      <th class="col-xs-2 hidden-xs"></th>
      <th class="col-xs-2">Count</th>
      <th class="col-xs-2">Verb</th>
      <th class="col-xs-2">% pop</th>
      <th class="col-xs-2">% all</th>
    </tr>
  </thead>
@foreach( $verbs as $v )

<?php 
  $verb            = isset($v['verb']['0']) ? reset($v['verb']['0']) : 'undefined';
  $percent         = round((($v['count'] / $subtotal) * 100), 1);
  $percent_overall = round((($v['count'] / $total) * 100), 1);

  //if $verb display is a url, grab verb of end. This is a temp hack and will be replaced before v1.0
  if( filter_var($verb, FILTER_VALIDATE_URL) ){
    $verb = substr(strrchr($verb, "/"), 1);
  }

  $verb_url        = URL() . '/lrs/'. $lrs->_id . '/statements/verb/' . $verb; 
?>
  
  <tr>
    <td class="hidden-xs col-sm-2">
      <span class="chart pull-left" data-percent="{{ $percent }}"></span>
    </td>
    <td class="col-sm-2">
      <span class="label label-default">{{ $v['count'] }}</span>
    </td>
    <td class="col-sm-2">
      <a href="{{ $verb_url }}">{{ $verb }}</a>
    </td>
    <td class="col-sm-2">
      <span class="label label-default">{{ $percent }}%</span>
    </td>
    <td class="col-sm-2">
      <span class="label label-default">{{ $percent_overall }}%</span>
    </td>
  </tr>
  
@endforeach
</table>