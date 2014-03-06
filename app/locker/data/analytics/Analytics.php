<?php namespace Locker\Data\Analytics;

use \Locker\Repository\Query\QueryRepository as Query;

class Analytics extends \app\locker\data\BaseData implements AnalyticsInterface {

  /**
   * Query Repository Interface
   **/
  protected $query;

  /**
   * Construct
   *
   * @param Locker\Repository\Data\QueryRepository $query
   *
   */
  public function __construct( Query $query ){

    //get the LRS connected to this query
    $this->lrs   = '52f174d5e837a05c11000029';
    $this->query = $query;

  }

  public function filter( $options ){

    $since = $until = '';

    //grab the filter object and decode
    if( isset($options['filter']) ){
      $filter = json_decode( $options['filter'], true );
    }else{
      $filter = array();
    }

    //parse over the filter and check for conditions
    $filter = $this->setFilter( $filter );

    //set type if passed
    if( isset( $options['type'] ) ){
      $type = $this->setType( $options['type'] );
    }else{
      $type = $this->setType();
    }

    //set interval if passed
    if( isset( $options['interval'] ) ){
      $interval = $this->setInterval( $options['interval'] );
    }else{
      $interval = $this->setInterval();
    }

    //set since
    if( isset( $options['since'] ) ){
      $since = $this->setMongoDate( $options['since'] );
    }

    //set until
    if( isset( $options['until'] ) ){
      $until = $this->setMongoDate( $options['until'] );
    }

    //build MongoDate if since and / or until submitted
    $dates = $this->buildDates($since, $until);

    //set filters
    if( !empty($dates) ){
      $filters = array_merge( $dates, $filter );
    }else{
      $filters = $filter;
    }

    //get the data
    $data = $this->query->timedGrouping( $this->lrs, $filters, $interval, $type );

    if( !$data || isset($data['errmsg']) ){
      return array('success' => false, 'message' => $data['errmsg'] );
    }

    return array('success' => true, 'data' => $data);

  }

  public function section( $section, $filter='' ){

    if( !$this->verifySection( $section ) || !$this->verifyFilter( $filter ) ){
      return array('success' => false);
    }

    //$data = $this->query->selectSection( '52f174d5e837a05c11000029', 'verbs' );
    $data = $this->query->timedGrouping( array(), 'day' );

    return array('success' => true, 'data' => $data);

  }

  /**
   * Verify route section to make sure we support it.
   *
   * @param string $section The route section
   * @return boolean
   *
   **/
  private function verifySection( $section ){
    switch( $section ){
      case 'agents'    : return true; break;
      case 'verbs'     : return true; break;
      case 'activities': return true; break;
      case 'courses'   : return true; break;
      case 'badges'    : return true; break;
    }
    return false;
  }

  /**
   * Check the filters passed to see if it contains any where criteria.
   *
   * Formats include: 
   * key => value - where key equals value 
   * key => array(foo, bar) - where key equals foo AND bar
   * key => array(array(foo,bar)) - where key equals foo OR bar
   * key => array(array(foo,bar), hello) - where key equals foo OR bar AND hello
   *
   * If there are no $in criteria (we can tell based on whether values = array)
   * then we only need to pass to mongo query as a single array as $and is implied. 
   * However, if multiple criteria, we need to include $and hence the dual
   * approach here.
   *
   * @param  array $options
   * @return array $filter 
   *
   **/
  private function setFilter( $options ){

    $use_and = false;
    $filter  = array();

    if( $options ){
      //loop through submitted filters
      foreach( $options as $key => $value ){
        //if any value is an array, it containes multiple elements so requires $and
        if( is_array($value) ){
          $use_and = true;
        }

      }

      if( !$use_and ){
        foreach( $options as $key => $value ){
          $filter[$key] = $value;
        }
      }else{
        foreach( $options as $key => $value ){
          //loop through this value to check for nested array
          if( is_array($value) ){
            foreach( $value as $v ){
              $in_statement[] = $v;
            }
            $set_in[] = array($key => array('$in' => $in_statement));
          }else{
            $set_in[] = array( $key => $value );
          }
        }
        //we need to use Mongo $and for this type of statement.
        $filter = array('$and' => $set_in );
      }
    }

    return $filter;
  }

  /**
   * Turn submitted date into MongoDate object
   *
   * @return MongoDate object
   *
   **/
  private function setMongoDate( $date ){
    return new \MongoDate(strtotime($date));
  }

  /**
   * Build $match dates for Mongo aggregation
   *
   * @param string $since
   * @param string $until
   *
   * @return array $dates
   *
   **/
  private function buildDates($since='', $until=''){
    if( $since != '' && $until != ''){
      $dates = array( 'created_at' => array( '$gte' => $since, '$lte' => $until));
    }elseif( $since != '' ){
      $dates = array( 'created_at' => array( '$gte' => $since ));
    }elseif( $until != '' ){
      $dates = array( 'created_at' => array( '$lte' => $until));
    }else{
      $dates = array();
    }
    return $dates;
  }

  /**
   * Based on the submitted interval - return Mongo specific
   * identifier.
   *
   * @param string $interval
   * @return string $identifier
   *
   **/
  private function setInterval( $interval='' ){    
    switch( $interval ){
      case 'day'        : return 'dayOfYear';  break;
      case 'dayOfMonth' : return 'dayOfMonth'; break;
      case 'dayOfWeek'  : return 'dayOfWeek';  break;
      case 'week'       : return 'week';       break;
      case 'hour'       : return 'hour';       break;
      case 'month'      : return 'month';      break;
      case 'year'       : return 'year';       break;
      default: return 'dayOfYear';
    }
  }

  /**
   * Based on the submitted type - verify it is valid
   *
   * @param string $type
   * @return $type - default is time
   *
   **/
  private function setType( $type ){
    switch( $type ){
      case 'time'     : return $type; break;
      case 'user'     : return $type; break;
      case 'verb'     : return $type; break;
      case 'activity' : return $type; break;
    }
    return 'time';
  }

}