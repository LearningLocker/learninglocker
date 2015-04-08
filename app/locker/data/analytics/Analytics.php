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

  /**
   * Gets a option from options.
   * @param [String => Mixed] $options
   * @param String $key Name of the option.
   * @param Mixed $default Default value if option isn't defined. Defaults to null.
   * @param Callable $modifier A function to modify the option value if defined. Defaults to null.
   * @return MongoDate
   */
  private function getOption(array $options, $key, $default = null, callable $modifier = null) {
    $modifier = $modifier !== null ? $modifier : function ($val) { return $val; };
    return isset($options[$key]) ? $modifier($options[$key]) : $default;
  }

  /**
   * Gets a date option from options.
   * @param [String => Mixed] $options
   * @param String $key Name of the option.
   * @param Mixed $default Default value if option isn't defined. Defaults to ''.
   * @return MongoDate
   */
  private function getDateOption(array $options, $key, $default = '') {
    return $this->getOption($options, $key, $default, function ($val) {
      return $this->setMongoDate($val);
    });
  }

  /**
   * Adds date filters from $options to $filters.
   * @param [String => Mixed] $options
   * @param [String => Mixed] $filters
   * @return [String => Mixed]
   */
  private function addDateFilters(array $options, array $filters) {
    $since = $this->getDateOption($options, 'since');
    $until = $this->getDateOption($options, 'until');
    $dates = $this->buildDates($since, $until);
    $filters = empty($dates) ? $filters : array_merge($dates, $filters);
    return $filters;
  }

  /**
   * Gets statements.
   * @param String $lrs_id Id of the LRS.
   * @param [String => Mixed] $options
   * @param [String] $sections Parts of the statement to be retrieved. Defaults to all.
   * @return [[String => Mixed]]
   **/
  public function statements($lrs_id, array $options, array $sections = null) {
    $sections = $sections ?: [];
    $filters = $this->addDateFilters($options, $this->constructFilter($options));

    // Gets the filtered data.
    $data = $this->query->selectStatements($lrs, $filters, true, $sections);

    // Attempts to return the filtered data.
    if (isset($data['errmsg'])) {
      throw new Exceptions\Exception($data['errmsg']);
    }
    return Helpers::replaceHtmlEntity($data);;
  }

  /**
   * Gets timed grouping of statements.
   * @param String $lrs_id Id of the LRS.
   * @param [String => Mixed] $options
   * @return [[String => Mixed]]
   **/
  public function timedGrouping($lrs_id, array $options) {
    $filters = $this->addDateFilters(
      $options,
      $this->setFilter($this->constructFilter($options))
    );

    // Gets the type option.
    $type = $this->setType(
      $this->getOption($options, 'type', 'time')
    );

    // Gets the interval option.
    $interval = $this->getOption($options, 'interval', $this->setInterval(), function ($val) {
      return $this->setInterval($val);
    });

    // Gets the filtered data.
    $data = $this->query->timedGrouping($lrs_id, $filters, $interval, $type);
    $data = $data ? $data : ['result' => null];

    // Attempts to return the filtered data.
    if (isset($data['errmsg'])) {
      throw new Exceptions\Exception($data['errmsg']);
    }
    return $data['result'];
  }

  private function constructFilter($options) {
    // Decode filter option.
    $filter = $this->getOption($options, 'filter', [], function ($val) {
      return json_decode($val, true);
    });

    return $filter;
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
   * @param [String => Mixed] $options
   * @return [String => Mixed] $filter
   **/
  private function setFilter(array $options) {
    $use_and = false;
    $filter  = [];
    $set_in  = [];
    $set_inbetween = [];

    if ($options) {
      foreach ($options as $key => $value) {
        // Multiple elements so require '$and'.
        if (is_array($value)) {
          $use_and = true;
        }

      }

      if (!$use_and) {
        foreach ($options as $key => $value) {
          $filter[$key] = $value;
        }
      } else {
        foreach ($options as $key => $value) {
          $in_statement = [];

          if (is_array($value) && count($value) > 0) {
            // Uses between ('<>') or in filter.
            if ($value[0] == '<>') {
              $set_inbetween[$key] = ['$gte' => (int) $value[1], '$lte' => (int) $value[2]];
            } else {
              foreach ($value as $v) {
                $in_statement[] = $v;
              }
              $set_in[] = [$key => ['$in' => $in_statement]];
            }
          } else {
            $set_in[] = [$key => $value];
          }

        }

        // Use Mongo $and for this type of statement.
        if (!empty($set_in)) {
          $filter = ['$and' => $set_in];
        }

        // Merges `and` and `between` if available.
        if (!empty($filter) && !empty($set_inbetween)) {
          $filter = array_merge($filter, $set_inbetween);
        } elseif (!empty($set_inbetween)) {
          $filter = $set_inbetween;
        }
      }
    }

    return $filter;
  }

  /**
   * Turn submitted date into MongoDate object
   * @param String $date A string representation of the date.
   * @return MongoDate object
   **/
  private function setMongoDate($date) {
    return new \MongoDate(strtotime($date));
  }

  /**
   * Build $match dates for Mongo aggregation.
   * @param string $since
   * @param string $until
   * @return [String => [String => Mixed]]
   **/
  private function buildDates($since = '', $until = '') {
    $dates = [];

    if ($since !== '' || $until !== '') {
      $timestamp = [];
      if ($since !== '') {
        $timestamp['$gte'] = $since;
      }
      if ($until !== '') {
        $timestamp['$lte'] = $until;
      }
      $dates = ['timestamp' => $timestamp];
    }

    return $dates;
  }

  /**
   * Gets and validates the Mongo interval.
   * @param String $interval
   * @return String Mongo interval (Defaults to '$dayOfYear').
   *
   **/
  private function setInterval($interval = '') {
    $interval = $interval === '' ? 'day' : $interval;

    // Defines the acceptable intervals and their Mongo counterpart.
    $intervals = [
      'day' => '$dayOfYear',
      'dayOfMonth' => '$dayOfMonth',
      'dayOfWeek' => '$dayOfWeek',
      'week' => '$week',
      'hour' => '$hour',
      'month' => '$month',
      'year' => '$year'
    ];

    // Validates the interval.
    if (!isset($intervals[$interval])) {
      throw new Exceptions\Exception("'$interval' is not a valid `interval`.");
    }

    return $intervals[$interval];
  }

  /**
   * Gets and validates the type.
   * @param String $type
   * @return String (Defaults to 'time').
   **/
  private function setType($type = '') {
    // Validates the type.
    if (!in_array($type, ['time', 'user', 'verb', 'activity', ''])) {
      throw new Exceptions\Exception("'$type' is not a valid `type`.");
    }

    return $type === '' ? 'time' : $type;
  }

}
