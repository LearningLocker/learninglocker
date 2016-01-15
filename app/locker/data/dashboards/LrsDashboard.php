<?php namespace app\locker\data\dashboards;

class LrsDashboard extends BaseDashboard {

  public $stats;
  private $user,$statements=array();

  public function __construct( $lrs ){
    parent::__construct();
    $this->lrs = $lrs;
    $this->has_lrs = true;
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

}
