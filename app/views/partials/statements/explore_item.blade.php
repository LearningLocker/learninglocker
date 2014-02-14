<div class="row">
  <div class="col-xs-12 col-sm-12 col-lg-12">
    <div class="statement-row clearfix">

      <?php
        $display = new \app\locker\statements\StatementDisplay;
        echo $display->displayStatement( $statement, $lrs, 'commentsActor' );
      ?>

    </div>
  </div>
</div>