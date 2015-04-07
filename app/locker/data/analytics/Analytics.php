<?php namespace Locker\Data\Analytics;

use \Locker\Repository\Query\QueryRepository as QueryRepo;
use \Locker\Helpers\Exceptions as Exceptions;

class Analytics extends \app\locker\data\BaseData implements AnalyticsInterface {

  protected $query;

  /**
   * @param QueryRepo $query
   */
  public function __construct(QueryRepo $query) {
    $this->query = $query;
  }

  private function getOption(array $options, $key, $default = null, callable $modifier = null) {
    $modifier = $modifier !== null ? $modifier : function ($val) { return $val; };
    return isset($options[$key]) ? $modifier($options[$key]) : $default;
  }

  private function getDateOption(array $options, $key, $default = '') {
    return $this->getOption($options, $key, $default, function ($val) {
      return $this->setMongoDate($val);
    });
  }

  /**
   * Gets analytic data.
   * @param string $lrs 
   * @param object $options
   * @return array
   **/
  public function analytics($lrs, $options) {
    // Decode filter option.
    $filter = $this->getOption($options, 'filter', [], function ($val) {
      return json_decode($val, true);
    });

    $type = $this->setType(
      $this->getOption($options, 'type', 'time')
    );

    $interval = $this->getOption($options, 'interval', $this->setInterval(), function ($val) {
      return $this->setInterval($val);
    });

    // Constructs date filtering.
    $since = $this->getDateOption($options, 'since');
    $until = $this->getDateOption($options, 'until');
    $dates = $this->buildDates($since, $until);

    $filters = empty($dates) ? $filter : array_merge($dates, $filter);

    $data = $this->query->timedGrouping($lrs, $filters, $interval, $type);
    $data = $data ? $data : ['result' => null];

    if (isset($data['errmsg'])) {
      throw new Exceptions\Exception(trans('apps.no_data'));
    }
    return $data['result'];
  }

  /**
   * Named routes that focus on specific sections e.g agents, verbs,
   * activites, results, courses, badges
   *
   * @param string $section
   * @param object $filter
   * @param object $filter
   *
   * @return array
   *
   **/
  public function section( $lrs, $section, $filter, $returnFields='' ){

    if( !$section = $this->setSection( $section ) ){
      return array('success' => false);
    }

    //grab the filter object and decode
    if( isset($filter) && !empty($filter) ){
      $filter = json_decode( $filter, true );
    }else{
      $filter=array();
    }

    //if section is courses or badges, add appropriate filter for the $match pipe
    switch( $section ){
      case 'courses': 
        $filter = array_merge( $filter, array('statement.context.contextActivities.grouping.type' => 'http://adlnet.gov/expapi/activities/course'));
        break;
      case 'badges': 
        $filter = array_merge( $filter, array('statement.object.definition.type' => 'http://activitystrea.ms/schema/1.0/badge'));
        break;
    }

    //grab returnFields and decode
    if( $returnFields != '' ){
      $returnFields = json_decode( $returnFields, true );
    }

    //parse over the filter and check for conditions
    $filter = $this->setFilter( $filter );

    $data = $this->query->objectGrouping( $lrs, $section, $filter, $returnFields );

    return array('success' => true, 'data' => $data);

  }

  /**
   * Set section.
   *
   * @param string $section The route section
   * @return boolean
   *
   **/
  private function setSection( $section ){
    switch( $section ){
      case 'agents': 
        return '$actor'; 
        break;
      case 'verbs': 
        return '$verb'; 
        break;
      case 'activities': 
        return '$object'; 
        break;
      case 'results': 
        return '$result'; 
        break;
      case 'courses': 
        return true; 
        break;
      case 'badges': 
        return true; 
        break;
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
    $set_in  = array();
    $set_inbetween = array();

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
          $in_statement = array();
          //loop through this value to check for nested array
          if( is_array($value) && sizeof($value) > 0 ){
            //is it an in request, or a between two values request?
            if( $value[0] == '<>' ){
              $set_inbetween[$key] = array('$gte' => (int) $value[1], '$lte' => (int) $value[2]);
            }else{
              foreach( $value as $v ){
                $in_statement[] = $v;
              }
              $set_in[] = array($key => array('$in' => $in_statement));
            }
          }else{
            //if not an array or an empty array, set key/value
            $set_in[] = array( $key => $value );
          }
        
        }
        //we need to use Mongo $and for this type of statement.
        if( !empty($set_in) ){
          $filter = array('$and' => $set_in );
        }

        //now merge and and between if available
        if( !empty($filter) && !empty($set_inbetween) ){
          $filter = array_merge($filter, $set_inbetween);
        }elseif( !empty($set_inbetween) ){
          $filter = $set_inbetween; //just use in_between
        }else{
          //do nothing
        }
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
      $dates = array( 'timestamp' => array( '$gte' => $since, '$lte' => $until));
    }elseif( $since != '' ){
      $dates = array( 'timestamp' => array( '$gte' => $since ));
    }elseif( $until != '' ){
      $dates = array( 'timestamp' => array( '$lte' => $until));
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
      case 'day'        : return '$dayOfYear';  break;
      case 'dayOfMonth' : return '$dayOfMonth'; break;
      case 'dayOfWeek'  : return '$dayOfWeek';  break;
      case 'week'       : return '$week';       break;
      case 'hour'       : return '$hour';       break;
      case 'month'      : return '$month';      break;
      case 'year'       : return '$year';       break;
      default: return '$dayOfYear';
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