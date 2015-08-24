# File Repository
This page documents how to use different storage adapters in Learning Locker. The supported adapters are listed below.

- [Local](#local)
- [Rackspace](#rackspace)

### Local
Your .env.local.php file should look something like this.
```php
  'FS_REPO' => 'Local',
  'FS_LOCAL_ENDPOINT' => __DIR__.'/uploads',
```

If you're migrating from another file repository (i.e. "Rackspace"), you'll need to run the command below.

```shell
php artisan ll:file-repo Local -f Rackspace
```

### Rackspace
Your .env.local.php file will need to include `OpenCloud\Rackspace` (below `<?php`).
```php
use OpenCloud\Rackspace as Rackspace;
```

Your .env.local.php file should look something like this.
```php
  'FS_REPO' => 'Rackspace',
  'FS_RACK_ENDPOINT' => Rackspace::UK_IDENTITY_ENDPOINT,
  'FS_RACK_USERNAME' => 'YOUR USERNAME',
  'FS_RACK_API_KEY' => 'YOUR API KEY',
  'FS_RACK_REGION' => 'LON',
  'FS_RACK_CONTAINER' => 'YOUR CONTAINER',
```

If you're migrating from another file repository (i.e. "Local"), you'll need to run the command below.

```shell
php artisan ll:file-repo Rackspace -f Local
```

### Copy.com
Your .env.local.php file should look something like this.
```php
  'FS_REPO' => 'Rackspace',
  'FS_COPY_CONSUMER_KEY' => 'YOUR CONSUMER KEY',
  'FS_COPY_CONSUMER_SECRET' => 'YOUR CONSUMER SECRET',
  'FS_COPY_ACCESS_TOKEN' => YOUR ACCESS TOKEN',
  'FS_COPY_TOKEN_SECRET' => 'YOUR TOKEN SECRET',
  'FS_COPY_PREFIX' => 'YOUR PREFIX',
```

If you're migrating from another file repository (i.e. "Local"), you'll need to run the command below.

```shell
php artisan ll:file-repo Copy -f Local
```

### Useful Development Links
- http://docs.rackspace.com/sdks/api/php/class-OpenCloud.Rackspace.html
- http://flysystem.thephpleague.com/api/
- https://github.com/thephpleague/flysystem-aws-s3-v2/issues/3
- https://github.com/thephpleague/flysystem-rackspace/issues/7