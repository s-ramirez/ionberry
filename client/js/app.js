angular.module('app',
[
  "dragularModule",
  "ngElectron",
  "ngAnimate",
  "ngAria",
  "ngMaterial",
  "ngRoute",
  "md.data.table",
  "app.controllers",
  "app.directives",
  "app.services",
  "app.routes"
])
.config(function($mdThemingProvider) {
  var customGrey = $mdThemingProvider.extendPalette('blue-grey', {
    '600': '3C494F',
    '500': '4B585E'
  });
  $mdThemingProvider.definePalette('custom-grey', customGrey);

  $mdThemingProvider.theme('default')
    .primaryPalette('custom-grey')
    // If you specify less than all of the keys, it will inherit from the
    // default shades
    .accentPalette('purple', {
      'default': '200' // use shade 200 for default, and keep all other shades the same
    });
});
