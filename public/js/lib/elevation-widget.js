window.ElevationWidget = function() {
    // options: {
    //     position: "topright",
    //     theme: "lime-theme",
    //     width: 600,
    //     height: 175,
    //     margins: {
    //         top: 20,
    //         right: 20,
    //         bottom: 30,
    //         left: 60
    //     },
    //     useHeightIndicator: true,
    //     interpolation: "linear",
    //     hoverNumber: {
    //         decimalsX: 3,
    //         decimalsY: 0,
    //         formatter: undefined
    //     },
    //     xTicks: undefined,
    //     yTicks: undefined,
    //     collapsed: false,
    //     yAxisMin: undefined,
    //     yAxisMax: undefined,
    //     forceAxisBounds: false,
    //     imperial: false
    // }

    var _color = "#428bca"; //"#2080cc" // #6664bd;

    this.onRemove = function(map) {
        this._container = null;
    }

    //onAdd: function(map) {
    this.create = function(map, options) {
        this._map = map;

        this.options = options;
        if (!options) this.options = {
            position: "topright",
            theme: "lime-theme",
            width: 600,
            height: 150,
            margins: {
                top: 20,
                right: 20,
                bottom: 30,
                left: 60
            },
            useHeightIndicator: true,
            interpolation: "linear",
            hoverNumber: {
                decimalsX: 3,
                decimalsY: 0,
                formatter: undefined
            },
            xTicks: undefined,
            yTicks: undefined,
            collapsed: false,
            yAxisMin: undefined,
            yAxisMax: undefined,
            forceAxisBounds: false,
            imperial: false
        };
        opts = this.options;

        var margin = opts.margins;
        opts.xTicks = opts.xTicks || Math.round(this._width() / 70);
        opts.yTicks = opts.yTicks || Math.round(this._height() / 22);
        opts.hoverNumber.formatter = opts.hoverNumber.formatter || this._formatter;

        var x = this._x = d3.scale.linear().range([0, this._width()]);
        var y = this._y = d3.scale.linear().range([this._height(), 0]);

        var container = this._container = L.DomUtil.create("div", "elevation");

        this._initToggle();

        var cont = d3.select(container);
        cont.attr("width", this._widthOuter());
        var svg = cont.append("svg");
        svg.attr("width", this._widthOuter())
            .attr("class", "background")
            .attr("height", opts.height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var line = d3.svg.line();
        line = line
            .x(function(d) {
                return d3.mouse(svg.select("g"))[0];
            })
            .y(function(d) {
                return this._height();
            });

        var g = d3.select(this._container).select("svg").select("g");

        this._profileStroke = g.append("path")
            .attr("style", "fill:" + _color + ";opacity:.4; pointer-events:none;");

        this._profileFill = g.append("path")
            .attr("style", "fill:none;stroke:" + _color + ";stroke-width:2px; pointer-events:none;");

        var background = this._background = g.append("rect")
            .attr("width", this._width())
            .attr("height", this._height())
            .style("fill", "none")
            .style("pointer-events", "all");

        // if (L.Browser.touch) {
        //     background.on("touchmove.drag", this._dragHandler.bind(this)).
        //     on("touchstart.drag", this._dragStartHandler.bind(this)).
        //     on("touchstart.focus", this._mousemoveHandler.bind(this));
        //     L.DomEvent.on(this._container, 'touchend', this._dragEndHandler, this);
        //} 
        //else {
            background.on("mousemove.focus", this._mousemoveHandler.bind(this)).
            on("mouseout.focus", this._mouseoutHandler.bind(this)).
            on("mousedown.drag", this._dragStartHandler.bind(this)).
            on("mousemove.drag", this._dragHandler.bind(this));
            L.DomEvent.on(this._container, 'mouseup', this._dragEndHandler, this);

        //}

        this._xaxisgraphicnode = g.append("g");
        this._yaxisgraphicnode = g.append("g");
        this._appendXaxis(this._xaxisgraphicnode);
        this._appendYaxis(this._yaxisgraphicnode);

        var focusG = this._focusG = g.append("g");
        this._mousefocus = focusG.append('svg:line')
            .attr('class', 'mouse-focus-line')
            .attr('x2', '0')
            .attr('y2', '0')
            .attr('x1', '0')
            .attr('y1', '0');
        this._focuslabelX = focusG.append("svg:text")
            .style("pointer-events", "none")
            .attr("class", "mouse-focus-label-x");
        this._focuslabelX2= focusG.append("svg:text")
            .style("pointer-events", "none")
            .attr("class", "mouse-focus-label-x");
        this._focuslabelX3= focusG.append("svg:text")
            .style("pointer-events", "none")
            .attr("class", "mouse-focus-label-x");
        this._focuslabelX4= focusG.append("svg:text")
            .style("pointer-events", "none")
            .attr("class", "mouse-focus-label-x");
        this._focuslabelX5= focusG.append("svg:text")
            .style("pointer-events", "none")
            .attr("class", "mouse-focus-label-x");

        this._focuslabelY = focusG.append("svg:text")
            .style("pointer-events", "none")
            .attr("class", "mouse-focus-label-y");

        if (this._data) {
            this._applyData();
        }

        $(".bottom-pane .elevation").remove();
        $(".bottom-pane").append($(container));
        $(container).addClass("elevation-widget");
        //return container;
        //return null;
    }

    this._dragHandler = function() {

        // disable drag-select
        return;

        //we don't want map events to occur here
        d3.event.preventDefault();
        d3.event.stopPropagation();

        this._gotDragged = true;

        this._drawDragRectangle();

    }

    /*
     * Draws the currently dragged rectabgle over the chart.
     */
    this._drawDragRectangle = function() {

        if (!this._dragStartCoords) {
            return;
        }

        var dragEndCoords = this._dragCurrentCoords = d3.mouse(this._background.node());

        var x1 = Math.min(this._dragStartCoords[0], dragEndCoords[0]),
            x2 = Math.max(this._dragStartCoords[0], dragEndCoords[0]);

        if (!this._dragRectangle && !this._dragRectangleG) {
            var g = d3.select(this._container).select("svg").select("g");

            this._dragRectangleG = g.append("g");

            this._dragRectangle = this._dragRectangleG.append("rect")
                .attr("width", x2 - x1)
                .attr("height", this._height())
                .attr("x", x1)
                .attr('class', 'mouse-drag')
                .style("pointer-events", "none");
        } else {
            this._dragRectangle.attr("width", x2 - x1)
                .attr("x", x1);
        }

    }

    /*
     * Removes the drag rectangle and zoms back to the total extent of the data.
     */
    this._resetDrag = function() {

        if (this._dragRectangleG) {

            this._dragRectangleG.remove();
            this._dragRectangleG = null;
            this._dragRectangle = null;

            this._hidePositionMarker();

            this._map.fitBounds(this._fullExtent);

        }

    }

    /*
     * Handles end of dragg operations. Zooms the map to the selected items extent.
     */
    this._dragEndHandler = function() {

        if (!this._dragStartCoords || !this._gotDragged) {
            this._dragStartCoords = null;
            this._gotDragged = false;
            this._resetDrag();
            return;
        }

        this._hidePositionMarker();

        var item1 = this._findItemForX(this._dragStartCoords[0]),
            item2 = this._findItemForX(this._dragCurrentCoords[0]);

        this._fitSection(item1, item2);

        this._dragStartCoords = null;
        this._gotDragged = false;

    }

    this._dragStartHandler = function() {

        d3.event.preventDefault();
        d3.event.stopPropagation();

        this._gotDragged = false;

        this._dragStartCoords = d3.mouse(this._background.node());

    }

    /*
     * Finds a data entry for a given x-coordinate of the diagram
     */
    this._findItemForX = function(x) {
        var bisect = d3.bisector(function(d) {
            return d.dist;
        }).left;
        var xinvert = this._x.invert(x);
        return bisect(this._data, xinvert);
    }

    /*
     * Finds an item with the smallest delta in distance to the given latlng coords
     */
    this._findItemForLatLng = function(latlng) {
        var result = null,
            d = Infinity;
        this._data.forEach(function(item) {
            var dist = latlng.distanceTo(item.latlng);
            if (dist < d) {
                d = dist;
                result = item;
            }
        });
        return result;
    }

    /** Make the map fit the route section between given indexes. */
    this._fitSection = function(index1, index2) {

        var start = Math.min(index1, index2),
            end = Math.max(index1, index2);

        var ext = this._calculateFullExtent(this._data.slice(start, end));

        this._map.fitBounds(ext);

    }

    this._initToggle = function() {

        /* inspired by L.Control.Layers */

        var container = this._container;

        //Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
        container.setAttribute('aria-haspopup', true);

        if (!L.Browser.touch) {
            L.DomEvent
                .disableClickPropagation(container);
            //.disableScrollPropagation(container);
        } else {
            L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
        }

        if (this.options.collapsed) {
            this._collapse();

            if (!L.Browser.android) {
                L.DomEvent
                    .on(container, 'mouseover', this._expand, this)
                    .on(container, 'mouseout', this._collapse, this);
            }
            var link = this._button = L.DomUtil.create('a', 'elevation-toggle', container);
            link.href = '#';
            link.title = 'Elevation';

            if (L.Browser.touch) {
                L.DomEvent
                    .on(link, 'click', L.DomEvent.stop)
                    .on(link, 'click', this._expand, this);
            } else {
                L.DomEvent.on(link, 'focus', this._expand, this);
            }

            this._map.on('click', this._collapse, this);
            // TODO keyboard accessibility
        }
    }

    this._expand = function() {
        this._container.className = this._container.className.replace(' elevation-collapsed', '');
    }

    this._collapse = function() {
        L.DomUtil.addClass(this._container, 'elevation-collapsed');
    }

    this._widthOuter = function() {
        return $(".bottom-pane").width();
    }
    this._width = function() {
        return ($(".bottom-pane").width() - opts.margins.left - opts.margins.right);
    }

    this._height = function() {
        var opts = this.options;
        return opts.height - opts.margins.top - opts.margins.bottom;
    }

    /*
     * Fromatting funciton using the given decimals and seperator
     */
    this._formatter = function(num, dec, sep) {
        var res;
        if (dec === 0) {
            res = Math.round(num) + "";
        } else {
            res = L.Util.formatNum(num, dec) + "";
        }
        var numbers = res.split(".");
        if (numbers[1]) {
            var d = dec - numbers[1].length;
            for (; d > 0; d--) {
                numbers[1] += "0";
            }
            res = numbers.join(sep || ".");
        }
        return res;
    }

    this._appendYaxis = function(y) {
        y.attr("class", "y axis")
        .call(d3.svg.axis()
            .tickFormat(d3.format(",.0f"))
            .scale(this._y)
            .innerTickSize(-this._width())
            .outerTickSize(0)
            .ticks(4)
            //.ticks(this.options.yTicks)
            .orient("left"))

        d3.selectAll('.y.axis g.tick')
          .select('line')
          .style('stroke', 'rgba(0,0,0,.1)')
          .style('shape-rendering', 'crispEdges')
          .style('pointer-events', 'none')
    }

    this._appendXaxis = function(x) {
        var opts = this.options;
        x.attr("class", "x axis")
        .attr("transform", "translate(0," + this._height() + ")")
        .call(d3.svg.axis()
            .tickFormat(function(num){
                if (opts.imperial) return num + " mi";
                else return num + " km";
            })
            .scale(this._x)
            .ticks(this.options.xTicks)
            .orient("bottom"))
    }

    this._updateAxis = function() {
        this._xaxisgraphicnode.selectAll("g").remove();
        this._xaxisgraphicnode.selectAll("path").remove();
        this._xaxisgraphicnode.selectAll("text").remove();
        this._yaxisgraphicnode.selectAll("g").remove();
        this._yaxisgraphicnode.selectAll("path").remove();
        this._yaxisgraphicnode.selectAll("text").remove();
        this._appendXaxis(this._xaxisgraphicnode);
        this._appendYaxis(this._yaxisgraphicnode);
    }

    this._mouseoutHandler = function() {
        this._hidePositionMarker();
    }

    /*
     * Hides the position-/heigth indication marker drawn onto the map
     */
    this._hidePositionMarker = function() {

        if (this._marker) {
            this._map.removeLayer(this._marker);
            this._marker = null;
        }
        if (this._mouseHeightFocus) {
            this._mouseHeightFocus.style("visibility", "hidden");
            this._mouseHeightFocusLabel.style("visibility", "hidden");
        }
        if (this._pointG) {
            this._pointG.style("visibility", "hidden");
        }
        this._focusG.style("visibility", "hidden");

    }

    /*
     * Handles the moueseover the chart and displays distance and elevation level
     */
    this._mousemoveHandler = function(d, i, ctx) {
        if (!this._data || this._data.length === 0) {
            return;
        }
        var coords = d3.mouse(this._background.node());
        var opts = this.options;

        var item = this._data[this._findItemForX(coords[0])],
            alt = item.elevation,
            dist = item.dist,
            ll = item.latlng,
            numY = opts.hoverNumber.formatter(alt, opts.hoverNumber.decimalsY),
            numX = opts.hoverNumber.formatter(dist, opts.hoverNumber.decimalsX);

        this._showDiagramIndicator(item, coords[0]);

        var layerpoint = this._map.latLngToLayerPoint(ll);

        //if we use a height indicator we create one with SVG
        //otherwise we show a marker
        if (opts.useHeightIndicator) {

            if (!this._mouseHeightFocus) {

                var heightG = d3.select(".leaflet-overlay-pane svg")
                    .append("g");
                this._mouseHeightFocus = heightG.append('svg:line')
                    .attr('class', 'height-focus line')
                    .attr('style', 'display:none;')
                    .attr('x2', '0')
                    .attr('y2', '0')
                    .attr('x1', '0')
                    .attr('y1', '0');

                var pointG = this._pointG = heightG.append("g");
                pointG.append("svg:circle")
                    .attr("r", 8) // 6
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("style", "fill:" + _color + ";z-index:10000;pointer-events:none;")
                    .attr("class", "height-focus circle-lower");

                this._mouseHeightFocusLabel = heightG.append("svg:text")
                    .attr("class", "height-focus-label")
                    .style("pointer-events", "none")
                    .attr('style', 'display:none;');

            }

            var normalizedAlt = this._height() / this._maxElevation * alt;
            var normalizedY = layerpoint.y - normalizedAlt;
            this._mouseHeightFocus.attr("x1", layerpoint.x)
                .attr("x2", layerpoint.x)
                .attr("y1", layerpoint.y)
                .attr("y2", normalizedY)
                .style("visibility", "visible");

            this._pointG.attr("transform", "translate(" + Math.round(layerpoint.x) + "," + Math.round(layerpoint.y) + ")")
                .style("visibility", "visible")
                //.style("pointer-events", "none");

            if(opts.imperial) {
                this._mouseHeightFocusLabel.attr("x", layerpoint.x)
                    .attr("y", normalizedY)
                    .text(numY + " ft (miles will go here)")
                    .style("visibility", "visible");
            }
            else {
                this._mouseHeightFocusLabel.attr("x", layerpoint.x)
                    .attr("y", normalizedY)
                    .text(numY + " m")
                    .style("visibility", "visible");
            }

        } else {

            if (!this._marker) {

                this._marker = new L.Marker(ll).addTo(this._map);

            } else {

                this._marker.setLatLng(ll);

            }

        }

    }

    /*
     * Parsing of GeoJSON data lines and their elevation in z-coordinate
     */
    this._addGeoJSONData = function(coords) {
        var opts = this.options;
        if (coords) {
            var data = this._data || [];
            var dist = this._dist || 0;
            var ele = this._maxElevation || 0;
            for (var i = 0; i < coords.length; i++) {
                var s = new L.LatLng(coords[i][1], coords[i][0]);
                var e = new L.LatLng(coords[i ? i - 1 : 0][1], coords[i ? i - 1 : 0][0]);
                var newdist = opts.imperial ? s.distanceTo(e) * 0.621371 : s.distanceTo(e);
                dist = dist + Math.round(newdist / 1000 * 100000) / 100000;
                ele = ele < coords[i][2] ? coords[i][2] : ele;
                data.push({
                    dist: dist,
                    elevation: opts.imperial ? coords[i][2] * 3.28084 : coords[i][2],
                    slope: coords[i][3],
                    aspect: coords[i][4],
                    timeEstimateMinutes: coords[i][5],
                    new_dist: coords[i][6],
                    bearing: coords[i][7],

                    x: coords[i][0],
                    y: coords[i][1],
                    latlng: s
                });
            }
            this._dist = dist;
            this._data = data;

            // this._startPoint = new L.LatLng(coords[0][1], coords[0][0]);
            // this._endPoint = new L.LatLng(coords[coords.length-1][1], coords[coords.length-1][0]);

            ele = opts.imperial ? ele * 3.28084 : ele;
            this._maxElevation = ele;
        }
    }

    /*
     * Parsing function for GPX data as used by https://github.com/mpetazzoni/leaflet-gpx
     */
    // _addGPXdata: function(coords) {
    //     var opts = this.options;
    //     if (coords) {
    //         var data = this._data || [];
    //         var dist = this._dist || 0;
    //         var ele = this._maxElevation || 0;
    //         for (var i = 0; i < coords.length; i++) {
    //             var s = coords[i];
    //             var e = coords[i ? i - 1 : 0];
    //             var newdist = opts.imperial ? s.distanceTo(e) * 0.621371 : s.distanceTo(e);
    //             dist = dist + Math.round(newdist / 1000 * 100000) / 100000;
    //             ele = ele < s.meta.ele ? s.meta.ele : ele;
    //             data.push({
    //                 dist: dist,
    //                 altitude: opts.imperial ? s.meta.ele * 3.28084 : s.meta.ele,
    //                 x: s.lng,
    //                 y: s.lat,
    //                 latlng: s
    //             });
    //         }
    //         this._dist = dist;
    //         this._data = data;

    //         ele = opts.imperial ? ele * 3.28084 : ele;
    //         this._maxElevation = ele;
    //     }
    // },

    this._addData = function(d) {
        var geom = d && d.geometry && d.geometry;
        var i;

        if (geom) {
            switch (geom.type) {
                case 'LineString':
                    this._addGeoJSONData(geom.coordinates);
                    break;

                case 'MultiLineString':
                    for (i = 0; i < geom.coordinates.length; i++) {
                        this._addGeoJSONData(geom.coordinates[i]);
                    }
                    break;

                default:
                    throw new Error('Invalid GeoJSON object.');
            }
        }

        var feat = d && d.type === "FeatureCollection";
        if (feat) {
            for (i = 0; i < d.features.length; i++) {
                this._addData(d.features[i]);
            }
        }

        if (d && d._latlngs) {
            this._addGPXdata(d._latlngs);
        }
    }

    /*
     * Calculates the full extent of the data array
     */
    this._calculateFullExtent = function(data) {

        if (!data || data.length < 1) {
            throw new Error("no data in parameters");
        }

        var ext = new L.latLngBounds(data[0].latlng, data[0].latlng);

        data.forEach(function(item) {
            ext.extend(item.latlng);
        });

        return ext;

    }

    /*
     * Add data to the diagram either from GPX or GeoJSON and
     * update the axis domain and data
     */
    this.addData = function(d, layer) {
        this._addData(d);
        if (this._container) {
            this._applyData();
        }
        if (layer === null && d.on) {
            layer = d;
        }
        if (layer) {
            layer.on("mousemove", this._handleLayerMouseOver.bind(this));
        }
    }

    /*
     * Handles mouseover events of the data layers on the map.
     */
    this._handleLayerMouseOver = function(evt) {
        if (!this._data || this._data.length === 0) {
            return;
        }
        var latlng = evt.latlng;
        var item = this._findItemForLatLng(latlng);
        if (item) {
            var x = item.xDiagCoord;
            this._showDiagramIndicator(item, x);
        }
    }

    this._showDiagramIndicator = function(item, xCoordinate) {
        var opts = this.options;
        this._focusG.style("visibility", "visible");
        this._mousefocus.attr('x1', xCoordinate)
            .attr('y1', 0)
            .attr('x2', xCoordinate)
            .attr('y2', this._height())
            .attr("style","stroke:" + _color + "; pointer-events:none;")
            .classed('hidden', false);

        var alt = item.elevation,
            //dist = item.dist,
            dist = item.new_dist,
            ll = item.latlng,
            numY = opts.hoverNumber.formatter(alt, opts.hoverNumber.decimalsY),
            numX = opts.hoverNumber.formatter(dist, opts.hoverNumber.decimalsX);

        //// interpolate distance
        // var percentage = (xCoordinate / this._width()) * 100;
        // var startPoint =  new google.maps.LatLng(this._startPoint.lat, this._startPoint.lng); 
        // var endPoint = new google.maps.LatLng(this._endPoint.lat, this._endPoint.lng); 
        // var thisPoint = google.maps.geometry.spherical.interpolate(startPoint, endPoint, percentage);
        // thisPoint = new L.LatLng(thisPoint.G, thisPoint.K);
        // var newDist = this._startPoint.distanceTo(thisPoint);
        // // convert to km
        // newDist /= 100000;
        // // convert to miles if imperial
        // if (opts.imperial) newDist = newDist * 0.621371;
        // // format
        // newDist = opts.hoverNumber.formatter(newDist, opts.hoverNumber.decimalsX);

        if (opts.imperial) {
            
            // this._focuslabelX.attr("x", xCoordinate)
            //     .text(numY + " ft");
            // this._focuslabelY.attr("y", this._height() - 5)
            //     .attr("x", xCoordinate)
            //     .text(numX + " mi");

            this._focuslabelY.attr("x", 0).attr("y", -5)
                .text("DISTANCE: " + numX + " mi");

            this._focuslabelX.attr("x", 115).attr("y", -5)
                .text("ELEVATION: " + numY + " ft");
        }
        else {
            // this._focuslabelX.attr("x", xCoordinate + 2)
            //     .text(numY + " m");

            // this._focuslabelY.attr("y", this._height() - 5)
            //     .attr("x", xCoordinate)
            //     .text(numX + " km");

            this._focuslabelY.attr("x", 0).attr("y", -5)
                .text("DISTANCE: " + numX + " km"); 
                //.text("DISTANCE: " + numX + "," + newDist); 

            this._focuslabelX.attr("x", 115).attr("y", -5)
                .text("ELEVATION: " + numY + " m");

        }

        this._focuslabelX2.attr("x", 225).attr("y",-5)
            .text("SLOPE: " + item.slope + "°");

        this._focuslabelX3.attr("x", 290).attr("y", -5)
            .text("ASPECT: " + item.aspect);

        this._focuslabelX4.attr("x", 390).attr("y", -5)
            .text("BEARING: " + item.bearing);

        this._focuslabelX5.attr("x", 500).attr("y", -5)
            .text("TIME: " + this.formatTime(item.timeEstimateMinutes));
    }


    this.formatTime = function(minutes) {
        var str = "";
        if (minutes >= 60) {
            var hours = minutes / 60;
            var mins = Math.floor(minutes % 60);
            str = Math.floor(hours) + " hr";
            if (mins > 0) str += " " + mins + " min";
        }
        else str = Math.floor(minutes) + " min";
        return str;
    }

    this._applyData = function() {
        var xdomain = d3.extent(this._data, function(d) {
            return d.dist;
        });
        var ydomain = d3.extent(this._data, function(d) {
            return d.elevation;
        });
        var opts = this.options;

        // add padding to bottom of the elevation profile
        var padding = (ydomain[1] - ydomain[0]) / this._height();
        ydomain[0] -= (padding * 7.5);

        if (opts.yAxisMin !== undefined && (opts.yAxisMin < ydomain[0] || opts.forceAxisBounds)) {
            ydomain[0] = opts.yAxisMin;
        }
        if (opts.yAxisMax !== undefined && (opts.yAxisMax > ydomain[1] || opts.forceAxisBounds)) {
            ydomain[1] = opts.yAxisMax;
        }
        this._x.domain(xdomain);
        this._y.domain(ydomain);

        var self = this;

        var newLine = d3.svg.line()
            .interpolate("basis")
            .x(function(d) { return self._x(d.x); })
            .y(function(d) { return self._y(d.y); });

        var newArea = d3.svg.area()
            .interpolate("basis")
            .x(function(d) { return self._x(d.x); })
            .y0(this._height())
            .y1(function(d) { return self._y(d.y); });

        var newPoints = [];
        for (var i = 0; i < this._data.length; i++) {
            // keep track of xDiagCoord for map path hover
            this._data[i].xDiagCoord = this._x(this._data[i].dist);
            // add points to temp array
            newPoints.push({ x: this._data[i].dist, y: this._data[i].elevation })
        }
        var _newPoints = simplify(newPoints, .01, false);
        this._profileFill.datum(_newPoints).attr("d", newLine);
        this._profileStroke.datum(_newPoints).attr("d", newArea);

        this._updateAxis();

        this._fullExtent = this._calculateFullExtent(this._data);
    }

    /*
     * Reset data
     */
    this._clearData = function() {
        this._data = null;
        this._dist = null;
        this._maxElevation = null;
    }

    /*
     * Reset data and display
     */
    this.clear = function() {

        $(".bottom-pane .elevation").remove();
        this._clearData();
        this.clearWaypoints();

        if (!this._profileStroke) {
            return;
        }

        // workaround for 'Error: Problem parsing d=""' in Webkit when empty data
        // https://groups.google.com/d/msg/d3-js/7rFxpXKXFhI/HzIO_NPeDuMJ
        this._profileStroke.attr("d", "M0 0");
        this._profileFill.attr("d", "M0 0");

        this._x.domain([0, 1]);
        this._y.domain([0, 1]);
        this._updateAxis();
    }

    this.highlight = function(latlng) {
         if (!this._data || this._data.length === 0) {
            return;
        }
        // clear
        if (latlng == null) {
            return this._focusG.style("visibility", "hidden");
        }
        var item = this._findItemForLatLng(latlng);
        if (item) this._showDiagramIndicator(item, item.xDiagCoord);
    }

    this.clearWaypoints = function() {
        if (this.waypoints) this.waypoints.remove();
    }

    this.addWaypoint = function(latlng) {
        // add waypoints object if doens't already exist
        var g = d3.select(this._container).select("svg").select("g");
        if (!this.waypoints) this.waypoints = g.append("g");
        //  if (!this._data || this._data.length === 0) {
        //     return;
        // }
        // // clear
        // if (latlng == null) {
        //     return this._focusG.style("visibility", "hidden");
        // }
        // for (var i = 0; i < latlngs.length; i++) {
        //     var latlng = latlngs[i];

            var item = this._findItemForLatLng(latlng);
            if (item) {
                //this._showDiagramIndicator(item, item.xDiagCoord);
                //var opts = this.options;

                //waypoint.style("visibility", "visible");

                this.waypoints.append('svg:line')
                    .attr('x2', item.xDiagCoord)
                    .attr('y2', this._y(item.elevation))
                    .attr('x1', item.xDiagCoord)
                    .attr('y1', this._height())
                    .attr("style", "stroke: " + _color + ";stroke-width:1;pointer-events: none;")
                    .classed('hidden', false);

                this.waypoints.append('svg:circle')
                    .attr('cx', item.xDiagCoord)
                    .attr('cy', this._y(item.elevation) + 2)
                    .attr('r','3')
                    .attr("class", "elevation-profile-waypoint")
                    .attr("style", "fill: " + "yellow" + ";stroke:" + _color + ";stroke-width:1;pointer-events: none;")
                    .classed('hidden', false);

                        // pointG.append("svg:circle")
                        // .attr("r", 6) // 6
                        // .attr("cx", 0)
                        // .attr("cy", 0)

                // var alt = item.altitude,
                //     dist = item.dist,
                //     ll = item.latlng,
                //     numY = opts.hoverNumber.formatter(alt, opts.hoverNumber.decimalsY),
                //     numX = opts.hoverNumber.formatter(dist, opts.hoverNumber.decimalsX);
            //}
        }
    }

};