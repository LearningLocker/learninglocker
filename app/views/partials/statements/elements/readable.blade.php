<div class="bordered">
  <?php
    $display = new \app\locker\statements\StatementDisplay;
    echo $display->displayStatement( $statement, $lrs, 'simpleTable' );
  ?>
</div>