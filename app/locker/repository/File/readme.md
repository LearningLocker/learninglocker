# File Repository
This page documents how to use different storage adapters in Learning Locker. The supported adapters are listed below.

- [Local](#local)
- [Rackspace](#rackspace)
- [Copy.com](#copycom)
- [Dropbox](#dropbox)
- [Azure](#azure)
- [AWS S3 V3](#aws-s3-v3)

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
  'FS_RACK_URL_TYPE' => 'URL TYPE',
```
The URL TYPE should either be `publicURL` or `internalURL`, depending on whether your application operates within the Rackspace Cloud network (`internalURL`). Read more here: http://docs.php-opencloud.com/en/latest/url-types.html

If you're migrating from another file repository (i.e. "Local"), you'll need to run the command below.

```shell
php artisan ll:file-repo Rackspace -f Local
```

### Copy.com
Your .env.local.php file should look something like this.
```php
  'FS_REPO' => 'Copy',
  'FS_COPY_CONSUMER_KEY' => 'YOUR CONSUMER KEY',
  'FS_COPY_CONSUMER_SECRET' => 'YOUR CONSUMER SECRET',
  'FS_COPY_ACCESS_TOKEN' => 'YOUR ACCESS TOKEN',
  'FS_COPY_TOKEN_SECRET' => 'YOUR TOKEN SECRET',
  'FS_COPY_PREFIX' => 'YOUR PREFIX',
```

If you're migrating from another file repository (i.e. "Local"), you'll need to run the command below.

```shell
php artisan ll:file-repo Copy -f Local
```

### Dropbox
Your .env.local.php file should look something like this.
```php
  'FS_REPO' => 'Dropbox',
  'FS_DROPBOX_ACCESS_TOKEN' => 'YOUR ACCESS TOKEN',
  'FS_DROPBOX_APP_SECRET' => 'YOUR APP SECRET',
  'FS_DROPBOX_PREFIX' => 'YOUR PREFIX',
```

If you're migrating from another file repository (i.e. "Local"), you'll need to run the command below.

```shell
php artisan ll:file-repo Dropbox -f Local
```

### Azure
Your .env.local.php file should look something like this.
```php
  'FS_REPO' => 'Azure',
  'FS_AZURE_PROTOCOL' => 'DefaultEndpointsProtocol=https;AccountName=%s;AccountKey=%s',
  'FS_AZURE_USERNAME' => 'YOUR USERNAME',
  'FS_AZURE_API_KEY' => 'YOUR API KEY',
  'FS_AZURE_CONTAINER' => 'YOUR CONTAINER',
```

If you're migrating from another file repository (i.e. "Local"), you'll need to run the command below.
```shell
php artisan ll:file-repo Azure -f Local
```

### AWS S3 V3
Your .env.local.php file should look something like this.
```php
  'FS_REPO' => 'S3V3',
  'FS_S3V3_KEY' => 'YOUR KEY',
  'FS_S3V3_SECRET' => 'YOUR SECRET',
  'FS_S3V3_REGION' => 'YOUR REGION',
  'FS_S3V3_VERSION' => 'YOUR VERSION',
  'FS_S3V3_BUCKET' => 'YOUR BUCKET',
  'FS_S3V3_PREFIX' => 'YOUR PREFIX',
```

If you're migrating from another file repository (i.e. "Local"), you'll need to run the command below.
```shell
php artisan ll:file-repo S3V3 -f Local
```

### Useful Development Links
- http://docs.rackspace.com/sdks/api/php/class-OpenCloud.Rackspace.html
- http://flysystem.thephpleague.com/api/
- https://github.com/thephpleague/flysystem-aws-s3-v2/issues/3
- https://github.com/thephpleague/flysystem-rackspace/issues/7
