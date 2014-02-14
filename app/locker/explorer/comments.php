<?php namespace app\locker\explorer;

class Comments {

  private $comments;

  public function __construct( $comments ){

    $this->comments = $comments;

  }

  public function stats(){

    $count    = $this->count( $this->comments );
    $learners = $this->learners( $this->comments );

    return array( 'count'    => $count, 
            'learners' => $learners );

  }

  private function count( $statements ){
    return count( $statements );
  }

  private function learners( $statements ){
    return 0;
  }

}