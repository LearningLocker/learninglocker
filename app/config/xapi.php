<?php
  /*
  |--------------------------------------------------------------------------
  | xAPI configurations
  |--------------------------------------------------------------------------
  |
  | WARNING: Changing these settings may make your xAPI non compliant to 
  | the specification!
  |
  | ** disable_duplicate_key_checks **
  | Setting this value to true will turn off any checks for duplicate keys
  | in sent JSON. This is known to have huge performance gains when sending
  | in large statement batches, at the expense of the application taking the
  | only one of the passed keys in. 
  | See https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md#user-content-2.2.s2.b2
  |
  */
  return [
    'disable_duplicate_key_checks' => false,
  ];
