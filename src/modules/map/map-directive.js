
import { TerrainLayer } from 'leaflet-terrain'

import './map-directive.html'
import './observation-map-popup.html'

const Map = [
    '$timeout',
    '$q',
    '$state',
    '$templateRequest',
    '$compile',
    'snowpitExport',
    'Global',
    'mapLayers',
    '$http',
    '$log',
    '$uibModal',

    (
        $timeout,
        $q,
        $state,
        $templateRequest,
        $compile,
        snowpitExport,
        Global,
        mapLayers,
        $http,
        $log,
        $uibModal
    ) => ({
        restrict: 'A',
        templateUrl: '/modules/map/map-directive.html',
        scope: {
            map: '=map',
            terrainLayer: '=terrainLayer',
            showObs: '=showObs',
            profiles: '=obs',
            detailMode: '=detailMode',
            loadingNew: '=loadingNew',
            loadingProfiles: '=loading',
            hoverOb: '=hoverOb',
            obSearch: '=search',
            showTerrain: '=showTerrain',
            load: '=load'
        },
        link: (scope, element) => {
            scope.global = Global
            scope.formatters = snowpitExport.formatters
            scope.mapLayers = mapLayers

            // get color maps for terrain viz legends
            scope.colorMaps = TerrainLayer.ColorMaps

            // defaults
            if (typeof scope.showTerrain === 'undefined') scope.showTerrain = true
            if (typeof scope.showObs === 'undefined') scope.showObs = true

            let loaded = false
            let loadMap = () => {
                loaded = true

                // pre-compile observation map popup
                $templateRequest('/modules/map/observation-map-popup.html')
                    .then(templateHtml => {
                        scope.compiledPopup = $compile(angular.element(templateHtml))
                    })

                // get map holder DOM element
                let mapElement = element[0].querySelector('.map-holder')

                let newOb = (type, latlng) => {
                    // lng/lat array
                    let location = [
                        parseFloat(latlng.lng.toFixed(7)),
                        parseFloat(latlng.lat.toFixed(7))
                    ]

                    // for snowpit, go to snowpit editor
                    if (type === 'snowpit') {
                        $state.go('index.profileEditor.details', {
                            profileId: 'new',
                            location: location
                        })

                        return
                    }

                    // for everything else, show edit modal
                    $uibModal.open({
                        templateUrl: '/modules/observations/new.html',
                        controller: 'NewObservationModalController',
                        backdrop: 'static',
                        windowClass: 'width-480',
                        resolve: {
                            ob: () => ({ type: type, location: location })
                        }
                    })
                }

                 // init leaflet map
                scope.map = L.map(mapElement, {
                    zoomControl: false,
                    minZoom: 3,
                    maxZoom: 18,
                    worldCopyJump: true,
                    // context menu
                    contextmenu: true,
                    contextmenuWidth: 140,
                    contextmenuItems: [{
                        text: 'Avalanche',
                        callback: e => newOb('avalanche', e.latlng)
                    }, {
                        text: 'Snowpack',
                        callback: e => newOb('snowpack', e.latlng)
                    }, {
                        text: 'Snowpack Test',
                        callback: e => newOb('snowpack-test', e.latlng)
                    }, {
                        text: 'Snowpit',
                        callback: e => newOb('snowpit', e.latlng)
                    }, {
                        text: 'Weather',
                        callback: e => newOb('weather', e.latlng)
                    }, {
                        text: 'Wind',
                        callback: e => newOb('wind', e.latlng)
                    }]
                })

                // disable scroll wheel zoom
                // scope.map.scrollWheelZoom.disable();

                // add markers layer
                scope.mapLayer = L.layerGroup().addTo(scope.map)

                // add zoom control to map
                new L.Control.Zoom({ position: 'bottomright' }).addTo(scope.map)
                // L.control.zoomslider({ position: 'bottomright' }).addTo(scope.map);

                // add scale control to map
                // L.control.scale({
                //     metric: true,
                //     imperial: true,
                //     position: 'topleft'
                // }).addTo(scope.map);

                let mapLoaded = $q.defer()

                scope.map.on('load', e => mapLoaded.resolve())

                // setup heatmap
                // let heatMap

                // setTimeout(() => {
                //     heatMap = L.heatLayer(
                //         [],
                //         {
                //             radius: 1,
                //             blur: 1,
                //             maxZoom: 20
                //         }
                //     ).addTo(scope.map)
                // }, 10)

                // setup clustering
                let pruneCluster = new PruneCluster.PruneClusterForLeaflet()
                pruneCluster.Cluster.Size = 10

                scope.map.addLayer(pruneCluster)

                // render observation icons
                pruneCluster.PrepareLeafletMarker = (leafletMarker, data) => {
                    // detailed mode
                    if (scope.detailMode) {
                        let markerClass = 'count-icon'

                        // append observation type to class
                        markerClass += ' ' + data.observation.type

                        // append redFlag
                        if (data.observation.redFlag) markerClass += ' redFlag'

                        // set marker icon based on observation type
                        leafletMarker.setIcon(L.divIcon({
                            className: markerClass,
                            html: '',
                            iconSize: [30, 45]
                        }))

                        // clear existing bindings
                        leafletMarker.off('click')

                        // show popup on click
                        leafletMarker.on('click', e => {
                            let existingPopup = leafletMarker.getPopup()

                            // if popup doesn't exist, create it
                            if (!existingPopup) {
                                // create scope for popup (true indicates isolate scope)
                                let newScope = scope.$new(true)

                                newScope.profile = data.observation

                                // bind scope to pre-compiled popup template
                                scope.compiledPopup(newScope, clonedElement => {
                                    // bind popup with compiled template html
                                    leafletMarker.bindPopup(clonedElement[0], {
                                        offset: new L.Point(0, -10)
                                    })
                                })

                                scope.$apply()
                                e.target.openPopup()
                            }
                        })

                    // heatmap mode
                    } else {
                        // if single icon, style as cluster icon
                        leafletMarker.setIcon(L.divIcon({
                            className: 'prunecluster',
                            html: '<div><span>1</span></div>',
                            iconSize: [30, 30]
                        }))

                        // clear existing bindings
                        leafletMarker.off('click')

                        // zoom in on click
                        leafletMarker.on('click', e => scope.map.setView(
                            e.latlng,
                            11,
                            { animate: true }
                        ))
                    }
                }

                // render observation cluster icons
                pruneCluster.BuildLeafletClusterIcon = cluster => {
                    let className = 'prunecluster'

                    // if in detailed mode
                    if (scope.detailMode) className += ' detailed'

                    // hacky yet highly performant way to determine if there
                    // is a red flag in the cluster
                    let redFlagInCluster = cluster.stats[1] > 0

                    if (redFlagInCluster) className += ' redFlag'

                    // create icon
                    return new L.DivIcon({
                        html: '<div><span>' + cluster.population + '</span></div>',
                        className: className,
                        iconSize: L.point(30, 30)
                    })
                }

                // plot obs on map
                let obsOnMap = {}

                let plotObsOnMap = () => {
                    angular.forEach(scope.profiles, profile => {
                        // already on map
                        let existingMarker = obsOnMap[profile._id]

                        if (existingMarker) {
                            // if deleted, remove it from map and from list
                            if (profile.removed) {
                                pruneCluster.RemoveMarkers( // eslint-disable-line new-cap
                                    [existingMarker]
                                )

                                delete obsOnMap[profile._id]
                            }

                        // not on map (ignore if removed)
                        } else if (!profile.removed) {
                            let marker = new PruneCluster.PruneCluster.Marker(
                                profile.location[1],
                                profile.location[0]
                            )

                            // associate profile with marker
                            marker.data.observation = angular.copy(profile)

                            // this looks hacky but it's by far the most performant way to keep
                            // track of red flags (uses the PruneCluster lib's 'category' feature)
                            marker.category = + profile.redFlag

                            // add to map
                            pruneCluster.RegisterMarker(marker) // eslint-disable-line new-cap

                            // keep track of all markers placed on map
                            obsOnMap[profile._id] = marker
                        }
                    })

                    pruneCluster.ProcessView() // eslint-disable-line new-cap
                }

                // search
                let searchObs = () => {
                    if (!scope.obSearch) return

                    // reset heatmap
                    // if (heatMap) heatMap.setLatLngs([])

                    // hide all markers
                    angular.forEach(obsOnMap, marker => {
                        marker.filtered = true
                        marker.data.filtered = true
                    })

                    // iterate through obs and filter
                    angular.forEach(scope.profiles, ob => {
                        ob.filtered = true

                        if (scope.obSearch.doSearch(ob)) {
                            ob.filtered = false
                            obsOnMap[ob._id].filtered = false
                            obsOnMap[ob._id].data.filtered = false

                            // add to heatmap
                            // if (heatMap) {
                            //     heatMap.addLatLng([
                            //         ob.location[1],
                            //         ob.location[0]
                            //     ])
                            // }
                        }
                    })

                    pruneCluster.ProcessView() // eslint-disable-line new-cap
                }

                // debounce ob search
                let _searchTimeout

                scope.$watch('obSearch', () => {
                    if (!scope.obSearch) return

                    if (_searchTimeout) $timeout.cancel(_searchTimeout)

                    _searchTimeout = $timeout(() => searchObs(), 200)
                }, true)

                // go to location selected in location search
                scope.mapSearchSelect = location => {
                    if (location.lat && location.lng) {
                        scope.map.setView(
                            [
                                location.lat,
                                location.lng
                            ],
                            12, // zoom
                            { animate: false }
                        )
                    }
                }

                scope.setBaseLayer = (layer, clicked) => {
                    if (__PROD__) {
                        if (clicked) {
                            analytics.track('set base layer', {
                                alias: layer.alias,
                                name: layer.name
                            })
                        }
                    }

                    scope.selectedBaseLayer = layer

                    let newBaseLayer

                    if (layer.type === 'TILE') {
                        let options = {
                            zIndex: 2,
                            opacity: 1,
                            detectRetina: true,
                            errorTileUrl: 'https://s3.amazonaws.com/avatech-static/empty.png',
                            tms: layer.tms === null ? false : layer.tms,
                            reuseTiles: true, updateInterval: 400
                        }

                        if (layer.retina !== null) options.detectRetina = layer.retina
                        if (layer.maxresolution) options.maxNativeZoom = layer.maxresolution
                        if (layer.subdomains) options.subdomains = layer.subdomains

                        // if (layer.proxy) {
                        //     var _url = "http://localhost:4000/?url=" +
                        //         _url.substr(_url.indexOf("://") + 3);
                        // }

                        newBaseLayer = L.tileLayer(layer.template, options)
                    } else if (layer.type === 'WMS') {
                        let options = {
                            zIndex: 2,
                            opacity: 1,
                            // detectRetina: true,
                            maxNativeZoom: 16,
                            format: 'image/png',
                            errorTileUrl: 'https://s3.amazonaws.com/avatech-static/empty.png',
                            reuseTiles: true, updateInterval: 400
                        }

                        if (layer.layers) {
                            options.layers = layer.layers
                        } else {
                            options.layers = 0
                        }

                        if (layer.version) {
                            options.version = layer.version
                        }

                        newBaseLayer = L.tileLayer.wms(layer.template, options)
                    } else if (layer.type === 'MAPBOX') {
                        let options = {}

                        if (layer.maxresolution) {
                            options.maxNativeZoom = layer.maxresolution
                        }

                        // newBaseLayer = L.mapbox.tileLayer(layer.id, options);

                        newBaseLayer = L.tileLayer('https://{s}.tiles.mapbox.com/v4/{layerId}/{z}/{x}/{y}{retina}.png?access_token={accessToken}', { // eslint-disable-line max-len
                            accessToken: 'pk.eyJ1IjoiYW5kcmV3c29obiIsImEiOiJmWVdBa0QwIn0.q_Esm5hrpZLbl1XQERtKpg', // eslint-disable-line max-len
                            layerId: layer.id,
                            retina: L.Browser.retina ? '@2x' : '',
                            attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
                            reuseTiles: true,
                            updateInterval: 400
                            // crossOrigin: true
                        })
                    }

                    // add new layer to map
                    if (newBaseLayer) newBaseLayer.addTo(scope.map)

                    // remove old layer from map (todo: should we keep it?)
                    if (scope.baseLayer) scope.map.removeLayer(scope.baseLayer)

                    // keep track of base layer on scope
                    scope.baseLayer = newBaseLayer

                    // save to user settings
                    scope.global.setUserSetting('defaultMap', layer.alias)
                }

                 // re-render observation icons when zoom level is changed
                let detailedZoomMin = 9

                scope.detailMode = true

                scope.map.on('zoomend', e => {
                    let zoom = scope.map.getZoom()

                    if (!scope.detailMode && zoom >= detailedZoomMin) {
                        $log.debug('DETAIL MODE ON')
                        scope.detailMode = true

                        // redraw icons
                        pruneCluster.RedrawIcons() // eslint-disable-line new-cap
                        pruneCluster.ProcessView() // eslint-disable-line new-cap

                        // hide heatmap
                        // if (heatMap) {
                        //     heatMap.setOptions({
                        //         radius: 1,
                        //         blur: 1,
                        //         maxZoom: 20
                        //     })
                        // }
                    } else if (scope.detailMode && zoom < detailedZoomMin) {
                        $log.debug('DETAIL MODE OFF')
                        scope.detailMode = false

                        // redraw icons
                        pruneCluster.RedrawIcons() // eslint-disable-line new-cap
                        pruneCluster.ProcessView() // eslint-disable-line new-cap

                        // show heatmap
                        // if (heatMap) {
                        //     heatMap.setOptions({
                        //         radius: 10,
                        //         blur: 15,
                        //         maxZoom: zoom // (zoom + (zoom / 4))
                        //     })
                        // }

                        // track zoom on mixpanel (to see which zoom levels are most popular)
                        if (__PROD__) {
                            analytics.track('zoom', { zoom: zoom })
                        }
                    }
                })

                scope.map.on('mousemove', e => {
                    scope.$apply(() => {
                        scope.mapCursorLocation = e.latlng

                        scope.terrainLayer.latlngToTerrainData(e.latlng).then(terrainData => {
                            scope.mapCursorElevation = terrainData.elevation
                        })
                    })
                })

                scope.map.on('mouseout', e => {
                    scope.$apply(() => {
                        scope.mapCursorLocation = null
                    })
                })

                // set initial location and zoom level
                let defaultZoom = 13
                let initialLocation = [40.633052, -111.7111795]

                if (scope.global.user.location) {
                    initialLocation = [
                        scope.global.user.location[1],
                        scope.global.user.location[0]
                    ]
                }

                scope.map.setView(initialLocation, defaultZoom)

                // set base layer after map has been initialized and layers
                // have been loaded from server
                $q.all([
                    mapLoaded,
                    scope.mapLayers.loaded
                ]).then(() => {
                    // get saved default base layer
                    let savedMap = scope.global.user.settings.defaultMap
                    let baseMap = scope.mapLayers.getLayerByAlias(savedMap)

                    if (!baseMap) baseMap = scope.mapLayers.baseLayers.terrain[0]

                    // setTimeout is needed to solve that bug where the zoom animation is incorrect
                    setTimeout(() => scope.setBaseLayer(baseMap))

                    // load obs
                })

                // resize map when window is resized
                scope.$on('resizeMap', () => {
                    $timeout(() => scope.map.invalidateSize())
                    // weird hack to ensure correct new window size
                    $timeout(() => scope.map.invalidateSize(), 200)
                })

                // load profiles
                scope.loadingNew = false

                scope.loadProfiles = showLoader => {
                    let bounds = scope.map.getBounds()

                    if (showLoader !== false) scope.loadingNew = true

                    // abort previous requests
                    // if (scope.canceler) scope.canceler.resolve();
                    // scope.canceler = $q.defer();

                    // padding in pixels (so we don't get cut-off map points)
                    let padding = 5

                    let pointNE = scope.map.latLngToContainerPoint(bounds._northEast)

                    pointNE.y += padding
                    pointNE.x -= padding

                    pointNE = scope.map.containerPointToLatLng(pointNE)

                    let pointSW = scope.map.latLngToContainerPoint(bounds._southWest)

                    pointSW.y -= padding
                    pointSW.x += padding

                    pointSW = scope.map.containerPointToLatLng(pointSW)

                    $http({
                        method: 'GET',
                        url: window.apiBaseUrl + 'observations',
                        responseType: 'json',
                        params: {
                            nelat: pointNE.lat, nelng: pointNE.lng,
                            swlat: pointSW.lat, swlng: pointSW.lng,
                            verbose: false
                        }
                    })
                    .then(res => {
                        scope.profiles = res.data

                        plotObsOnMap()
                        searchObs()

                        scope.loadingProfiles = false
                        scope.loadingNew = false
                    })
                }

                // handle loading of observations
                if (scope.showObs) {
                    scope.loadingProfiles = true
                    scope.loadProfiles(false)

                    setTimeout(() => {
                        setInterval(() => {
                            scope.loadProfiles(false)
                        }, 60000)
                    }, 60000)
                }

                scope.map.on('moveend', () => {
                    if (scope.showObs) {
                        scope.loadProfiles()
                    }
                })

                // make sure map loads properly
                $timeout(() => {
                    scope.map.invalidateSize()
                })

                let hoverDelay

                scope.$watch('hoverOb', () => {
                    // debounce
                    if (hoverDelay) $timeout.cancel(hoverDelay)

                    hoverDelay = $timeout(() => {
                        scope.hideMapButtons = !!scope.hoverOb

                        // if ob is specified, only show that ob
                        if (scope.hoverOb) {
                            angular.forEach(obsOnMap, marker => {
                                // hide
                                marker.filtered = true

                                // show if matches filter
                                if (scope.hoverOb === marker.data.observation._id) {
                                    marker.filtered = false
                                }
                            })

                        // if no ob is specified, reset to former value
                        } else {
                            angular.forEach(obsOnMap, marker => {
                                marker.filtered = marker.data.filtered
                            })
                        }

                        pruneCluster.ProcessView() // eslint-disable-line new-cap
                    }, 50)
                }, true)

                // hack to hide zoom control on hideMapButtons
                scope.$watch('hideMapButtons', () => {
                    $(mapElement)
                        .find('.leaflet-control-zoom')
                        .css('opacity', scope.hideMapButtons ? 0 : 1)
                })

                // ---------------------------------------------------
                // --------------------- TERRAIN ---------------------
                // ---------------------------------------------------

                // init terrain layer
                if (scope.showTerrain) {
                    scope.overlayOpacity = 0.5

                    let terrainOptions = {
                        pngUrl: 'https://tiles-{s}.avatech.com/{z}/{x}/{y}_.png',
                        pbfUrl: 'https://s3.amazonaws.com/avatech-pbf-tiles/mh_global_v2/{z}/{x}/{y}.pbf',

                        protoUrl: 'https://s3.amazonaws.com/avatech-pbf-tiles/model/RasterESA.proto',

                        zIndex: 999,
                        opacity: scope.overlayOpacity,
                        updateWhenIdle: false
                    }

                    if (window.Worker) {
                        terrainOptions.pngWorker = '/assets/png-worker.js'
                        terrainOptions.pbfWorker = '/assets/pbf-worker.js'
                    }

                    scope.terrainLayer = new TerrainLayer(terrainOptions)

                    scope.terrainLayer._zoomAnimated = false;
                    scope.terrainLayer.addTo(scope.map)

                    scope.isTerrainLoaded = true

                    // custom terrain visualization
                    scope.elevationMax = !Global.user.settings.elevation ? 8850 : 8850

                    scope.customTerrain = {
                        color: '#FFFF00',

                        elev_low: 0,
                        elev_high: scope.elevationMax,

                        slope_low: 0,
                        slope_high: 70,

                        aspect_low: 0,
                        aspect_high: 359,
                    }

                    let customTerrainTimer

                    scope.$watch('terrainOverlay', () => {
                        scope.terrainLayer.setType(scope.terrainOverlay)
                    })

                    scope.$watch('overlayOpacity', () => {
                        scope.terrainLayer.setOpacity(scope.overlayOpacity)
                    })

                    scope.$watch('customTerrain', () => {
                        if (customTerrainTimer) clearTimeout(customTerrainTimer)

                        customTerrainTimer = setTimeout(() => {
                            if (scope.customTerrain.color.indexOf('#') === 0) {
                                scope.customTerrain.color = scope.customTerrain.color.substr(1)
                            }

                            scope.terrainLayer.setParams(
                                angular.copy(scope.customTerrain)
                            )
                        }, 30)
                    }, true)
                }

                scope.capitalizeFirstLetter = str => {
                    if (!str) return ''

                    return str.charAt(0).toUpperCase() + str.slice(1)
                }

                // map grid overlay
                let gridOverlayLayer

                scope.$watch('gridOverlay', (newOverlay, oldOverlay) => {
                    if (newOverlay !== oldOverlay && gridOverlayLayer) {
                        scope.map.removeLayer(gridOverlayLayer)
                        gridOverlayLayer = null
                    }

                    if (newOverlay === 'utm') {
                        gridOverlayLayer = new UTMGridLayer()
                    } else if (newOverlay === 'dd') {
                        // gridOverlayLayer = new LatLngGridLayer();
                    }

                    if (gridOverlayLayer) {
                        gridOverlayLayer.addTo(scope.map)
                        gridOverlayLayer.setZIndex(99999)
                    }
                })

                // todo: duplicate
                scope.formatElev = val => {
                    let _val = val

                    if (!Global.user.settings) return _val

                    // meters
                    if (!Global.user.settings.elevation) {
                        _val = val + ' m'

                    // feet
                    } else {
                        _val = Math.round(val * 3.28084).toFixed(0) + ' ft'
                    }

                    return _val
                }

                scope.formatTempRange = (val1, val2) => {
                    let _val = val1

                    if (!Global.user.settings) return _val

                    // meters
                    if (!Global.user.settings.elevation) {
                        _val = val1 + '-' + val2 + ' m'

                    // feet
                    } else {
                        _val = (
                            Math.round(val1 * 3.28084).toFixed(0) +
                            '-' +
                            Math.round(val2 * 3.28084).toFixed(0) + ' ft'
                        )
                    }

                    return _val
                }

                scope.clickCoverageLink = () => {
                    window.open('http://avatech-inc.github.io/terrain-coverage/')

                    return true
                }

                scope.formatDegSlider = val => (val + '°')
            }

            scope.$watch('load', () => {
                if (scope.load && !loaded) loadMap()
            })
        }
    })
]

export default Map
