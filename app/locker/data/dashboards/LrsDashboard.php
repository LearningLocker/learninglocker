<?php namespace app\locker\data\dashboards;

class LrsDashboard extends \app\locker\data\BaseData {

  public $stats;
  private $user,$statements=array();

  public function __construct( $lrs ){

    $this->setDb();

    $this->lrs = $lrs;

    $this->setFullStats();

  }

  /**
   * Set all stats array.
   *
   **/
  public function setFullStats(){
    $this->stats = array('statement_count' => $this->statementCount(),
                         'statement_avg'   => $this->statementAvgCount(),
                         'learner_avg'     => $this->learnerAvgCount(),
                         'statement_graph' => $this->getStatementNumbersByDate(),
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
    ->where('context.extensions.http://learninglocker&46;net/extensions/lrs._id', $this->lrs)
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
              array('$group' => array('_id' => '$actor.mbox')),
              array('$group' => array('_id' => 1, 'count' => array('$sum' => 1)))             
              );
          
    if( isset($count['result'][0]) ){
      return $count['result'][0]['count'];
    }else{
      return 0;
    }
   
  }

  /**
   * Count the number of distinct activity ids.
   *
   * @return count.
   *
   **/
  public function sourceCount(){

    $count = $this->db->statements->aggregate(
              array('$match' => $this->getMatch( $this->lrs )),
              array('$group' => array('_id' => '$object.id')),
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
      $datetime1 = date_create( gmdate("Y-m-d", $first_day['created_at']->sec) );
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
    $avg   = 0;
    if( $count && $days ){
      $avg = round( $count / $days );
    }
    return $avg;
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
    $avg   = 0;
    if( $count && $days ){
      $avg = round( $count / $days );
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

    $statements = $this->db->statements->aggregate(
      array('$match' => $this->getMatch( $this->lrs )),
      array(
        '$group' => array(
          '_id'   => array('$dayOfYear' => '$created_at'),
          'count' => array('$sum' => 1),
          'date'  => array('$addToSet' => '$stored'),
          'actor' => array('$addToSet' => '$actor')
        )
      ),
      array('$sort'    => array('_id' => 1)),
      array('$project' => array('count' => 1, 'date' => 1, 'actor' => 1))
    );
    
    //set statements for graphing
    $data = '';
    foreach( $statements['result'] as $s ){
      //@todo check we are only counting Actor objectType 'Agent' and it is distinct
      $data .= json_encode( array( "y" => substr($s['date'][0],0,10), "a" => $s['count'], 'b' => count($s['actor'])) ) . ' ';
    }

    return trim( $data );

  }

}