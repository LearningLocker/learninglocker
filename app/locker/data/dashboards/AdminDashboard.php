<?php namespace app\locker\data\dashboards;

use App\Locker\Repository\Query\EloquentQueryRepository as Query;

class AdminDashboard extends \app\locker\data\BaseData {

  private $user;

  public function __construct(){

    $this->setDb();

    $this->user = \Auth::user(); //we might want to pass user in, for example when use the API
  }

  /**
   * Set all stats array.
   *
   **/
  public function getFullStats(){
    return array(
      'statement_count' => $this->statementCount(),
      'lrs_count'       => $this->lrsCount(),
      'actor_count'     => $this->actorCount(),
      'user_count'      => $this->userCount(),
      'statement_avg'   => $this->statementAvgCount()
    );
  }

  public function getGraphData(\DateTime $startDate = null, \DateTime $endDate = null) {
    return [
      'statement_graph' => $this->getStatementNumbersByDate($startDate, $endDate)
    ];
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
    $mbox =  intval( \Statement::distinct('statement.actor.mbox')->remember(5)->get()->count() );
    $openid =  intval( \Statement::distinct('statement.actor.openid')->remember(5)->get()->count() );
    $mbox_sha1sum =  intval( \Statement::distinct('statement.actor.mbox_sha1sum')->remember(5)->get()->count() );
    $account =  intval( \Statement::distinct('statement.actor.account.name')->remember(5)->get()->count() );
    return ($mbox + $openid + $mbox_sha1sum + $account);
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
    $firstStatement = \DB::collection('statements')
      ->orderBy("timestamp")->first();

    if($firstStatement) {
      $firstDay = date_create(gmdate(
        "Y-m-d",
        strtotime($firstStatement['statement']['timestamp'])
      ));
      $today = date_create(gmdate("Y-m-d", time()));
      $interval = date_diff($firstDay, $today);
      $days = $interval->days + 1;
      return $days;
    } else {
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
  public function getStatementNumbersByDate(\DateTime $startDate = null, \DateTime $endDate = null) {
    // If neither of the dates are set, default to the last 30 days.
    if ($startDate === null && $endDate === null) {
      $startDate = \Carbon\Carbon::now()->subMonth();
      $endDate = \Carbon\Carbon::now();
    }

    // Create the timestamp filter.
    $timestamp = [];
    if ($startDate !== null) $timestamp['$gte'] = new \MongoDate($startDate->getTimestamp());
    if ($endDate !== null) $timestamp['$lte'] = new \MongoDate($endDate->getTimestamp());

    $statements = $this->db->statements->aggregate(
      [
        '$match' => [
          'timestamp'=> $timestamp
        ]
      ], 
      [
        '$group' => [
          '_id'   => [
            'year' => ['$year' => '$timestamp'],
            'month' => ['$month' => '$timestamp'],
            'day' => ['$dayOfMonth' => '$timestamp']
          ],
          'count' => ['$sum' => 1],
          'date'  => ['$addToSet' => '$statement.timestamp'],
          'actor' => ['$addToSet' => '$statement.actor']
        ]
      ],
      [
        '$sort' => ['_id' => 1]
      ], 
      [
        '$project' => [
          'count' => 1, 
          'date' => 1, 
          'actor' => 1
        ]
      ]
    );

    //set statements for graphing
    $data = array();
    if( isset($statements['result']) ){
      foreach( $statements['result'] as $s ){
        $date = substr($s['date'][0],0,10);
        $data[$date] = json_encode( array( "y" => $date, "a" => $s['count'], 'b' => count($s['actor'])) );
      }
    }
    
    // Add empty point in data (fixes issue #265).
    $dates = array_keys($data);

    if( count($dates) > 0 ){
      sort($dates);
      $start = strtotime(reset($dates));
      $end = strtotime(end($dates));

      for($i=$start; $i<=$end; $i+=24*60*60) { 
        $date = date("Y-m-d", $i);
        if(!isset($data[$date])) {
          $data[$date] = json_encode( array( "y" => $date, "a" => 0, 'b' => 0 ) );
        }
      }
    }

    return trim( implode(" ", $data) );

  }

}
