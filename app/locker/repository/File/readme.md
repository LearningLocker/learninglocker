# File Repository
This page documents how to use different storage adapters in Learning Locker. The supported adapters are listed below.

- [Local](#local)
- [Rackspace](#rackspace)

### Local
Your .env.local.php file should look something like this.
```php
  'FS_REPO' => 'Local',
  'FS_ENDPOINT' => __DIR__.'/uploads',
```

### Rackspace
Your .env.local.php file will need to include `OpenCloud\Rackspace` (below `<?php`).
```php
use OpenCloud\Rackspace as Rackspace;
```

Your .env.local.php file should look something like this.
```php
  'FS_REPO' => 'Rackspace',
  'FS_ENDPOINT' => Rackspace::UK_IDENTITY_ENDPOINT,
  'FS_USERNAME' => 'YOUR USERNAME',
  'FS_API_KEY' => 'YOUR API KEY',
  'FS_REGION' => 'LON',
  'FS_CONTAINER' => 'YOUR CONTAINER',
```

### Useful Development Links
- http://docs.rackspace.com/sdks/api/php/class-OpenCloud.Rackspace.html
- http://flysystem.thephpleague.com/api/
- https://github.com/thephpleague/flysystem-aws-s3-v2/issues/3
- https://github.com/thephpleague/flysystem-rackspace/issues/7