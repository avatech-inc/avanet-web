
/**

*/
export function checkCompleteTerrainData(terrainData) {
    let elevationOnly = false
    for (let i = 0; i < terrainData.length; i++) {
        if (
            !terrainData[i].elevation &
            !terrainData[i].aspect &
            !terrainData[i].slope
        ) {
            elevationOnly = true
        }
    }
    return elevationOnly
}

/**

*/
export function getLinestringQuery(routePoints) {
    let linestring = ''
    for (let i = 0; i < routePoints.length; i++) {
        linestring += `${routePoints[i].lat},${routePoints[i].lng} `
    }
    return linestring
}

/**

*/
export function interpolate(_points) {
    const newPoints = []

    for (let i = 0; i < _points.length; i++) {
        newPoints[i * 2] = _points[i]
    }

    for (let i = 0; i < newPoints.length; i++) {
        if (!newPoints[i]) {
            const startPoint = L.latLng(newPoints[i - 1].lat, newPoints[i - 1].lng)
            const endPoint = L.latLng(newPoints[i + 1].lat, newPoints[i + 1].lng)
            const bounds = L.latLngBounds(startPoint, endPoint)
            const middlePoint = bounds.getCenter()

            newPoints[i] = {
                lat: middlePoint.lat,
                lng: middlePoint.lng
            }
        }
    }
    return newPoints
}


/**

*/
export function getElevationProfilePoint(
    points,
    pointIndex
) {
    if (!points) return -1
    for (let i = 0; i < points.length; i++) {
        if (points[i].originalIndex === pointIndex) {
            return points[i]
        }
    }
    return -1
}

/**

*/
export function getSegmentDistance(
    previous,
    current
) {
    return turf.lineDistance(
        turf.linestring([
            [previous.lng, previous.lat],
            [current.lng, current.lat]
        ]),
        'kilometers'
    )
}

/**

*/
export function getBearing(
    start,
    end
) {
    let bearing = turf.bearing(
        turf.point([start.lng, start.lat]),
        turf.point([end.lng, end.lat])
    )
    if (bearing < 0) bearing += 360
    return bearing
}

/**
  MUNTER TIME ESTIMATES

  http://www.foxmountainguides.com/about/the-guides-blog/tags/tag/munter-touring-plan
  https://books.google.com/books?id=Yg3WTwZxLhIC&lpg=PA339&ots=E-lqpwepiA&dq=munter%20time%20calculation&pg=PA112#v=onepage&q=munter%20time%20calculation&f=false

  distance: 1km = 1 unit (since distance is already in km, just use as-is)
  vertical: 100m = 1 unit (vertical is in m, so just divide by 100)
*/
export function calculateMunterEstimate(
    totalTimeEstimate,
    munterRate,
    point,
    previousElev,
    currentElev,
    segmentDistance
) {
    let totalTime = totalTimeEstimate
    if (currentElev.elev === null) {
        point.direction = 'flat'
        point.munterUnits = segmentDistance

        const munterRateFlat = (munterRate.up + munterRate.down) / 2
        point.timeEstimateMinutes = (point.munterUnits / munterRateFlat) * 60
    } else {
        point.elevationDifference = currentElev - previousElev

        if (point.elevationDifference > 0) {
            point.direction = 'up'
            point.verticalUp = point.elevationDifference

            point.munterUnits = segmentDistance + (point.verticalUp / 100)
            point.timeEstimateMinutes = (point.munterUnits / munterRate.up) * 60
        } else if (point.elevationDifference < 0) {
            point.direction = 'down'
            point.verticalDown = Math.abs(point.elevationDifference)

            point.munterUnits = segmentDistance + (point.verticalDown / 100)
            point.timeEstimateMinutes = (point.munterUnits / munterRate.down) * 60
        } else {
            point.direction = 'flat'
            point.munterUnits = segmentDistance

            const munterRateFlat = (munterRate.up + munterRate.down) / 2
            point.timeEstimateMinutes = (point.munterUnits / munterRateFlat) * 60
        }
    }
    totalTime += point.timeEstimateMinutes
    point.totalTimeEstimateMinutes = totalTime
    return point
}

/**

*/
export function getAverage(values) {
    const sum = values.reduce((previous, current) => {
        let c = current
        c += previous
        return c
    });
    return sum / values.length;

    //       ______,
    // _____/      \\_____
    // |  _     ___   _   ||
    // | | \     |   | \  ||
    // | |  |    |   |  | ||
    // | |_/     |   |_/  ||
    // | | \     |   |    ||
    // | |  \    |   |    ||
    // | |   \. _|_. | .  ||
    // |                  ||
    // |  this function   ||
    // |                  ||
    // let sines = []``
    // let cosines = []
    // // get sines and cosines
    // for (let aspect of aspects) {
    //     if (aspect !== null && aspect !== undefined) {
    //         aspect = parseInt(aspect, 10)
    //
    //         // convert aspect degrees to radians
    //         sines.push(Math.sin(aspect * (Math.PI / 180)))
    //         cosines.push(Math.cos(aspect * (Math.PI / 180)))
    //     }
    // }
    // // calculate mean of sines and cosines
    // let meanSine = _.sum(sines) / sines.length
    // let meanCosine = _.sum(cosines) / cosines.length
    // // calculate aspect in radians
    // let averageAspectRadians = Math.atan2(meanSine, meanCosine)
    // // convert to degrees
    // let deg = averageAspectRadians * (180 / Math.PI)
    // // if negative, adjust
    // if (deg < 0) deg = 360 + deg
    //   return deg
}
