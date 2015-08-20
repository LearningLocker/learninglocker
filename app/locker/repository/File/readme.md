# File Repository
This page documents how to use different storage adapters in Learning Locker. The supported adapters are listed below.

- [Local](#local)
- [Rackspace](#rackspace)

### Local
Your .env.local.php file should look something like this.
```php
  'FS_REPO' => 'Local',
  'FS_CONF' => [
    'ENDPOINT' => __DIR__.'/uploads'
  ],
```

### Rackspace
Your .env.local.php file will need this line at the top (below `<?php`).

`use OpenCloud\Rackspace as Rackspace;`

Your .env.local.php file should look something like this.
```php
  'FS_REPO' => 'Rackspace',
  'FS_CONF' => [
    'ENDPOINT' => Rackspace::UK_IDENTITY_ENDPOINT,
    'USERNAME' => 'YOUR USERNAME',
    'API_KEY' => 'YOUR API KEY',
    'REGION' => 'LON',
    'CONTAINER' => 'YOUR CONTAINER'
  ],
```

### Useful Development Links
http://docs.rackspace.com/sdks/api/php/class-OpenCloud.Rackspace.html
http://flysystem.thephpleague.com/api/
https://github.com/thephpleague/flysystem-aws-s3-v2/issues/3
https://github.com/thephpleague/flysystem-rackspace/issues/7