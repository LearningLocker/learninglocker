<?php namespace Locker\Data\Analytics;

/**
* This is all temp and will be replaced by our API driven single
* page analytics app. This will be available in time for v1.0 stable.
*
**/

class Analytics extends \app\locker\data\BaseData implements AnalyticsInterface {

  public $results;
  private $lrs;

  /**
   * Construct
   *
   * @param Locker\Repository\Data\QueryRepository $query
   *
   */
  public function __construct(){

    $this->setDb();
    
  }

  /**
   * The main method to grab appropriate anayltics
   *
   * @param $lrs id The LRS in question
   *
   **/
  public function getAnalytics( $lrs ){

    $this->lrs = $lrs;
    $this->selectAnalytics();

  }

  /**
   * Get the appropriate object that matches the required segment
   *
   * @param $segment   string    The analytics segment required. e.g. badges, verbs etc
   *
   **/
  public function selectAnalytics(){

    $this->results['badges']     = $this->getTopBadges();
    $this->results['activities'] = $this->getTopActivities();
    $this->results['courses']    = $this->getTopCourses();
    $this->verbCloud(); 

  }

  /**
   * Get the top 6 verbs being used in statements
   *
   * @todo move this query to the query class
   *
   **/
  public function verbCloud(){
      
      //$verb = reset($verb.display)
      $match = $this->getMatch( $this->lrs ); 
      $this->results['verbs']  = $this->db->statements->aggregate(
                  array('$match' => $match),
                  array('$group' => array('_id'   => '$verb.id', 
                                  'count' => array('$sum' => 1),
                                  'verb'  => array('$addToSet' => '$verb.display'),)),
                  array('$sort'    => array('count' => -1)),
                  array('$limit'   => 6)
                );

      $this->results['verbs']['total'] = \Statement::where('context.extensions.http://learninglocker&46;net/extensions/lrs._id', $this->lrs)
                         //->remember(5)
                         ->count();

    }

  /**
   * Get the top 6 activities
   *
   * @todo move this query to the query class
   *
   **/
  public function getTopActivities(){

      $match = $this->getMatch( $this->lrs ); 
      return $this->db->statements->aggregate(
                  array('$match' => $match),
                  array('$group' => array('_id'   => '$object.id',
                        'name'  => array('$addToSet' => '$object.definition.name'), 
                        'count' => array('$sum' => 1))),
                  array('$sort'  => array('count' => -1)),
                  array('$limit' => 7)
                );

    }

  /**
   * Get the top 6 activities
   *
   * @todo move this query to the query class
   *
   **/
  public function getTopCourses(){

      return $this->db->statements->aggregate(
                 // array('$match' => $match),
                  array('$match' => array('context.extensions.http://learninglocker&46;net/extensions/lrs._id' => $this->lrs,
                                          'context.contextActivities.grouping.type' => 'http://adlnet.gov/expapi/activities/course')),
                  array('$group' => array('_id' => '$context.contextActivities.grouping.id',
                        'name'  => array('$addToSet' => '$context.contextActivities.grouping.definition.name'), 
                        'count' => array('$sum' => 1))),
                  array('$sort'  => array('count' => -1)),
                  array('$limit' => 8)
                );

    }

    /**
   * Get the top 6 activities
   *
   * @todo move this query to the query class
   *
   **/
  public function getTopBadges(){

      return $this->db->statements->aggregate(
                 // array('$match' => $match),
                  array('$match' => array('context.extensions.http://learninglocker&46;net/extensions/lrs._id' => $this->lrs,
                                          'object.definition.type' => 'http://activitystrea.ms/schema/1.0/badge')),
                  array('$group' => array('_id' => '$object.id',
                        'name'  => array('$addToSet' => '$object.definition.name'), 
                        'count' => array('$sum' => 1))),
                  array('$sort'  => array('count' => -1)),
                  array('$limit' => 9)
                );

  }

}