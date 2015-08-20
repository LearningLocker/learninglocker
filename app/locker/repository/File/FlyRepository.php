<?php namespace Locker\Repository\File;
use League\Flysystem\Filesystem as Filesystem;
use League\Flysystem\AdapterInterface as AdapterInterface;

abstract class FlyRepository implements Repository {
  protected $filesystem;

  public function __construct(Callable $conf) {}

  protected function constructFileSystem(AdapterInterface $adapter) {
    $this->filesystem = new Filesystem($adapter);
  }

  public function index(array $opts) {
    return $this->filesystem->listContents('.', true);
  }

  public function show($id, array $opts) {
    return $this->filesystem->read($id);
  }

  public function destroy($id, array $opts) {
    $this->filesystem->delete($id);
    return true;
  }

  public function store(array $data, array $opts) {
    throw new \BadMethodCallException();
  }

  public function update($id, array $data, array $opts) {
    $this->filesystem->put($id, $data['content']);
    return $data;
  }

  public function stream($id, array $opts) {
    $stream = $this->filesystem->readStream($id);
    fseek($stream, 0);
    return $stream;
  }

  public function has($id, array $opts) {
    return $this->filesystem->has($id);
  }

}
