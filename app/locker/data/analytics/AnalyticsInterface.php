<?php namespace Locker\Data\Analytics;

interface AnalyticsInterface {
  public function timedGrouping($lrs, array $options);
  public function statements($lrs, array $options, array $sections);
}
