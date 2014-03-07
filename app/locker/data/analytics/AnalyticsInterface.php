<?php namespace Locker\Data\Analytics;

interface AnalyticsInterface {

  public function analytics( $options );

  public function section( $section, $filter, $returnFields );

}