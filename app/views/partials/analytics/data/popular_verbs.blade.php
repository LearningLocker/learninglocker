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
  $verb            = isset($v['verb']['0']) ? $v['verb']['0'] : 'undefined';
  $percent         = round((($v['count'] / $subtotal) * 100), 1);
  $percent_overall = round((($v['count'] / $total) * 100), 1);
  $verb_url        = URL() . '/lrs/'. $lrs->_id . '/statements/verb/' . $verb; 
?>
  
  <tr>
    <td class="hidden-xs">
      <span class="chart pull-left" data-percent="{{ $percent }}"></span>
    </td>
    <td>
      <span class="label label-default">{{ $v['count'] }}</span>
    </td>
    <td>
      <a href="{{ $verb_url }}">{{ $verb }}</a>
    </td>
    <td>
      <span class="label label-default">{{ $percent }}%</span>
    </td>
    <td>
      <span class="label label-default">{{ $percent_overall }}%</span>
    </td>
  </tr>
  
@endforeach
</table>