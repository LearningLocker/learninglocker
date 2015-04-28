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

  protected $formatter;

  public function __construct() {
    $this->formatter = new Formatter();
  }

  /**
   * Gets all of the available models with the options.
   * @param IndexOptions $opts
   * @return [Model]
   */
  public function index(IndexOptions $opts) {
    $builder = $this->where($opts);

    return $this->constructFilterOpts($builder, $opts, [
      'agent' => function ($value, $builder, IndexOptions $opts) {
        return $this->matchAgent($value, $builder, $opts);
      },
      'activity' => function ($value, $builder, IndexOptions $opts) {
        return $this->matchActivity($value, $builder, $opts);
      },
      'verb' => function ($value, $builder, IndexOptions $opts) {
        return $this->addWhere($builder, 'verb.id', $value);
      },
      'registration' => function ($value, $builder, IndexOptions $opts) {
        return $this->addWhere($builder, 'context.registration', $value);
      },
      'since' => function ($value, $builder, IndexOptions $opts) {
        return $this->addWhere($builder, 'stored', $value, '>');
      },
      'until' => function ($value, $builder, IndexOptions $opts) {
        return $this->addWhere($builder, 'stored', $value, '<=');
      },
      'active' => function ($value, $builder, IndexOptions $opts) {
        return $builder->where('active', $value);
      },
      'voided' => function ($value, $builder, IndexOptions $opts) {
        return $builder->where('voided', $value);
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
  private function addWhere(Builder $builder, $key, $value, $op = '=') {
    return $builder->where(function ($query) use ($key, $value, $op) {
      return $query
        ->orWhere('statement.'.$key, $op, $value)
        ->orWhere('refs.'.$key, $op, $value);
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
        $query->orWhere(function ($query) use ($key, $value) {
          return $query
            ->orWhere('statement.'.$key, $value)
            ->orWhere('refs.'.$key, $value);
        });
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
        return $this->formatter->canonicalStatement($statement, $opts->getOpt('langs'));
      };
    } else {
      throw new Exceptions\Exception("`$format` is not a valid format.");
    }

    // Returns the models.
    return json_decode($builder
      ->orderBy('statement.stored', $opts->getOpt('ascending') === true ? 'ASC' : 'DESC')
      ->skip($opts->getOpt('offset'))
      ->take($opts->getOpt('limit'))
      ->get()
      ->map(function (Model $model) use ($opts, $formatter) {
        return $formatter($this->formatModel($model), $opts);
      }));
  }

  /**
   * Constructs a builder using the given agent and options.
   * @param \stdClass $agent Agent to be matched.
   * @param Builder $builder
   * @param IndexOptions $opts Index options.
   * @return Builder
   */
  private function matchAgent(\stdClass $agent, Builder $builder, IndexOptions $opts) {
    $id_key = Helpers::getAgentIdentifier($agent);

    if ($id_key === 'account') {
      $builder = $this->matchAgentProp('account.homePage', $agent->account->homePage, $builder, $opts);
      $builder = $this->matchAgentProp('account.name', $agent->account->name, $builder, $opts);
    } else {
      $builder = $this->matchAgentProp($id_key, $agent->{$id_key}, $builder, $opts);
    }
    
    return $builder;
  }

  /**
   * Constructs a builder using the given agent property and value, plus options.
   * @param String $prop
   * @param Mixed $value
   * @param Builder $builder
   * @param IndexOptions $opts Index options.
   * @return Builder
   */
  private function matchAgentProp($prop, $value, Builder $builder, IndexOptions $opts) {
    return $builder->where(function ($query) use ($prop, $value, $builder, $opts) {
      $keys = ["actor.$prop", "actor.members.$prop", "object.$prop"];

      if ($opts->getOpt('related_agents') === true) {
        $keys = array_merge($keys, [
          "authority.$prop",
          "context.instructor.$prop",
          "context.team.$prop"
        ]);
      }

      $query = $this->addWheres($builder, $keys, $value);
    });
  }

  /**
   * Constructs a Mongo match using the given activity and options.
   * @param String $activity Activity to be matched.
   * @param IndexOptions $opts Index options.
   * @return Builder
   */
  private function matchActivity($activity, Builder $builder, IndexOptions $opts) {
    return $builder->where(function ($query) use ($activity, $builder, $opts) {
      $keys = ['object.id'];

      if ($opts->getOpt('related_activities') === true) {
        $keys = array_merge($keys, [
          'context.contextActivities.parent.id',
          'context.contextActivities.grouping.id',
          'context.contextActivities.category.id',
          'context.contextActivities.other.id'
        ]);
      }

      $query = $this->addWheres($builder, $keys, $activity);
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
