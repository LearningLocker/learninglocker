<?php namespace Locker\Repository\Statement;

use \Locker\Helpers\Exceptions as Exceptions;
use \Locker\XApi\Helpers as XApiHelpers;
use \Jenssegers\Mongodb\Eloquent\Builder as Builder;
use \Illuminate\Database\Eloquent\Model as Model;

class EloquentIndexer extends EloquentReader {

  /**
   * Gets all of the available models with the options.
   * @param [String => Mixed] $opts
   * @return [Model]
   */
  public function index(array $opts) {
    $opts = new IndexOptions($opts);
    return $this->where($opts);
  }

  protected function where(IndexOptions $opts) {
    $builder = $this->where($opts->options);

    return $this->constructFilterOpts($builder, $opts, [
      'agent' => function ($agent, IndexOptions $opts) {
        Helpers::validateAtom(\Locker\XApi\Agent::createFromJSON($agent));
        return $this->matchAgent($agent, $options);
      }
    ]);
  }

  /**
   * Formats statements.
   * @param Builder $builder
   * @param [String => Mixed] $opts
   * @return [Model] Formatted statements.
   */
  public function format(Builder $builder, array $opts) {
    if ($opts['format'] === 'exact') {
      $formatter = function ($model, $opts) {
        return $model;
      };
    } else if ($opts['format'] === 'ids') {
      $formatter = function ($model, $opts) {
        return $this->formatter->identityStatement($model);
      };
    } else if ($opts['format'] === 'canonical') {
      $formatter = function ($model, $opts) {
        return $this->formatter->canonicalStatement($model, $opts['langs']);
      };
    } else {
      throw new Exceptions\Exception("`$opts['format']` is not a valid format.");
    }

    return $builder->get()->each(function (Model $model) use ($opts) {
      return $formatter($model, $opts);
    });
  }

  /**
   * Counts statements.
   * @param Builder $builder
   * @param [String => Mixed] $opts
   * @return Int Number of statements in Builder.
   */
  public function count(Builder $builder, array $opts) {
    return $builder->count();
  }
}
