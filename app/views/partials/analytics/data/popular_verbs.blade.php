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
      <th class="col-xs-2">Info</th>
    </tr>
  </thead>
@foreach( $verbs as $v )

<?php $percent       = round((($v['count'] / $subtotal) * 100), 1); ?>
<?php $percent_overall = round((($v['count'] / $total) * 100), 1); ?>
<?php $verb_url        = URL() . '/lrs/'. $lrs->_id . '/statements/verb/' . $v['verb']['0']; ?>
  
  <tr>
    <td class="hidden-xs">
      <span class="chart pull-left" data-percent="{{ $percent }}"></span>
    </td>
    <td>
      <span class="label label-default">{{ $v['count'] }}</span>
    </td>
    <td>
      <a href="{{ $verb_url }}">{{ $v['verb']['0'] }}</a>
    </td>
    <td>
      <span class="label label-default">{{ $percent }}%</span>
    </td>
    <td>
      <span class="label label-default">{{ $percent_overall }}%</span>
    </td>
    <td>
      <span class="label label-success pull-right">
        <i class="icon icon-chevron-up verb-status" data-toggle="tooltip" 
        data-placement="left" title="Up on average for your LRSs"></i>
      </span>
    </td>
  </tr>
  
@endforeach
</table>