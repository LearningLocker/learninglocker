<?php namespace Locker\Repository\Statement;

use \Locker\Helpers\Exceptions as Exceptions;
use \Locker\Helpers\Helpers as Helpers;
use \Locker\XApi\Helpers as XApiHelpers;
use \Jenssegers\Mongodb\Eloquent\Builder as Builder;
use \Illuminate\Database\Eloquent\Model as Model;

interface IndexerInterface {
  public function index(IndexOptions $opts);
  public function format(Builder $builder, IndexOptions $opts);
  public function count(Builder $builder, IndexOptions $opts);
}

class EloquentIndexer extends EloquentReader implements IndexerInterface {

  public function __construct() {
    $this->formatter = new Formatter();
  }

  /**
   * Gets all of the available models with the options.
   * @param IndexOptions $opts
   * @return [Model]
   */
  public function index(IndexOptions $opts) {
    $builder = $this->where($opts->options);

    return $this->constructFilterOpts($builder, $opts, [
      'agent' => function ($value, $builder, IndexOptions $opts) {
        return $this->matchAgent($value, $builder, $opts);
      },
      'activity' => function ($value, $builder, IndexOptions $opts) {
        return $this->matchActivity($value, $builder, $opts);
      },
      'verb' => function ($value, $builder, IndexOptions $opts) {
        return $this->addWhere($builder, 'statement.verb.id', $value);
      },
      'registration' => function ($value, $builder, IndexOptions $opts) {
        return $this->addWhere($builder, 'statement.context.registration', $value);
      },
      'since' => function ($value, $builder, IndexOptions $opts) {
        return $this->addWhere($builder, 'statement.timestamp', $value);
      },
      'until' => function ($value, $builder, IndexOptions $opts) {
        return $this->addWhere($builder, 'statement.timestamp', $value);
      },
      'active' => function ($value, $builder, IndexOptions $opts) {
        return $this->addWhere($builder, 'active', $value);
      },
      'voided' => function ($value, $builder, IndexOptions $opts) {
        return $this->addWhere($builder, 'voided', $value);
      }
    ]);
  }

  /**
   * Adds where to builder.
   * @param Builder $builder
   * @param String $key
   * @param Mixed $value
   * @return Builder
   */
  private function addWhere(Builder $builder, $key, $value) {
    return $builder->where(function ($query) use ($key, $value) {
      return $query
        ->orWhere($key, $value)
        ->orWhere('refs.'.$key, $value);
    });
  }

  /**
   * Adds wheres to builder.
   * @param Builder $builder
   * @param [String] $keys
   * @param Mixed $value
   * @return Builder
   */
  private function addWheres(Builder $builder, array $keys, $value) {
    return $builder->where(function ($query) use ($keys, $value) {
      foreach ($keys as $key) {
        $query = $this->addWhere($query, $key, $value);
      }
      return $query;
    });
  }

  /**
   * Extends a given Builder using the given options and option builders.
   * @param Builder $builder
   * @param IndexOptions $opts.
   * @param [String => Callable] $builders Option builders.
   * @return Builder
   */
  private function constructFilterOpts(Builder $builder, IndexOptions $opts, array $builders) {
    foreach ($builders as $opt => $opt_builder) {
      $opt_value = $opts->getOpt($opt);
      $builder = $opt_value === null ? $builder : $opt_builder($opt_value, $builder, $opts);
    }
    return $builder;
  }

  /**
   * Formats statements.
   * @param Builder $builder
   * @param IndexOptions $opts
   * @return [Model] Formatted statements.
   */
  public function format(Builder $builder, IndexOptions $opts) {
    // Determines the formatter to be used.
    $format = $opts->getOpt('format');
    if ($format === 'exact') {
      $formatter = function ($statement, $opts) {
        return $statement;
      };
    } else if ($format === 'ids') {
      $formatter = function ($statement, $opts) {
        return $this->formatter->identityStatement($statement);
      };
    } else if ($format === 'canonical') {
      $formatter = function ($statement, $opts) {
        return $this->formatter->canonicalStatement($statement, $opts['langs']);
      };
    } else {
      throw new Exceptions\Exception("`$format` is not a valid format.");
    }

    // Returns the models.
    return $builder
      ->orderBy('statement.stored', $opts->getOpt('ascending'))
      ->skip($opts->getOpt('offset'))
      ->take($opts->getOpt('limit'))
      ->get()
      ->map(function (Model $model) use ($opts, $formatter) {
        return $formatter($model->statement, $opts);
      });
  }

  /**
   * Constructs a Mongo match using the given agent and options.
   * @param String $agent Agent to be matched.
   * @param IndexOptions $options Index options.
   * @return Builder
   */
  private function matchAgent($agent, Builder $builder, IndexOptions $options) {
    $id_key = Helpers::getAgentIdentifier($agent);
    $id_val = $agent->{$id_key};

    return $builder->where(function ($query) use ($id_val, $opts) {
      $keys = ["statement.actor.$id_key", "statement.object.$id_key"];

      if ($opts->getOpt('related_agents') === true) {
        $keys = array_merge($keys, [
          "statement.authority.$id_key",
          "statement.context.instructor.$id_key",
          "statement.context.team.$id_key"
        ]);
      }

      $query = $this->addWheres($keys);
    });
  }

  /**
   * Constructs a Mongo match using the given activity and options.
   * @param String $activity Activity to be matched.
   * @param IndexOptions $options Index options.
   * @return Builder
   */
  private function matchActivity($activity, Builder $builder, IndexOptions $options) {
    return $builder->where(function ($query) use ($activity, $opts) {
      $keys = ['statement.object.id'];

      if ($opts->getOpt('related_activities') === true) {
        $keys = array_merge($keys, [
          'statement.context.contextActivities.parent.id',
          'statement.context.contextActivities.grouping.id',
          'statement.context.contextActivities.category.id',
          'statement.context.contextActivities.other.id'
        ]);
      }

      $query = $this->addWheres($keys);
    });
  }

  /**
   * Counts statements.
   * @param Builder $builder
   * @param IndexOptions $opts
   * @return Int Number of statements in Builder.
   */
  public function count(Builder $builder, IndexOptions $opts) {
    return $builder->count();
  }
}
