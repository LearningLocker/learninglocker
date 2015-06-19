<?php

use Jenssegers\Mongodb\Model as Eloquent;

class Report extends Eloquent {

  /**
   * Our MongoDB collection used by the model.
   *
   * @var string
   */
  protected $collection = 'reports';
  public static $rules = [];
  protected $fillable = ['name', 'description', 'query', 'lrs', 'since', 'until'];
  protected $actorQuery = [ 'statement.actor.account', 'statement.actor.mbox', 'statement.actor.openid', 'statement.actor.mbox_sha1sum' ];
  protected $instructorQuery = [
    'statement.context.instructor.account',
    'statement.context.instructor.mbox',
    'statement.context.instructor.openid',
    'statement.context.instructor.mbox_sha1sum'
  ];

  private function constructOr($key, $value) {
    $query = [];
    foreach ($value as $actor_id) {
      if (is_object($actor_id)) {
        $object_vars = get_object_vars($actor_id);
        $filter = [];
        foreach ($object_vars as $var_key => $var_val) {
          $filter[$key.'.'.$var_key] = $var_val;
        }
        return $filter;
      } else {
        return [$key => $actor_id];
      }
    }
    return $query;
  }

  private function constructDate($date) {
    return (new \Carbon\Carbon($date))->toIso8601String();
  }

  public function getMatchAttribute() {
    $reportArr = $this->toArray();
    $match = [];
    $actorMatch = [];
    $instructorMatch = [];
    $query = isset($reportArr['query']) ? (array) $reportArr['query'] : null;

    if (is_array($query) && count($query) > 0 && !isset($query[0])) {
      foreach ($query as $key => $value) {
        if (in_array($key, $this->actorQuery)) {
          $actorMatch['$or'][] = $this->constructOr($key, $value);
        } else if (in_array($key, $this->instructorQuery)) {
          $instructorMatch['$or'][] = $this->constructOr($key, $value);
        } else {
          if (is_array($value)) {
            $match[$key] = ['$in' => $value];
          } else {
            $match[$key] = $value;
          }
        }
      }
    }

    $since = isset($reportArr['since']) ? $this->constructDate($reportArr['since']) : null;
    $until = isset($reportArr['until']) ? $this->constructDate($reportArr['until']) : null;

    if ($since || $until) {
      $match['statement.timestamp'] = [];
    }
    if ($since) {
      $match['statement.timestamp']['$gte'] = $since;
    }
    if ($until) {
      $match['statement.timestamp']['$lte'] = $until;
    }
    $andMatch = ['$and' => []];
    if (!empty($actorMatch)) $andMatch['$and'][] = $actorMatch;
    if (!empty($instructorMatch)) $andMatch['$and'][] = $instructorMatch;
    if (!empty($match)) $andMatch['$and'][] = $match;
    //echo(json_encode($andMatch));die;

    return $andMatch;
  }

  public function getWhereAttribute() {
    $reportArr = $this->toArray();
    $wheres = [];
    $query = isset($reportArr['query']) ? (array) $reportArr['query'] : null;
    $actorArray = [];
    $instructorArray = [];

    if (is_array($query) && count($query) > 0 && !isset($query[0])) {
      foreach (array_keys($query) as $key) {
        if (in_array($key, $this->actorQuery)) {
          array_push($actorArray, [$key, $query[$key]]);
        } else if (in_array($key, $this->instructorQuery)) {
          array_push($instructorArray, [$key, $query[$key]]);
        } else {
          if (is_array($query[$key])) {
            array_push($wheres, [$key, 'in', $query[$key]]);
          } else {
            array_push($wheres, [$key, '=', $query[$key]]);
          }
        }
      }
      array_push($wheres, ['orArray', 'or', $actorArray]);
      array_push($wheres, ['orArray', 'or', $instructorArray]);
    }

    $since = isset($reportArr['since']) ? $this->constructDate($reportArr['since']) : null;
    $until = isset($reportArr['until']) ? $this->constructDate($reportArr['until']) : null;

    if ($since && $until) {
      $wheres[] = ['statement.timestamp', 'between', $since, $until];
    } else if ($since) {
      $wheres[] = ['statement.timestamp', '>=', $since];
    } else if ($until) {
      $wheres[] = ['statement.timestamp', '<=', $until];
    }

    return $wheres;
  }

  public function toArray() {
    return (array) \Locker\Helpers\Helpers::replaceHtmlEntity(parent::toArray());
  }

}
