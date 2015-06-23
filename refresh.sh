echo "Refreshing LL files"
php artisan optimize
php artisan js-localization:refresh

echo "Cleaning bower_components"
find public/assets/js/bower_components/ -type f -name '*.md' | xargs rm -f
find public/assets/js/bower_components/ -type d -name 'docs' | xargs rm -rf
find public/assets/js/bower_components/ -type d -name 'spec' | xargs rm -rf
find public/assets/js/bower_components/ -type d -name 'test' | xargs rm -rf
find public/assets/js/bower_components/ -type f -not \( -name '*.css' -o -name '*.js' \) -print
find public/assets/js/bower_components/ -type f -not \( -name '*.css' -o -name '*.js' \) | xargs rm -rf