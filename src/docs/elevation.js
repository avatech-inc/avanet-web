
/**
 * @external Elevation API
 * @see {@link https://github.com/avatech-inc/elevation}
 * @see {@link http://avatech-inc.github.io/terrain-coverage/}
 * @description <strong>An elevation API microservice written in Go.</strong>
 * <br />
 * <br />
 * Retrieve elevation data for a point or a linestring of coordinates.
 * Point queries return the elevation of of the specific coordinate. Linestring
 * queries return the elevation for ~300 points evenly spaced along the linestring.
 * Elevation data is pulled from a database of DEMs. See terrain coverage here: {@link http://avatech-inc.github.io/terrain-coverage/}
 * 
 * <h4>Base URL</h4>
 * <code>https://elevation.avatech.com/v1/</code>
 * 
 * <h4>Endpoints</h4>
 * <code>GET /point/&lt;latitude&gt;,&lt;longitude&gt;</code>
 * <br />
 *
 * Returns a point object containing <code>'lat'</code>, <code>'lng'</code> and <code>'elev'</code> keys
 * as floats.
 *
 * <br /><br />
 * <code>GET /linestring/&lt;latitude&gt;,&lt;longitude&gt; &lt;latitude&gt;,&lt;longitude&gt;...</code>
 * <br />
 *
 * Returns an array of ~300 point objects containing <code>'lat'</code>, <code>'lng'</code> and <code>'elev'</code> keys
 * as floats evenly spaced along the given linestring. Each coordinate pair is seperated by %20 (space).
 *
 * <br /><br />
 * 
 * @example
 * GET /point/40.02,-105.21
 * {
 *     "lat": 40.02,
 *     "lng": -105.21,
 *     "elev": 1592.03173828125
 * }
 * 
 * @example
 * GET /linestring/40.02,-105.2 40.03,-105.3 40.04,-105.41...
 * [{
 *     "lat": 40.02,
 *     "lng": -105.21,
 *     "elev": 1592.03173828125
 * }, {
 *     "lat": 40.02,
 *     "lng": -105.21,
 *     "elev": 1592.03173828125
 * }, {
 * ...
 * ]
 */
