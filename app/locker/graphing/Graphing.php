<?php namespace Locker\Graphing;

class Graphing implements GraphingInterface {

  public function morrisLineGraph( $data ){
    $set_data = '';
    foreach( $data as $d ){
      $set_data .= json_encode( array( "y" => substr($d['date'][0],0,10), "a" => rand ( 10,  85), 
                                       "b" => rand ( 10,  22),
                                       "c" => rand ( 10,  37)) ) . ' ';
    }
    return trim( $set_data );
  }

}