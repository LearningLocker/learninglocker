<?php

use Jenssegers\Mongodb\Model as Eloquent;

class Export extends Eloquent {
  protected $collection = 'exports';
  protected $fillable = ['name', 'description', 'fields', 'lrs', 'report'];
}