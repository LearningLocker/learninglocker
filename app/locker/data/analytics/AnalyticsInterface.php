<?php namespace Locker\Data\Analytics;

interface AnalyticsInterface {

  public function filter( $options );

  public function section( $section, $filter );

}