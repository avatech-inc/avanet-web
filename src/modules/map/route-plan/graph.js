
import MG from 'metrics-graphics'

/**

*/
export function elevationGraph(updateLocation, clearLocation, elevationData) {
    /**

    */
    function getGraphStats(elevationData) {
        if (!elevationData) return []

        let totalDistance = 0
        const graphPoints = []

        for (let i = 0; i < elevationData.length; i++) {
            if (!elevationData[i]) continue

            const graphPoint = {
                lat: elevationData[i].lat,
                lng: elevationData[i].lng,
                elevation: elevationData[i].elevation,
                index: elevationData[i].index,
                bearing: elevationData[i].bearing,
                totalDistance: elevationData[i].totalDistance,
                totalTimeEstimateMinutes: elevationData[i].totalTimeEstimateMinutes
            }
            if (i === 0) continue

            // totalDistance += turf.lineDistance(
            //     turf.linestring([
            //         [elevationData[i - 1].lng, elevationData[i - 1].lat],
            //         [elevationData[i].lng, elevationData[i].lat]
            //     ]),
            //     'kilometers'
            // )
            // graphPoint.totalDistance = totalDistance
            graphPoints.push(graphPoint)
        }
        return graphPoints
    }

    if (elevationData) {
        MG.data_graphic({
            data: [
                getGraphStats(elevationData)
            ],
            width: parseInt(
              window.getComputedStyle(
                document.getElementById('elevation-profile')
              ).width.slice(0, -2),
              10
            ),
            height: parseInt(
              window.getComputedStyle(
                document.getElementById('elevation-profile')
              ).height.slice(0, -2),
              10
            ),
            target: '#elevation-profile',
            x_accessor: 'totalDistance',
            y_accessor: 'elevation',
            missing_is_hidden: true,
            transition_on_update: false,
            xax_format: value => `${value} km`,
            yax_format: d3.format(',d'),
            min_y_from_data: true,
            y_extended_ticks: true,
            bottom: 25,
            right: 15,
            top: 20,
            left: 40,
            buffer: 0,
            show_rollover_text: true,
            colors: ['blue', 'blue'],
            x_rollover_format: (d) => {
                const x = 'Distance: ' + d3.format('.3f')(d.totalDistance) + ' km' +
                    '    Elevation: ' + d3.format('.2f')(d.elevation) +
                    '    Bearing: ' + d3.format('.0f')(d.bearing) +
                    '    Time: ' + d3.format('.0f')(d.totalTimeEstimateMinutes) + ' min'
                return x
            },
            y_rollover_format: (d) => { // eslint-disable-line arrow-body-style
                return ''
            },
            mouseover: (d) => {
                updateLocation(d)
            },
            mouseout: (d) => {
                clearLocation(d)
            }
        });
        d3.select(
          document.querySelector('#elevation-profile .mg-line2')
        ).style(
          'stroke-dasharray',
          ('3, 3')
        )
    } else {
        document.getElementById('elevation-profile').innerHTML = ''  // eslint-disable-line max-len
    }
}
