
import {
  getBearing,
  getSegmentDistance,
  calculateMunterEstimate
} from './helpers'

/**

*/
export function getRouteFoundation(
    elevationOnly,
    points,
    elevData,
    terrainData,
    munterRate
) {
    if (!points) return []
    const statsPoints = []

    let totalDistance = 0
    let totalTimeEstimateMinutes = 0
    let originalIndex = 0

    if (elevationOnly) {
        if (elevData) {
            for (let i = 0; i < elevData.length; i++) {
                if (!elevData[i]) continue
                let statsPoint = {
                    lat: elevData[i].lat,
                    lng: elevData[i].lng,
                    elevation: elevData[i].elev,
                    original: elevData[i].original,
                    slope: null,
                    aspect: null
                }
                // defaults for first point
                statsPoint.totalDistance = 0
                statsPoint.totalTimeEstimateMinutes = 0

                // assign index for tracking
                statsPoint.index = i

                // assign original index for tracking markers
                if (statsPoint.original) {
                    statsPoint.originalIndex = originalIndex
                    originalIndex++
                }

                if (i === 0) continue

                // keep track of distance
                const segmentDistance = getSegmentDistance(elevData[i - 1], elevData[i])
                statsPoint.distance = segmentDistance
                totalDistance += segmentDistance
                statsPoint.totalDistance = totalDistance

                // keep track of bearing
                statsPoint.bearing = getBearing(elevData[i - 1], elevData[i])

                // keep track of vertical up/down and munter time estimates
                statsPoint = calculateMunterEstimate(
                    totalTimeEstimateMinutes,
                    munterRate,
                    statsPoint,
                    elevData[i - 1].elev,
                    elevData[i].elev,
                    segmentDistance
                )
                totalTimeEstimateMinutes = statsPoint.totalTimeEstimateMinutes
                statsPoints.push(statsPoint)
            }
        }
    } else {
        // for (let i = 0; i < elevData.length; i++) {
        //     if (!elevData[i]) continue
        //
        //     let statsPoint
        //
        //     let slopeVal = null
        //     let aspectVal = null
        //
        //     // GET CORRESPONDING LAT/LNG.slope & .aspect IN points
        //     for (let j = 0; j < points.length; j++) {
        //         if (
        //           points[j].lat.toFixed(5) === elevData[i].lat.toFixed(5) &&
        //           points[j].lng.toFixed(5) === elevData[i].lng.toFixed(5)
        //         ) {
        //             slopeVal = terrainData[j].slope
        //             aspectVal = terrainData[j].aspect
        //         }
        //     }
        //
        //     // BUILD POINT OB
        //     statsPoint = {
        //         lat: elevData[i].lat,
        //         lng: elevData[i].lng,
        //         original: elevData[i].original,
        //         elevation: elevData[i].elev,
        //         slope: slopeVal,
        //         aspect: aspectVal,
        //         index: i,  // assign index for tracking,
        //         totalDistance: 0,
        //         totalTimeEstimateMinutes: 0
        //     }
        //
        //     // assign original index for tracking markers
        //     if (statsPoint.original) {
        //         statsPoint.originalIndex = originalIndex
        //         originalIndex++
        //     }
        //
        //     if (i === 0) continue
        //
        //     // keep track of distance
        //     const segmentDistance = getSegmentDistance(elevData[i - 1], elevData[i])
        //     statsPoint.distance = segmentDistance
        //     totalDistance += segmentDistance
        //     statsPoint.totalDistance = totalDistance
        //
        //     // keep track of bearing
        //     statsPoint.bearing = getBearing(elevData[i - 1], elevData[i])
        //
        //     // keep track of vertical up/down and munter time estimates
        //     statsPoint = calculateMunterEstimate(
        //         totalTimeEstimateMinutes,
        //         munterRate,
        //         statsPoint,
        //         elevData[i - 1],
        //         elevData[i],
        //         segmentDistance
        //     )
        //     totalTimeEstimateMinutes = statsPoint.totalTimeEstimateMinutes
        //     statsPoints.push(statsPoint)
        // }
        for (let i = 0; i < points.length; i++) {
            if (!points[i]) continue
            let statsPoint = {
                lat: points[i].lat,
                lng: points[i].lng,
                original: points[i].original,
                elevation: terrainData[i].elevation,
                slope: terrainData[i].slope,
                aspect: terrainData[i].aspect
            }
            // defaults for first point
            statsPoint.totalDistance = 0
            statsPoint.totalTimeEstimateMinutes = 0

            // assign index for tracking
            statsPoint.index = i

            // assign original index for tracking markers
            if (statsPoint.original) {
                statsPoint.originalIndex = originalIndex
                originalIndex++
            }

            if (i === 0) continue

            // keep track of distance
            const segmentDistance = getSegmentDistance(points[i - 1], points[i])
            statsPoint.distance = segmentDistance
            totalDistance += segmentDistance
            statsPoint.totalDistance = totalDistance

            // keep track of bearing
            statsPoint.bearing = getBearing(points[i - 1], points[i])

            // keep track of vertical up/down and munter time estimates
            statsPoint = calculateMunterEstimate(
                totalTimeEstimateMinutes,
                munterRate,
                statsPoint,
                terrainData[i - 1].elevation,
                terrainData[i].elevation,
                segmentDistance
            )
            totalTimeEstimateMinutes = statsPoint.totalTimeEstimateMinutes
            statsPoints.push(statsPoint)
        }
    }
    return statsPoints
}
