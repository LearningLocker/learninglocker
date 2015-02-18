<?php namespace Locker\Repository\Export;

interface Repository {
  function index(array $opts);
  function show($id, array $opts);
  function destroy($id, array $opts);
  function store(array $data, array $opts);
  function update($id, array $data, array $opts);
}