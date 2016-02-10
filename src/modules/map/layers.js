
const Layers = [
    'Restangular',
    'Global',

    (
        Restangular,
        Global
    ) => {
        let service = {}

        service.loaded = Restangular
            .one('users', Global.user._id)
            .one('maps')
            .get()

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

        service.baseLayers = service.loaded.$object

        return service
    }
]

export default Layers
