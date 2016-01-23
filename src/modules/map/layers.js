angular.module('avatech').factory('mapLayers', ['$q', 'Restangular', 'Global', function ($q, Restangular, Global) { 

var layers = Restangular.one("users", Global.user._id).one("maps").get();

return {

   loaded: layers,

   getLayerByAlias: function(alias) {
      var _this = this;
      if (!_this.baseLayers) return null;

      var layer;
      if (_this.baseLayers.terrain) {
         for (var i = 0; i < _this.baseLayers.terrain.length; i++) {
            var l = _this.baseLayers.terrain[i];
            if (l.alias == alias) layer = l;
         }
      }
      if (_this.baseLayers.aerial) {
         for (var i = 0; i < _this.baseLayers.aerial.length; i++) {
            var l = _this.baseLayers.aerial[i];
            if (l.alias == alias) layer = l;
         }
      }
      return layer;
    },
    baseLayers: layers.$object,
  };
}]);
