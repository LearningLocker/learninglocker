<script type="text/javascript">

  var data  = '<?php if(isset($stats['statement_graph'])) echo $stats['statement_graph']; ?>';
  var avg   = '<?php if(isset($stats['statement_avg'])) echo $stats['statement_avg']; else echo 0; ?>';

  var totals   = '<?php echo Lang::get('site.statement_total'); ?>';
  var learners = '<?php echo Lang::get('site.learner_number'); ?>';

  if( data ){

    //split the json string
    var details = data.split(' ');

    //iterate, convert to object and push to category_data
    var category_data = [];
    $.each(details , function(i, val) {
      category_data.push(jQuery.parseJSON( val ));
    });
    
    Morris.Line({
      element: 'dashboard',
      data: category_data,
      xkey: 'y',
      goals: [avg],
      goalStrokeWidth: 2,
      goalLineColors: ['#00cc00'],
      barColors:['#354b59'],
      ykeys: ['a', 'b'],
      labels: [totals, learners]
    });

  }

</script>