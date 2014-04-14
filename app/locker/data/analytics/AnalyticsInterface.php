<?php namespace Locker\Data\Analytics;

interface AnalyticsInterface {

  public function analytics( $lrs, $options );

  public function section( $lrs, $section, $filter, $returnFields );

}