<?php namespace app\locker\data;

class BaseData {

  // protected $db;

  protected function setDB(){
    $this->db = \DB::getMongoDB();
  }

  /**
   * getMatch is used to match mongo aggregation searches to a specific LRS.
   *
   * @param  lrs     int    The LRS id
   * @return array
   *
   **/
  protected function getMatch( $lrs ){
    return array('lrs._id' => $lrs);
  }

}