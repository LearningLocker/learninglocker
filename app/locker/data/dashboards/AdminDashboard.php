<?php namespace app\locker\data\dashboards;

class AdminDashboard extends \app\locker\data\BaseData {

  public $stats;
  private $user;

  public function __construct(){

    $this->setDb();

    $this->user = \Auth::user(); //we might want to pass user in, for example when use the API

    $this->setFullStats();

  }

  /**
   * Set all stats array.
   *
   **/
  public function setFullStats(){
    $this->stats = array('statement_count' => $this->statementCount(),
                         'lrs_count'       => $this->lrsCount(),
                         'actor_count'     => $this->actorCount(),
                         'user_count'      => $this->userCount(),
                         'statement_graph' => $this->getStatementNumbersByDate(),
                         'statement_avg'   => $this->statementAvgCount(),
                         'learner_avg'     => $this->learnerAvgCount()
                        );
  }

  /**
   * Count all statements in Learning Locker
   *
   * @return count
   *
   **/
  public function statementCount(){
    return \DB::collection('statements')->remember(5)->count();
  }

  /**
   * Count all LRSs in Learning Locker
   *
   * @return count
   *
   **/
  public function lrsCount(){
    return \DB::collection('lrs')->remember(5)->count();
  }

  /**
   * Count the number of distinct actors within Learning Locker statements.
   *
   * @return count.
   *
   **/
  public function actorCount(){
    return count( \Statement::distinct('statement.actor.mbox')->remember(5)->get() );
  }

  /**
   * Count the number of users in Learning Locker.
   *
   * @return count.
   *
   **/
  public function userCount(){
    return \DB::collection('users')->remember(5)->count();
  }

  /**
   * Get a count of all the days from the first day a statement was submitted to Learning Locker.
   *
   * @return $days number
   *
   **/
  private function statementDays(){
    $first_day = \DB::collection('statements')->first();
    if( $first_day ){
      $datetime1 = date_create( gmdate("Y-m-d", $first_day['timestamp']->sec) );
      $datetime2 = date_create( gmdate("Y-m-d", time()) );
      $interval  = date_diff($datetime1, $datetime2);
      $days      = $interval->days;
      return $days;
    }else{
      return '';
    }
  }

  /**
   * Using the number of days Learning Locker has been running with statements
   * work out the average number of statements per day.
   *
   * @return $avg
   *
   **/
  public function statementAvgCount(){
    $count = $this->statementCount();
    $days  = $this->statementDays();
    if( $days == 0 ){
      //this will be the first day, so increment to 1
      $days = 1;
    }
    $avg   = 0;
    if( $count && $days ){
      $avg = round( $count / $days );
    }
    return $avg;
  }

  /**
   * Using the number of days Learning Locker has been running with statements
   * work out the average number of learners participating per day.
   *
   * @return $avg
   *
   **/
  public function learnerAvgCount(){
    $count = $this->actorCount();
    $days  = $this->statementDays();
    if( $days == 0 ){
      //this will be the first day, so increment to 1
      $days = 1;
    }
    $avg   = 0;
    if( $count && $days ){
      $avg = round( $count / $days );
    }
    return $avg;
  }

  /**
   * Get a count of statements on each day Learning Locker has been active.
   *
   * @return $data json feed.
   *
   **/
  public function getStatementNumbersByDate(){

    $set_id = array( '$dayOfYear' => '$timestamp' );

    $statements = $this->db->statements->aggregate(
              array('$group' => array(
                        '_id'   => $set_id,
                        'count' => array('$sum' => 1),
                        'date'  => array('$addToSet' => '$statement.timestamp'),
                        'actor' => array('$addToSet' => '$statement.actor'))),
              array('$sort'    => array('_id' => 1)),
              array('$project' => array('count' => 1, 'date' => 1, 'actor' => 1))
            );

    //set statements for graphing
    $data = array();
    if( isset($statements['result']) ){
      foreach( $statements['result'] as $s ){
        $date = substr($s['date'][0],0,10);
        $data[$date] = json_encode( array( "y" => $date, "a" => $s['count'], 'b' => count($s['actor'])) );
      }
    }

    // Add empty point in data
    $dates = array_keys($data);
    sort($dates);
    $start = strtotime(reset($dates));
    $end = strtotime(end($dates));
     
    for($i=$start; $i<=$end; $i+=24*60*60) { 
      $date = date("Y-m-d", $i);
      if(!isset($data[$date])) {
        $data[$date] = json_encode( array( "y" => $date, "a" => 0, 'b' => 0 ) );
      }
    }

    return trim( implode(" ", $data) );

  }

}