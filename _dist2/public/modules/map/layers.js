angular.module('avatech').factory('mapLayers', ['$q', function ($q) { 

return {

    baseLayers: {  
        terrain: [
         { 
            "alias":"mbus",
            "copyright": "Mapbox",
            "name": "Mapbox - English (US)",
            //"id": "andrewsohn.ihk2g12l",
            "id": "andrewsohn.c8a22ee9",
            "type": "MAPBOX"
         },
         { 
            "alias":"mbmetric",
            "copyright": "Mapbox",
            "name": "Mapbox - English (Metric)",
            "id": "andrewsohn.44870cb6",
            "type": "MAPBOX"
         },
         { 
            "alias":"mbworld",
            "copyright": "Mapbox",
            "name": "Mapbox - World",
            "id": "andrewsohn.713608d5",
            "type": "MAPBOX"
         },
         { 
            "alias":"mbfr",
            "copyright": "Mapbox",
            "name": "Mapbox - French",
            "id": "andrewsohn.e292094f",
            "type": "MAPBOX"
         },
         { 
            "alias":"mbde",
            "copyright": "Mapbox",
            "name": "Mapbox - German",
            "id": "andrewsohn.f4c6ea3c",
            "type": "MAPBOX"
         },
         // {
         //    "alias": "nbm",
         //    "name":"USGS National Map - Topo",
         //    "template": "http://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer",
         //    "maxresolution":16,
         //    "type": "WMS"
         // },
         {
            "alias": "nbm",
            "name":"USGS National Map - Topo",
            "template": "http://basemap.nationalmap.gov/ArcGIS/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
            "maxresolution":15,
            "retina": true,
            "type": "TILE"
         },
         // {
         //    "alias": "nhd",
         //    "name":"USGS National Map - Hydrology",
         //    "opacity": 1,
         //    "template": "http://basemap.nationalmap.gov/arcgis/services/USGSHydroNHD/MapServer/WMSServer",
         //    "type": "WMS"
         // },
         // {
         //    "name": "Alaska Topo",
         //    "template": "http://tiles.gina.alaska.edu/tilesrv/drg/tile/{x}/{y}/{z}",
         //    "type":"TILE"
         // },
         {  
            "alias":"t",
            "copyright":"CalTopo,USGS",
            "description":"USGS 7.5' quads assembled from Cal-Atlas scans and USGS GeoPDFs.",
            "maxresolution":16,
            "minresolution":5,
            "retina": true,
            "name":"USGS 7.5' Topo",
            "template":"http://s3-us-west-1.amazonaws.com/caltopo/topo/{z}/{x}/{y}.png",
            "type":"TILE"
         },
         {  
            "alias":"f",
            "copyright":"CalTopo,USFS",
            "description":"Forest Service road and trail layer assembled from FSTopo PDFs.",
            "maxresolution":16,
            "minresolution":5,
            "retina": true,
            "name":"US Forest Service Topo",
            "template":"http://s3-us-west-1.amazonaws.com/ctusfs/fstopo/{z}/{x}/{y}.png",
            "type":"TILE"
         },
         {  
            "alias":"nrc",
            "copyright":"NRCAN",
            "description":"Vector-drawn topo layer hosted by Natural Resources Canada.",
            "maxresolution":16,
            "minresolution":5,
            "name":"NR Canada",
            //"template":"http://wms.sst-sw.rncan.gc.ca/wms/toporama_en?VERSION=1.1.1&REQUEST=GetMap&LAYERS=WMS-Toporama&STYLES=&SRS=EPSG:4326&BBOX={left},{bottom},{right},{top}&WIDTH={tilesize}&HEIGHT={tilesize}&FORMAT=image/png&BGCOLOR=0xCCCCCC&EXCEPTIONS=INIMAGE",
            "template": "http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en",
            "layers": ['limits','vegetation','builtup_areas','designated_areas','hydrography','hypsography','water_saturated_soils','landforms','constructions','water_features','road_network','railway','populated_places','structures','power_network','boundaries','feature_names'],
            "version": "1.1.1",
            "type":"WMS"
         },
         // {  
         //    "alias":"v",
         //    "copyright":"CalTopo",
         //    "description":"Hand-georeferenced visitor maps.  Select coverage in the western US only.",
         //    "maxresolution":14,
         //    "minresolution":5,
         //    "name":"CA Visitor Maps",
         //    "opacity":0,
         //    "template":"http://s3-us-west-1.amazonaws.com/ctfun/visitor/{z}/{x}/{y}.png",
         //    "type":"TILE"
         // },
         // {  
         //    "alias":"nps",
         //    "copyright":"CalTopo",
         //    "description":"Visitor maps for some national parks.",
         //    "maxresolution":14,
         //    "minresolution":5,
         //    "name":"NPS Visitor Maps",
         //    "opacity":0,
         //    "template":"http://s3-us-west-1.amazonaws.com/ctvisitor/nps/{z}/{x}/{y}.png",
         //    "type":"TILE"
         // },
         // {  
         //    "alias":"usfs",
         //    "copyright":"CalTopo",
         //    "description":"Visitor maps for some national forests.",
         //    "maxresolution":14,
         //    "minresolution":5,
         //    "name":"USFS Visitor Maps",
         //    "opacity":0,
         //    "template":"http://s3-us-west-1.amazonaws.com/ctvisitor/usfs/{z}/{x}/{y}.png",
         //    "type":"TILE"
         // },

         // larger scale overview map, not necessary
         // {  
         //    "alias":"12",
         //    "copyright":"CalTopo,USGS",
         //    "description":"USGS 1deg by 2deg topo maps.",
         //    "maxresolution":12,
         //    "minresolution":5,
         //    "name":"USGS 1:250k",
         //    "template":"http://s3-us-west-1.amazonaws.com/caltopo/1x2/{z}/{x}/{y}.png",
         //    "type":"TILE"
         // },

         // {  
         //    "alias":"1900",
         //    "copyright":"CalTopo",
         //    "description":"Scanned historical maps dating from 1885-1915.",
         //    "info":"Maps from 1885 to 1915",
         //    "maxresolution":14,
         //    "minresolution":5,
         //    "name":"1885-1915",
         //    "opacity":0,
         //    "template":"http://s3-us-west-1.amazonaws.com/ctfun/1900/{z}/{x}/{y}.png",
         //    "type":"TILE"
         // },
         // {  
         //    "alias":"1930",
         //    "copyright":"CalTopo",
         //    "description":"Scanned historical maps dating from 1915-1945.  Maps may contain survey data from prior to 1915.",
         //    "info":"Maps from 1915 to 1945",
         //    "maxresolution":14,
         //    "minresolution":6,
         //    "name":"1915-1945",
         //    "opacity":0,
         //    "template":"http://s3-us-west-1.amazonaws.com/ctfun/1930/{z}/{x}/{y}.png",
         //    "type":"TILE"
         // },
         {  
            "alias":"cm",
            "copyright":"Canada",
            "description":"Scanned 1:50k Canadian topos.",
            "maxresolution":15,
            "minresolution":5,
            "name":"CanMatrix",
            "template":"http://s3-us-west-1.amazonaws.com/nrcan/canmatrix/{z}/{x}/{y}.png",
            "type":"TILE"
         },
         {  
            "alias":"arcgis-us",
            "copyright":"ESRI",
            "description":"ESRI's scanned topo layer.  Low-res but covers Alaska.",
            "maxresolution":15,
            "minresolution":5,
            "name":"ArcGIS US Topo",
            "template":"http://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/{z}/{y}/{x}",
            "type":"TILE"
         },
         {  
            "alias": "arcgis-world",
            //"alias":"eus",
            //"copyright":"ESRI",
            //"description":"ESRI's scanned topo layer.  Low-res but covers Alaska.",
            //"maxresolution":15,
            //"minresolution":5,
            "name":"ArcGIS World Topo",
            "template":"http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
            "type":"TILE"
         },
         {
            "alias":"alaska",
            "name": "GINA Alaska/Canada Topo",
            "copyright": "Geographic Information Network of Alaska",
            "template":"http://swmha.gina.alaska.edu/tilesrv/drg/tile/{x}/{y}/{z}.png",
            "type": "TILE"
         },
         // {  
         //    "alias":"oc",
         //    "copyright":"OCM",
         //    "description":"OpenStreetMap data plus trails and contour lines.",
         //    "maxresolution":17,
         //    "minresolution":0,
         //    "name":"OpenCycleMap",
         //    "template":"http://tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
         //    "type":"TILE"
         // },
         // {
         //    "alias": "tf-terrain",
         //    "name": "Thunderforest Terrain",
         //    "maxresolution":17,
         //    "template": "http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png",
         //    "type": "TILE"
         // },


         // {
         //    "alias": "tf-outdoors",
         //    "name": "TF Outdoors (metric)",
         //    "maxresolution":17,
         //    "template": "http://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png",
         //    "type": "TILE"
         // }


         // {  
         //    "alias":"om",
         //    "copyright":"OSM",
         //    "description":"OpenStreetMap",
         //    "maxresolution":17,
         //    "minresolution":0,
         //    "name":"OpenStreetMap",
         //    "template":"http://tile.openstreetmap.org/{z}/{x}/{y}.png",
         //    "type":"TILE"
         // },
         // {
         //    "name":"Norway Topo",
         //    "template": "http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=toporaster2&zoom={z}&x={x}&y={y}",
         //    "type":"TILE"
         // },
         // {
         //    "name":"Sweden Topo",
         //    "template": "http://map01.eniro.no/geowebcache/service/tms1.0.0/map2x/{z}/{x}/{y}.png",
         //    "tms": true,
         //    "type":"TILE"
         // },
         // {
         //    "name":"Sweden Imagery",
         //    "template": "http://map01.eniro.no/geowebcache/service/tms1.0.0/aerial/{z}/{x}/{y}.png",
         //    "tms": true,
         //    "type":"TILE"
         // },

         //// {
         ////    "alias":"italy",
         ////    "name":"Italy Topo",
         ////    "copyright":"",
         ////    "template":"http://ogsuite.geobeyond.it/geoserver/pcn_proxy/wms?",
         ////    "layers":"pcn_proxy:RN.ZONERISCHIO.CLASSIFICAZIONESISMICA",
         ////    "type":"WMS"
         //// },


         //// problem with this is the projection: EPSG:32633
         // {
         //    "alias":"italy",
         //    "name":"Italy Topo",
         //    "copyright":"",
         //    //"template":"http://ogsuite.geobeyond.it/geoserver/pcn_proxy/wms?",
         //    //"layers":"pcn_proxy:RN.ZONERISCHIO.CLASSIFICAZIONESISMICA",
         //    //"layers":"snow:snowdepthN0138_100m",
         //    "template":"http://wms.pcn.minambiente.it/ogc?map=/ms_ogc/WMS_v1.3/raster/IGM_25000.map",
         //    "version":"1.1.1",
         //    "layers":"CB.IGM25000.32",
         //    "type":"WMS"
         // },

         // {
         //    "alias":"swiss",
         //    "name":"Swiss Topo",
         //    "copyright":"",
         //    "subdomains":['10','11','12','13','14'],
         //    "template":"http://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/20140520/3857/{z}/{x}/{y}.jpeg",
         //    //"template":"http://api3.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/20140520/3857/{z}/{x}/{y}.jpeg",
         //    "type":"TILE"
         // },

         //http://www.basemap.at/index_en.html
        // {
        //     "alias":"austriatopo",
        //     "name": "Austria Topo",
        //     "copyright": "basemap.at",
        //     "subdomains":['1','2','3','4'],
        //     //"template": "http://maps{s}.wien.gv.at/basemap/bmaphidpi/normal/google3857/{z}/{y}/{x}.jpeg", // standard - high dpi
        //     //"template": "http://maps{s}.wien.gv.at/basemap/geolandbasemap/normal/google3857/{z}/{y}/{x}.jpeg", // standard
        //     "template":"http://maps{s}.wien.gv.at/basemap/bmapgrau/normal/google3857/{z}/{y}/{x}.png", // gray with contour lines
        //     //"template":"http://maps{s}.wien.gv.at/basemap/bmapgrau/normal/google3857/12/1430/2215.png"
        //     "type":"TILE"
        //  },
        //  {
        //     "alias":"eurotpop",
        //     "name": "European OpenTopoMap",
        //     "copyright": "OpenTopoMap",
        //     "template":"http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        //     "retina": true,
        //     "type":"TILE"
        //  }

        // france: view-source:http://leaflet.melard.fr/
        // spain: http://www.ign.es/wmts/ign-base?request=GetCapabilities&service=WMTS
        //        http://www.ign.es/wmts/mapa-raster?request=GetCapabilities&service=WMTS
        //        http://www.idee.es/web/guest/directorio-de-servicios?p_p_id=DIRSRVIDEE_WAR_DIRSRVIDEEportlet_INSTANCE_q4BW&p_p_lifecycle=1&p_p_state=normal&p_p_mode=view&p_p_col_id=column-1&p_p_col_count=1&_DIRSRVIDEE_WAR_DIRSRVIDEEportlet_INSTANCE_q4BW_descSrv=VISUALIZACION&_DIRSRVIDEE_WAR_DIRSRVIDEEportlet_INSTANCE_q4BW_supertipo=OGC&_DIRSRVIDEE_WAR_DIRSRVIDEEportlet_INSTANCE_q4BW_tipoServicio=WMTS
        // japan
        // NZ
        // Australia

        ],
        aerial: [
         { 
            "alias":"mbi",
            "copyright": "Mapbox Imagery",
            "name": "Mapbox Imagery",
            "id": "andrewsohn.ihl1p642",
            "type": "MAPBOX"
         },
         {
            "alias":"acrgis-worldimagery",
            "name":"ArcGIS World Imagery",
            "template":"http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            "type":"TILE"
         },
         // {  
         //    "alias":"n",
         //    "copyright":"CalTopo, USDA",
         //    "description":"California-specific 1m aerial imagery from the USDA.  Lower resolution than Google, but more consistent.",
         //    "info":"Imagery from 2009",
         //    "maxresolution":16,
         //    "minresolution":6,
         //    "name":"NAIP Aerial (CA)",
         //    "template":"http://s3-us-west-1.amazonaws.com/caltopo/aerial/{z}/{x}/{y}.png",
         //    "type":"TILE"
         // },
         {  
            "alias":"usi",
            "copyright":"CalTopo",
            "description":"Aerial imagery from the USGS' US Topo multilayer PDFs.  Partial coverage for several western states.",
            "maxresolution":16,
            "minresolution":5,
            "name":"USGS Imagery",
            "template":"http://s3-us-west-1.amazonaws.com/ustopo/orthoimage/{z}/{x}/{y}.png",
            "type":"TILE"
         },
         // {
         //    "alias": "nbmi",
         //    "name":"USGS National Map - Imagery",
         //    "maxresolution":15,
         //    //"template": "http://basemap.nationalmap.gov/arcgis/services/USGSImageryOnly/MapServer/WMSServer",
         //    //"type": "WMS"
         //    "template": "http://basemap.nationalmap.gov/ArcGIS/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
         //    "type":"TILE"
         // },
         {
            "alias": "nbmit",
            "name":"USGS National Map - Imagery+Topo",
            "maxresolution":15,
            "retina": true,
            //"template": "http://basemap.nationalmap.gov/arcgis/services/USGSImageryTopo/MapServer/WMSServer",
            //"type": "WMS"
            "template": "http://basemap.nationalmap.gov/ArcGIS/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}",
            "type":"TILE"
         }
        ]
    },
    overlays: [

         {
            "alias": "nbme",
            "name":"USGS National Map - Elevation",
            "template": "http://basemap.nationalmap.gov/arcgis/services/TNM_Contours/MapServer/WMSServer",
            "type": "WMS"
         },
         {
            "name":"ArcGIS World Shaded Relief",
            "template":"http://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",
            "type":"TILE"
         },
         {  
            "alias":"r",
            "copyright":"CalTopo",
            "description":"Relief shading based on the National Elevation Dataset with added vertical exaggeration.",
            "maxresolution":16,
            "minresolution":5,
            "name":"Shaded Relief",
            "opacity":0,
            "template":"http://s3-us-west-1.amazonaws.com/ctrelief/relief/{z}/{x}/{y}.png",
            "type":"TILE"
         },
         {
            "alias": "nbmi",
            "name":"USGS National Base Map - Shaded Relief",
            "opacity": 1,
            "template": "http://basemap.nationalmap.gov/arcgis/services/USGSShadedReliefOnly/MapServer/WMSServer",
            "type": "WMS"
         },
         {  
            "alias":"c",
            "copyright":"CalTopo",
            "description":"CalTopo's 40 foot contour layer.  Works well on top of aerial imagery or street maps.",
            "maxresolution":16,
            "minresolution":10,
            "name":"40' Contours",
            "opacity":100,
            "template":"http://s3-us-west-1.amazonaws.com/ctcontour/feet/{z}/{x}/{y}.png",
            "type":"TILE"
         },
         {  
            "alias":"c",
            "copyright":"CalTopo",
            "description":"CalTopo's 40 foot contour layer.  Works well on top of aerial imagery or street maps.",
            "maxresolution":16,
            "minresolution":10,
            "name":"40' Contours",
            "opacity":100,
            "template":"http://s3-us-west-1.amazonaws.com/ctcontour/feet/{z}/{x}/{y}.png",
            "type":"TILE"
         },
         {  
            "alias":"sf",
            "copyright":"CalTopo",
            "description":"Slope shading by angle.  May be useful for travel planning in avalanche terrain when coupled with a healthy dose of skepticism.",
            "info":"<span style='color: rgb(245,255,10); background-color: #CCCCCC; margin-left: 5px'>27&deg;-29&deg;<\/span><span style='color: rgb(250,183,0); margin-left: 5px'>30&deg;-31&deg;<\/span><span style='color: rgb(254,121,0); margin-left: 5px'>32&deg;-34&deg;<\/span><span style='color: rgb(255,0,0); margin-left: 5px'>35&deg;-45&deg;<\/span><span style='color: rgb(135,0,225); margin-left: 5px'>46&deg;-50&deg;<\/span><span style='color: rgb(0,0,255); margin-left: 5px'>51&deg;-59&deg;<\/span><span style='color: rgb(0,0,0); margin-left: 5px'>60&deg;+<\/span>",
            "maxresolution":14,
            "minresolution":5,
            "name":"Fixed Slope Shading",
            "opacity":30,
            "template":"http://s3-us-west-1.amazonaws.com/ctslope/relief/{z}/{x}/{y}.png",
            "type":"TILE"
         },
         {  
            "alias":"sg",
            "copyright":"CalTopo",
            "description":"Slope gradient by angle.",
            "info":"<span style='color: rgb(0,255,9); margin-left: 5px'>20&deg;<\/span><span style='color: rgb(245,255,10); background-color: #CCCCCC; margin-left: 5px'>28&deg;<\/span><span style='color: rgb(255,0,0); margin-left: 5px'>40&deg;<\/span><span style='color: rgb(0,0,255); margin-left: 5px'>55&deg;<\/span><span style='color: rgb(0,0,0); margin-left: 5px'>60&deg;<\/span>",
            "maxresolution":14,
            "minresolution":5,
            "name":"Gradient Slope Shading",
            "opacity":30,
            "template":"http://s3-us-west-1.amazonaws.com/ctslope/gradient/{z}/{x}/{y}.png",
            "type":"TILE"
         },
         {  
            "alias":"sma",
            "copyright":"USGS",
            "info":"<span style='color: #00CC00; margin-left: 5px'>USFS<\/span><span style='color: #888888; margin-left: 5px'>NPS<\/span><span style='color: #FE7900; margin-left: 5px'>BLM/BOR<\/span><span style='color: #FAB700; margin-left: 5px'>FWS<\/span><span style='color: #CC0000; margin-left: 5px'>Local<\/span><span style='color: #0000CC; margin-left: 5px'>State<\/span><span style='color: #F0F000; background-color: #CCCCCC; margin-left: 5px'>BIA<\/span><span style='color: #000000; margin-left: 5px'>DOD/DOE<\/span>",
            "maxresolution":16,
            "minresolution":6,
            "name":"Land Management",
            "opacity":100,
            "template":"http://caltopo.com:8000/sma/{z}/{x}/{y}.png",
            "type":"TILE"
         },
         // {  
         //    "alias":"sc",
         //    "alphaOverlay":true,
         //    "copyright":"CalTopo",
         //    "maxresolution":14,
         //    "minresolution":5,
         //    "name":"DEM Shading",
         //    "opacity":30,
         //    "template":"/resource/imagery/shading/{V}/{z}/{x}/{y}.png",
         //    "type":"TILE"
         // },
         // {  
         //    "alias":"vs",
         //    "alphaOverlay":true,
         //    "copyright":"CalTopo",
         //    "maxresolution":14,
         //    "minresolution":5,
         //    "name":"Viewshed Analysis",
         //    "opacity":30,
         //    "template":"/resource/imagery/viewshed/{V}/{z}/{x}/{y}.png",
         //    "type":"TILE"
         // },
         // {  
         //    "alias":"sl",
         //    "alphaOverlay":true,
         //    "copyright":"CalTopo",
         //    "maxresolution":14,
         //    "minresolution":5,
         //    "name":"Sunlight",
         //    "opacity":30,
         //    "template":"/resource/imagery/sunlight/{V}/{z}/{x}/{y}.png",
         //    "type":"TILE"
         // },
         // {  
         //    "alias":"mai",
         //    "alphaOverlay":false,
         //    "copyright":"NASA",
         //    "maxresolution":9,
         //    "minresolution":2,
         //    "name":"MODIS Archive Imagery",
         //    "opacity":0,
         //    "template":"/resource/imagery/modis-archive-imagery/{V}/{z}/{x}/{y}.jpg",
         //    "type":"TILE"
         // }
      ]
  };
}]);