<script type="text/javascript">

  var data = '<?php if(isset($stats['category_graph'])) echo $stats['category_graph']; ?>';

  if( data ){

    //split the json string
    var details = data.split(' ');

    //iterate, convert to object and push to category_data
    var category_data = [];
    $.each(details , function(i, val) {
      category_data.push(jQuery.parseJSON( val ));
    });

    Morris.Donut({
      element: 'donut-example',
      data: category_data,
      //colors: ['#f89406', '#b85e80', 'rgb(104, 163, 213)', 'rgb(129, 189, 130)', '#343e4b', '#222'],
    });

  }

</script>