
import MG from 'metrics-graphics'

/**

*/
export function elevationGraph(elevationData) {
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
                elevation: elevationData[i].elev,
                index: i,
                totalDistance: 0
            }
            if (i === 0) continue

            totalDistance += turf.lineDistance(
                turf.linestring([
                    [elevationData[i - 1].lng, elevationData[i - 1].lat],
                    [elevationData[i].lng, elevationData[i].lat]
                ]),
                'kilometers'
            )
            graphPoint.totalDistance = totalDistance
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
            show_rollover_text: false,
            colors: ['blue', 'blue']
            // mouseover: function(d, i) {
            //     d3.select(this).append("text")
            //         .text(d.elevation)
            //         .attr("x", x(d.x))
                // console.log(d)
                // var timeFormat
                //
                // if (d.totalTimeEstimateMinutes < 60) {
                //     timeFormat = d3.time.format("%-M min")
                // } else {
                //     timeFormat = d3.time.format("%-H hr %-M min")
                // }
                //
                // document.getElementById('graphrollover').innerHTML = 'Distance: ' +
                // d3.format('.3f')(d.totalDistance) +
                // ' km Elevation: ' + d3.format(',d')(d.elevation) +
                // ' m Slope: ' + d3.format('d')(d.slope) +
                // '&deg; Aspect: ' + d3.format('d')(d.aspect) +
                // '&deg; Bearing: ' + d3.format('0f')(d.bearing) +
                // '&deg; Time: ' + timeFormat(new Date(2015, 0, 1, 0, d.totalTimeEstimateMinutes))
            // }
        });
        d3.select(document.querySelector('#elevation-profile .mg-line2')).style('stroke-dasharray', ('3, 3'))  // eslint-disable-line max-len
    } else {
        document.getElementById('elevation-profile').innerHTML = ''  // eslint-disable-line max-len
    }
}
