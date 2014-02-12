<script type="text/javascript">

  var data  = '<?php if(isset($line_graph_data)) echo $line_graph_data; ?>';

  if( data ){

    //split the json string
    var details = data.split(' ');

    //iterate, convert to object and push to category_data
    var category_data = [];
    $.each(details , function(i, val) {
      category_data.push(jQuery.parseJSON( val ));
    });

    Morris.Line({
      element: 'multiple_line',
      data: category_data,
      xkey: 'y',
      barColors:['#b85e80'],
      ykeys: ['a', 'b', 'c'],
      labels: ['verbs','verbs','verbs']
    });

  }

</script>