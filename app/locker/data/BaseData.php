<?php namespace app\locker\data;

class BaseData {

  protected $db;

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
    return array('context.extensions.http://learninglocker&46;net/extensions/lrs._id' => $lrs);
  }

}