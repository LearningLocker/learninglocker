<?php namespace app\locker\data\dashboards;

class BaseDashboard extends \app\locker\data\BaseData {

  protected $has_lrs = false;

  public function __construct() {
    $this->setDb();
  }

  /**
   * Set all stats array.
   *
   **/
  public function getStats(){
    return array(
      'statement_count' => $this->statementCount(),
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

    $query = \DB::collection('statements');

    //Limit by LRS
    if( $this->has_lrs ){
      $query->where('lrs_id', new \MongoId($this->lrs));
    }

    return $query->remember(5)->count();
  }

  /**
   * Get a count of all the days from the first day a statement was submitted to Lrs.
   *
   * @return $days number
   *
   **/
  protected function statementDays(){
    $firstStatement = \DB::collection('statements');

    if( $this->has_lrs ){
      $firstStatement->where('lrs_id', new \MongoId($this->lrs));
    }
      
    $firstStatement = $firstStatement->orderBy("timestamp")->first();

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
   * Count the number of distinct actors within LRS statements.
   * @todo use more than just mbox
   *
   * @return count.
   *
   **/
  public function actorCount(){
    $base_match = [];
    if( $this->has_lrs ){
      $base_match['lrs_id'] = new \MongoId($this->lrs);
    }

    $count_array = ['mbox' => '', 'openid' => '', 'mbox_sha1sum' => '', 'account' => ''];
    
    $count_array['mbox'] = $this->db->statements->aggregate([
      ['$match' => array_merge($base_match, ['statement.actor.mbox' => ['$exists' => true]])],
      ['$group' => ['_id' => '$statement.actor.mbox']],
      ['$group' => ['_id' => 1, 'count' => ['$sum' => 1]]]
    ]);
    
    $count_array['openid'] = $this->db->statements->aggregate([
      ['$match' => array_merge($base_match, ['statement.actor.openid' => ['$exists' => true]])],
      ['$group' => ['_id' => '$statement.actor.openid']],
      ['$group' => ['_id' => 1, 'count' => ['$sum' => 1]]]
    ]);
    
    $count_array['mbox_sha1sum'] = $this->db->statements->aggregate([
      ['$match' => array_merge($base_match, ['statement.actor.mbox_sha1sum' => ['$exists' => true]])],
      ['$group' => ['_id' => '$statement.actor.mbox_sha1sum']],
      ['$group' => ['_id' => 1, 'count' => ['$sum' => 1]]]
    ]);
    
    $count_array['account'] = $this->db->statements->aggregate([
      ['$match' => array_merge($base_match, ['statement.actor.account' => ['$exists' => true]])],
      ['$group' => ['_id' => ['accountName' => '$statement.actor.account.name', 'accountHomePage' => '$statement.actor.account.homePage']]],
      ['$group' => ['_id' => 1, 'count' => ['$sum' => 1]]]
    ]);

    $summary = 0;
    foreach ($count_array as $key => $val) {
        if( isset($val['result'][0]) ){
          $summary += $val['result'][0]['count'];
        }
    }
    
    return $summary;
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

        $match = [
          'timestamp'=> $timestamp
        ];

        if( $this->has_lrs ){
          $match['lrs_id'] = new \MongoId($this->lrs);
        }

        $statements = $this->db->statements->aggregate(
          [
            '$match' => $match
          ], 
          [
            '$project' => [
              'year' => ['$year' => '$timestamp'],
              'month' => ['$month' => '$timestamp'],
              'day' => ['$dayOfMonth' => '$timestamp'],
              'actor' => '$statement.actor'
            ]
          ],
          [
            '$group' => [
              '_id'   => [
                'year' => '$year',
                'month' => '$month',
                'day' => '$day'
              ],
              'count' => ['$sum' => 1],
              'actors' => ['$addToSet' => '$actor']  
            ]
          ],
          [
            '$sort' => ['_id' => 1]
          ], 
          [
            '$project' => [
              'a' => '$count',
              'b' => ['$size' => '$actors'],
              'y' => ['$concat' => [
                     [ '$substr' => [ '$_id.year', 0, 4 ] ],
                     '-',
                     [ '$cond' => [
                         [ '$lte' => [ '$_id.month', 9 ] ],
                         [ '$concat' => [
                             '0',
                             [ '$substr' => [ '$_id.month', 0, 2 ] ],
                         ]],
                         [ '$substr' => [ '$_id.month', 0, 2 ] ]
                     ]],
                     '-',
                     [ '$cond' => [
                         [ '$lte' => [ '$_id.day', 9 ] ],
                         [ '$concat' => [
                             '0',
                             [ '$substr' => [ '$_id.day', 0, 2 ] ],
                         ]],
                         [ '$substr' => [ '$_id.day', 0, 2 ] ]
                     ]]
                 ]
             ],
            ]
          ]
        );

        //set statements for graphing
        $data = array();
        if( isset($statements['result']) ){
          foreach( $statements['result'] as $s ){
            $data[$s['y']] = json_encode( $s );
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