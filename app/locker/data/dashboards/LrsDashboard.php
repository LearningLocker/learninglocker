<?php namespace app\locker\data\dashboards;

class LrsDashboard extends \app\locker\data\BaseData {

  public $stats;
  private $user,$statements=array();

  public function __construct( $lrs ){

    $this->setDb();

    $this->lrs = $lrs;

  }

  /**
   * Set all stats array.
   *
   **/
  public function setTimelineGraph(){
    return array('statement_count' => $this->statementCount(),
                 'statement_avg'   => $this->statementAvgCount(),
                 'learner_avg'     => $this->learnerAvgCount(),
                 'statement_graph' => $this->getStatementNumbersByDate()
                 );      
  }

  /**
   * Count all statements in Learning Locker
   *
   * @return count
   *
   **/
  public function statementCount(){
    return \DB::collection('statements')
    ->where('lrs._id', $this->lrs)
    ->remember(5)
    ->count();
  }

  /**
   * Count the number of distinct actors within LRS statements.
   * @todo use more than just mbox
   *
   * @return count.
   *
   **/
  public function actorCount(){

    $count = $this->db->statements->aggregate(
              array('$match' => $this->getMatch( $this->lrs )),
              array('$group' => array('_id' => '$statement.actor.mbox')),
              array('$group' => array('_id' => 1, 'count' => array('$sum' => 1)))             
              );
          
    if( isset($count['result'][0]) ){
      return $count['result'][0]['count'];
    }else{
      return 0;
    }
   
  }

  /**
   * Get a count of all the days from the first day a statement was submitted to Lrs.
   *
   * @return $days number
   *
   **/
  private function statementDays(){
    $first_day = \DB::collection('statements')->first();
    if( $first_day ){
      $datetime1 = date_create( gmdate("Y-m-d", strtotime($first_day['statement']['stored']) ) );
      $datetime2 = date_create( gmdate("Y-m-d", time()) );
      $interval  = date_diff($datetime1, $datetime2);
      $days      = $interval->days;
      return $days;
    }else{
      return '';
    }

  }

  /**
   * Using the number of days the LRS has been running with statements
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
   * Get the top 6 activities
   *
   **/
  public function getTopActivities(){

    $match = $this->getMatch( $this->lrs ); 
    return $this->db->statements->aggregate(
                array('$match' => $match),
                array('$group' => array('_id'   => '$statement.object.id',
                      'name'  => array('$addToSet' => '$statement.object.definition.name.en-US'), 
                      'count' => array('$sum' => 1))),
                array('$sort'  => array('count' => -1)),
                array('$limit' => 6)
              );

  }

  /**
   * Get the top 7 most active users
   *
   **/
  public function getActiveUsers(){

    $match = $this->getMatch( $this->lrs ); 
    return $this->db->statements->aggregate(
                array('$match' => $match),
                array('$group' => array('_id'   => '$statement.actor.mbox',
                      'name'   => array('$addToSet' => '$statement.actor.name'),
                      'mbox'   => array('$addToSet' => '$statement.actor.mbox'),
                      'count'  => array('$sum' => 1))),
                array('$sort'  => array('count' => -1)),
                array('$limit' => 5)
              );

  }

  /**
   * Using the number of days the LRS has been running with statements
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
      $avg = round( ($count / $days), 2 );
    }
    return $avg;
  }

  /**
   * Get a count of statements on each day the lrs has been active.
   *
   * @return $data json feed.
   *
   **/
  public function getStatementNumbersByDate(){

    $set_id = array( '$dayOfYear' => '$created_at' );

    $statements = $this->db->statements->aggregate(
      array('$match' => $this->getMatch( $this->lrs )),
      array(
        '$group' => array(
          '_id'   => $set_id,
          'count' => array('$sum' => 1),
          'date'  => array('$addToSet' => '$statement.stored'),
          'actor' => array('$addToSet' => '$statement.actor')
        )
      ),
      array('$sort'    => array('_id' => 1)),
      array('$project' => array('count' => 1, 'date' => 1, 'actor' => 1))
    );
   
    //set statements for graphing
    $data = '';
    if( isset($statements['result']) ){
      foreach( $statements['result'] as $s ){
        $data .= json_encode( array( "y" => substr($s['date'][0],0,10), "a" => $s['count'], 'b' => count($s['actor'])) ) . ' ';
      }
    }

    return trim( $data );

  }

}