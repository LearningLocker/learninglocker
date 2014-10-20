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
  protected $fillable = ['name', 'description', 'query', 'lrs'];

  public function getFilterAttribute() {
    $report = $this->toArray();
    $filter = [];

    if (isset($this->query)) $filter['filter'] = json_encode($this->query);
    if (isset($this->since)) $filter['since'] = $this->since;
    if (isset($this->until)) $filter['until'] = $this->until;

    return $filter;
  }

  public function toArray() {
    return \app\locker\helpers\Helpers::replaceHtmlEntity(parent::toArray());
  }

}