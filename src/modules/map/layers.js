
/* eslint-disable quote-props */
const DeprecatedAliases = {
    'mbi': 'mbx-aerial',
    'acrgis-worldimagery': 'esriworld-aerial',
    'nbmit': 'usgsnatmap-aerial',
    'nz-aerial': 'nzl-aerial',
    'sweden-aerial': 'swe-aerial',
    'mbus': 'mbx-enimp-topo',
    'mbmetric': 'mbx-enmetric-topo',
    'mbworld': 'mbx-world-topo',
    'mbfr': 'mbx-fra-topo',
    'mbde': 'mbx-deu-topo',
    'nbm': 'usgs-topo',
    't': 'caltopo-topo',
    'cm': 'canmatrix-topo',
    'arcgis-us': 'esrius-topo',
    'arcgis-world': 'esriworld-topo',
    'alaska': 'gina-topo',
    'nz-topo': 'nzl-topo',
    'sweden-topo': 'swe-topo',
    'swisstopo': 'che-topo',
    'austriatopo': 'aut-topo',
    'fr-topo': 'fra-topo',
    'au-topo': 'aus-topo',
    'norway-topo': 'nor-topo',
    'japan-topo': 'jpn-topo'
}
/* eslint-enable quote-props */

const Layers = [
    'Restangular',
    'Global',

    (
        Restangular,
        Global
    ) => {
        let service = {
            baseLayers: {
                aerial: [],
                terrain: []
            }
        }

        service.loaded = Restangular
            .one('users', Global.user._id)
            .one('maps')
            .get()
            .then(layers => {
                let navigator = window && window.navigator;
                let lang = navigator.userLanguage || navigator.language;

                let user = Global && Global.user;
                let country = user && user.country;
                let units = user && user.settings && user.settings.units || 1

                lang = lang.slice(0, 2)

                // Backwards compatiblity for country preferences
                if (country === 'US') {
                    lang = 'en'
                } else if (country === 'CA') {
                    lang = 'en'
                } else if (country === 'FR') {
                    lang = 'fr'
                } else if (country === 'DE') {
                    lang = 'de'
                } else if (country === 'AT') {
                    lang = 'de'
                }

                for (let layer of layers.aerial) {
                    if (!('lang' in layer) || layer.lang === lang) {
                        if (!('units' in layer) || layer.units === units) {
                            service.baseLayers.aerial.push(layer)
                        }
                    }
                }

                for (let layer of layers.terrain) {
                    if (!('lang' in layer) || layer.lang === lang) {
                        if (!('units' in layer) || layer.units === units) {
                            service.baseLayers.terrain.push(layer)
                        }
                    }
                }
            })

        service.getLayerByAlias = alias => {
            if (!service.baseLayers) return null

            let layer
            let _alias = alias

            if (alias in DeprecatedAliases) {
                _alias = DeprecatedAliases[alias]
            }

            if (service.baseLayers.terrain) {
                for (let terrainLayer of service.baseLayers.terrain) {
                    if (terrainLayer.alias === _alias) {
                        layer = terrainLayer
                    }
                }
            }

            if (service.baseLayers.aerial) {
                for (let aerialLayer of service.baseLayers.aerial) {
                    if (aerialLayer.alias === _alias) {
                        layer = aerialLayer
                    }
                }
            }

            return layer
        }

        return service
    }
]

export default Layers
