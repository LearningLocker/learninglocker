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
    $reportArr = $this->toArray();
    $filter = [];

    if (isset($reportArr['query'])) $filter['filter'] = json_encode($reportArr['query']);
    if (isset($reportArr['since'])) $filter['since'] = $reportArr['since'];
    if (isset($reportArr['until'])) $filter['until'] = $reportArr['until'];

    return $filter;
  }

  public function toArray() {
    return (array) \app\locker\helpers\Helpers::replaceHtmlEntity(parent::toArray());
  }

}