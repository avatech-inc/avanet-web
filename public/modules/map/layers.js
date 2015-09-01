angular.module('avatech').factory('mapLayers', function ($q, Restangular, Global) { 

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

    // overlays: [

    //      {
    //         "alias": "nbme",
    //         "name":"USGS National Map - Elevation",
    //         "template": "http://basemap.nationalmap.gov/arcgis/services/TNM_Contours/MapServer/WMSServer",
    //         "type": "WMS"
    //      },
    //      {
    //         "name":"ArcGIS World Shaded Relief",
    //         "template":"http://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",
    //         "type":"TILE"
    //      },
    //      {  
    //         "alias":"r",
    //         "copyright":"CalTopo",
    //         "description":"Relief shading based on the National Elevation Dataset with added vertical exaggeration.",
    //         "maxresolution":16,
    //         "minresolution":5,
    //         "name":"Shaded Relief",
    //         "opacity":0,
    //         "template":"http://s3-us-west-1.amazonaws.com/ctrelief/relief/{z}/{x}/{y}.png",
    //         "type":"TILE"
    //      },
    //      {
    //         "alias": "nbmi",
    //         "name":"USGS National Base Map - Shaded Relief",
    //         "opacity": 1,
    //         "template": "http://basemap.nationalmap.gov/arcgis/services/USGSShadedReliefOnly/MapServer/WMSServer",
    //         "type": "WMS"
    //      },
    //      {  
    //         "alias":"c",
    //         "copyright":"CalTopo",
    //         "description":"CalTopo's 40 foot contour layer.  Works well on top of aerial imagery or street maps.",
    //         "maxresolution":16,
    //         "minresolution":10,
    //         "name":"40' Contours",
    //         "opacity":100,
    //         "template":"http://s3-us-west-1.amazonaws.com/ctcontour/feet/{z}/{x}/{y}.png",
    //         "type":"TILE"
    //      },
    //      {  
    //         "alias":"c",
    //         "copyright":"CalTopo",
    //         "description":"CalTopo's 40 foot contour layer.  Works well on top of aerial imagery or street maps.",
    //         "maxresolution":16,
    //         "minresolution":10,
    //         "name":"40' Contours",
    //         "opacity":100,
    //         "template":"http://s3-us-west-1.amazonaws.com/ctcontour/feet/{z}/{x}/{y}.png",
    //         "type":"TILE"
    //      },
    //      {  
    //         "alias":"sf",
    //         "copyright":"CalTopo",
    //         "description":"Slope shading by angle.  May be useful for travel planning in avalanche terrain when coupled with a healthy dose of skepticism.",
    //         "info":"<span style='color: rgb(245,255,10); background-color: #CCCCCC; margin-left: 5px'>27&deg;-29&deg;<\/span><span style='color: rgb(250,183,0); margin-left: 5px'>30&deg;-31&deg;<\/span><span style='color: rgb(254,121,0); margin-left: 5px'>32&deg;-34&deg;<\/span><span style='color: rgb(255,0,0); margin-left: 5px'>35&deg;-45&deg;<\/span><span style='color: rgb(135,0,225); margin-left: 5px'>46&deg;-50&deg;<\/span><span style='color: rgb(0,0,255); margin-left: 5px'>51&deg;-59&deg;<\/span><span style='color: rgb(0,0,0); margin-left: 5px'>60&deg;+<\/span>",
    //         "maxresolution":14,
    //         "minresolution":5,
    //         "name":"Fixed Slope Shading",
    //         "opacity":30,
    //         "template":"http://s3-us-west-1.amazonaws.com/ctslope/relief/{z}/{x}/{y}.png",
    //         "type":"TILE"
    //      },
    //      {  
    //         "alias":"sg",
    //         "copyright":"CalTopo",
    //         "description":"Slope gradient by angle.",
    //         "info":"<span style='color: rgb(0,255,9); margin-left: 5px'>20&deg;<\/span><span style='color: rgb(245,255,10); background-color: #CCCCCC; margin-left: 5px'>28&deg;<\/span><span style='color: rgb(255,0,0); margin-left: 5px'>40&deg;<\/span><span style='color: rgb(0,0,255); margin-left: 5px'>55&deg;<\/span><span style='color: rgb(0,0,0); margin-left: 5px'>60&deg;<\/span>",
    //         "maxresolution":14,
    //         "minresolution":5,
    //         "name":"Gradient Slope Shading",
    //         "opacity":30,
    //         "template":"http://s3-us-west-1.amazonaws.com/ctslope/gradient/{z}/{x}/{y}.png",
    //         "type":"TILE"
    //      },
    //      {  
    //         "alias":"sma",
    //         "copyright":"USGS",
    //         "info":"<span style='color: #00CC00; margin-left: 5px'>USFS<\/span><span style='color: #888888; margin-left: 5px'>NPS<\/span><span style='color: #FE7900; margin-left: 5px'>BLM/BOR<\/span><span style='color: #FAB700; margin-left: 5px'>FWS<\/span><span style='color: #CC0000; margin-left: 5px'>Local<\/span><span style='color: #0000CC; margin-left: 5px'>State<\/span><span style='color: #F0F000; background-color: #CCCCCC; margin-left: 5px'>BIA<\/span><span style='color: #000000; margin-left: 5px'>DOD/DOE<\/span>",
    //         "maxresolution":16,
    //         "minresolution":6,
    //         "name":"Land Management",
    //         "opacity":100,
    //         "template":"http://caltopo.com:8000/sma/{z}/{x}/{y}.png",
    //         "type":"TILE"
    //      },
    //      {  
    //         "alias":"sc",
    //         "alphaOverlay":true,
    //         "copyright":"CalTopo",
    //         "maxresolution":14,
    //         "minresolution":5,
    //         "name":"DEM Shading",
    //         "opacity":30,
    //         "template":"/resource/imagery/shading/{V}/{z}/{x}/{y}.png",
    //         "type":"TILE"
    //      },
    //      {  
    //         "alias":"vs",
    //         "alphaOverlay":true,
    //         "copyright":"CalTopo",
    //         "maxresolution":14,
    //         "minresolution":5,
    //         "name":"Viewshed Analysis",
    //         "opacity":30,
    //         "template":"/resource/imagery/viewshed/{V}/{z}/{x}/{y}.png",
    //         "type":"TILE"
    //      },
    //      {  
    //         "alias":"sl",
    //         "alphaOverlay":true,
    //         "copyright":"CalTopo",
    //         "maxresolution":14,
    //         "minresolution":5,
    //         "name":"Sunlight",
    //         "opacity":30,
    //         "template":"/resource/imagery/sunlight/{V}/{z}/{x}/{y}.png",
    //         "type":"TILE"
    //      },
    //      {  
    //         "alias":"mai",
    //         "alphaOverlay":false,
    //         "copyright":"NASA",
    //         "maxresolution":9,
    //         "minresolution":2,
    //         "name":"MODIS Archive Imagery",
    //         "opacity":0,
    //         "template":"/resource/imagery/modis-archive-imagery/{V}/{z}/{x}/{y}.jpg",
    //         "type":"TILE"
    //      }
    //   ]
  };
});