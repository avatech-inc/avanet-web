const _ = {}

import lodashmap from 'lodash.map'
import minBy from 'lodash.minby'
import maxBy from 'lodash.maxby'
import sumBy from 'lodash.sumby'
import sum from 'lodash.sum'

_.map = lodashmap
_.minBy = minBy
_.maxBy = maxBy
_.sumBy = sumBy
_.sum = sum

import {
  getAverage,
  getBearing
} from './helpers'

/**

*/
export function getSegmentPoints(
    points,
    pointIndexStart,
    pointIndexEnd
) {
    if (!points) return []

    let startIndex = 0
    let endIndex = 0

    for (let i = 0; i < points.length; i++) {
        if (points[i].originalIndex === pointIndexStart) {
            startIndex = i
        } else if (points[i].originalIndex === pointIndexEnd) {
            endIndex = i
        }
    }
    return points.slice(startIndex, endIndex + 1)
}

/**

*/
export function getSegmentStats(
    completeTerrain,
    routeStats
) {
    function getSummary(
        completeTerrain,
        timeEstimate,
        elevationDelta,
        routeDistance,
        segmentBearing,
        routeStats
    ) {
        let avgAspect = null
        let minAspect = null
        let maxAspect = null

        let avgSlope = null
        let minSlope = null
        let maxSlope = null
        if (completeTerrain) {
            avgAspect = getAverage(_.map(routeStats, 'aspect'))
            const minAspectPoint = _.minBy(routeStats, 'aspect')
            if (minAspectPoint) minAspect = minAspectPoint.aspect
            const maxAspectPoint = _.maxBy(routeStats, 'aspect')
            if (maxAspectPoint) maxAspect = maxAspectPoint.aspect

            avgSlope = getAverage(_.map(routeStats, 'slope'))
            const minSlopePoint = _.minBy(routeStats, 'slope')
            if (minSlopePoint) minSlope = minSlopePoint.slope
            const maxSlopePoint = _.maxBy(routeStats, 'slope')
            if (maxSlopePoint) maxSlope = maxSlopePoint.slope
        }
        let minElevation = null
        let maxElevation = null
        let upVert = null
        let downVert = null

        const minElevationPoint = _.minBy(routeStats, 'elevation')
        if (minElevationPoint && minElevationPoint.elevation !== null) {
            minElevation = minElevationPoint.elevation
        }

        const maxElevationPoint = _.maxBy(routeStats, 'elevation')
        if (maxElevationPoint && maxElevationPoint.elevation) {
            maxElevation = maxElevationPoint.elevation
        }

        const verticalUp = _.sumBy(routeStats, 'verticalUp')
        if (verticalUp) {
            upVert = verticalUp
        }
        const verticalDown = _.sumBy(routeStats, 'verticalDown')
        if (verticalDown) {
            downVert = verticalDown
        }

        const summary = {
            timeEstimateMinutes: timeEstimate,
            distance: routeDistance,

            verticalUp: upVert,
            verticalDown: downVert,

            elevationChange: elevationDelta,
            elevationMin: minElevation,
            elevationMax: maxElevation,

            slopeMin: minSlope,
            slopeMax: maxSlope,
            slopeAverage: avgSlope,

            aspectMin: minAspect,
            aspectMax: maxAspect,
            aspectAverage: avgAspect,

            bearing: segmentBearing,
        }
        return summary
    }

    if (
        !routeStats ||
        routeStats.length < 2
    ) return {}

    const startPoint = routeStats[0]
    const endPoint = routeStats[routeStats.length - 1]

    if (
        startPoint.elevation === null ||
        endPoint.elevation === null
    ) return {}

    return getSummary(
        completeTerrain,
        endPoint.totalTimeEstimateMinutes - startPoint.totalTimeEstimateMinutes, // time estimate
        endPoint.elevation - startPoint.elevation, // elevation change
        endPoint.totalDistance - startPoint.totalDistance, // segment distance
        getBearing(startPoint, endPoint),
        routeStats
    )
}