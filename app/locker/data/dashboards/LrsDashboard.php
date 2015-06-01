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
  public function getStats(){
    return array(
      'statement_count' => $this->statementCount(),
      'statement_avg'   => $this->statementAvgCount(),
      'actor_count'     => $this->actorCount()
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
    $count_array = ['mbox' => '', 'openid' => '', 'mbox_sha1sum' => '', 'account' => ''];
    
    $count_array['mbox'] = $this->db->statements->aggregate(
            ['$match' => $this->getMatch( $this->lrs )],
            ['$group' => ['_id' => '$statement.actor.mbox']],
            ['$group' => ['_id' => 1, 'count' => ['$sum' => 1]]]
    );
    
    $count_array['openid'] = $this->db->statements->aggregate(
            ['$match' => $this->getMatch( $this->lrs )],
            ['$group' => ['_id' => '$statement.actor.openid']],
            ['$group' => ['_id' => 1, 'count' => ['$sum' => 1]]]
    );
    
    $count_array['mbox_sha1sum'] = $this->db->statements->aggregate(
            ['$match' => $this->getMatch( $this->lrs )],
            ['$group' => ['_id' => '$statement.actor.mbox_sha1sum']],
            ['$group' => ['_id' => 1, 'count' => ['$sum' => 1]]]
    );
    
    $count_array['account'] = $this->db->statements->aggregate(
            ['$match' => $this->getMatch( $this->lrs )],
            ['$group' => ['_id' => ['accountName' => '$statement.actor.account.name', 'accountHomePage' => '$statement.actor.account.homePage']]],
            ['$group' => ['_id' => 1, 'count' => ['$sum' => 1]]]
    );

    $summary = 0;
    foreach ($count_array as $key => $val) {
        if( isset($val['result'][0]) ){
          $summary += $val['result'][0]['count'];
        }
    }
    
    return $summary;
  }

  /**
   * Get a count of all the days from the first day a statement was submitted to Lrs.
   *
   * @return $days number
   *
   **/
  private function statementDays(){
    $firstStatement = \DB::collection('statements')
      ->where('lrs._id', $this->lrs)
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
   * Get the top 6 activities
   *
   **/
  public function getTopActivities(){

    $match = $this->getMatch( $this->lrs );
    return $this->db->statements->aggregate(
                array('$match' => $match),
                array('$group' => array('_id'   => '$statement.object.id',
                      'name'  => array('$addToSet' => '$statement.object.definition.name'),
                      'description' => array('$addToSet' => '$statement.object.definition.description'),
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
    return $this->db->statements->aggregate([
      '$match' => $match
    ], [
      '$group' => [
        '_id' => [
          'mbox' => '$statement.actor.mbox',
          'mbox_sha1sum' => '$statement.actor.mbox_sha1sum',
          'openid' => '$statement.actor.openid',
          'account' => '$statement.actor.account'
        ],
        'names' => ['$addToSet' => '$statement.actor.name'],
        'count' => ['$sum' => 1]
      ]
    ], [
      '$sort'  => ['count' => -1]
    ], [
      '$limit' => 5
    ]);
  }

  /**
   * Get a count of statements on each day the lrs has been active.
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
          'timestamp' => $timestamp,
          'lrs._id' => $this->lrs
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
