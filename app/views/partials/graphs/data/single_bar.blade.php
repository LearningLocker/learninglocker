<script type="text/javascript">

  var data  = '<?php if(isset($single_bar_data)) echo $single_bar_data; ?>';

  if( data ){

    //split the json string
    var details = data.split(' ');

    //iterate, convert to object and push to category_data
    var bar_data = [];
    $.each(details , function(i, val) {
      bar_data.push(jQuery.parseJSON( val ));
    });

    Morris.Bar({
      element: 'single_bar',
      data: bar_data,
      xkey: 'y',
      barColors:['#354b59'],
      ykeys: ['a'],
      labels: ['Statements']
    });

  }

</script>