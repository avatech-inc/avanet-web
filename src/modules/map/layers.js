
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
                let lang = window.navigator.userLanguage || window.navigator.language
                let country = Global.user.country
                let units = Global.user.settings.elevation

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

            if (service.baseLayers.terrain) {
                for (let terrainLayer of service.baseLayers.terrain) {
                    if (terrainLayer.alias === alias) {
                        layer = terrainLayer
                    }
                }
            }

            if (service.baseLayers.aerial) {
                for (let aerialLayer of service.baseLayers.aerial) {
                    if (aerialLayer.alias === alias) {
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
