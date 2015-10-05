function DrawScaleCanvas(metersPerPixel, metric) {

    function formatMiles(miles) {
        if (miles < .1 && miles > 0) return miles.toFixed(2);
        else if (miles % 1 != 0) return miles.toFixed(1);
        return miles;
    }

    var milesPerPixel = metersPerPixel * 0.000621371;

    var scaleWidth = 420;
    var marginLeft = 30;
    var marginRight = 180;
    
    var canvas = document.createElement("canvas");
    canvas.width = (scaleWidth + marginLeft + marginRight) * 2;
    canvas.height = 36 * 2;

    var ctx = canvas.getContext('2d');
    ctx.scale(2,2);
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,canvas.width / 2, canvas.height / 2);

    var topY = 20;
    var scaleBarHeight = 6;

    // calculate scale bar sections
    var units, totalUnits, subUnits;
        
    // metric (km and m)
    if (metric) {
        // how many meters can we fit?
        var scaleMeters = scaleWidth * metersPerPixel;

        // km
        if (scaleMeters > 1000 && scaleMeters <= 2000) units = 500; // .5 km
        else if (scaleMeters > 4000000) units = 1000000; // 1000km 
        else if (scaleMeters > 1000000) units = 500000; // 500km
        else if (scaleMeters > 400000) units = 200000; // 200km
        else if (scaleMeters > 200000) units = 100000; // 100km
        else if (scaleMeters > 160000) units = 50000; // 40km
        else if (scaleMeters > 80000) units = 20000; // 20km
        else if (scaleMeters > 40000) units = 10000; // 10km
        else if (scaleMeters > 20000) units = 5000; // 5km
        else if (scaleMeters > 10000) units = 2000; // 2km
        else if (scaleMeters > 1000) units = 1000; // 1 km
        // meters
        else if (scaleMeters > 200) units = 100; // 100 m
        else units = 50; // 50m

        totalUnits = Math.floor(scaleMeters / units);
    }
    // imperial (miles)
    else {
        // how many miles can we fit?
        var scaleMiles = scaleWidth * milesPerPixel;

        if (scaleMiles <= .2) units = .05;
        else if (scaleMiles <= .5)      { units = .1;   subUnits = 5 }
        else if (scaleMiles <= 1)       { units = .2;   subUnits = 5 }
        else if (scaleMiles < 3)        { units = .5;   subUnits = 5 }
        else if (scaleMiles <= 7)       { units = 1;    subUnits = 5 }
        else if (scaleMiles <= 10)      { units = 2;    subUnits = 5 }
        else if (scaleMiles <= 20)      { units = 5;    subUnits = 5 }
        else if (scaleMiles <= 50)      { units = 10;   subUnits = 5 }
        else if (scaleMiles <= 100)     { units = 20;   subUnits = 5 }
        else if (scaleMiles <= 250)     { units = 50;   subUnits = 5 }
        else if (scaleMiles <= 400)     { units = 100;  subUnits = 5 }
        else if (scaleMiles <= 1000)    { units = 200;  subUnits = 5 }
        else if (scaleMiles <= 3000)    { units = 500;  subUnits = 5 }
        else                            { units = 1000; subUnits = 5 }

        totalUnits = Math.floor(scaleMiles / units);
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";

    // draw extension label
    ctx.fillStyle = "black";
    ctx.font = "10px Arial";
    var labelText;
    if (metric) labelText = units >= 500 ? units / 1000 : units;
    else labelText = formatMiles(units);
    ctx.fillText(labelText, marginLeft - (ctx.measureText(labelText).width / 2), topY - 4);

    //var totalUnits = max / units;
    for (var i = 0; i <= totalUnits; i++) {

        var left_x, right_x;
        if (metric) {
            var pixelsPerKm = units / metersPerPixel;
            var left_x = pixelsPerKm * (i - 0);
            var right_x = pixelsPerKm * (i + 1);
        }
        else {
            var pixelsPerMile = units / milesPerPixel;
            var left_x = pixelsPerMile * (i - 0);
            var right_x = pixelsPerMile * (i + 1);
        }

        // draw label
        ctx.fillStyle = "black";
        ctx.font = "10px Arial";

        var labelText, unitsText;
        if (metric) {
            labelText = units >= 500 ? i * (units / 1000) : i * units;
            unitsText = units <= 100 ? "m" : "km"
        }
        else {
            labelText =  formatMiles(i * units);
            unitsText = "mi";
        }
        ctx.fillText(i < totalUnits ? labelText : labelText + " " + unitsText, right_x + marginLeft - (ctx.measureText(labelText).width / 2), topY - 4);

        // draw box
        ctx.beginPath();
        ctx.moveTo(left_x + marginLeft, topY);
        ctx.lineTo(right_x + marginLeft, topY);
        ctx.lineTo(right_x + marginLeft, topY + scaleBarHeight);
        ctx.lineTo(left_x + marginLeft, topY + scaleBarHeight);

        // draw center line
        if (i > 0 && i % 2 == 0) {
            ctx.moveTo(marginLeft + left_x, topY + (scaleBarHeight / 2));
            ctx.lineTo(marginLeft + right_x, topY + (scaleBarHeight / 2));
        }

        // draw extension boxes
        if (i == 0) {
            var boxWidth = right_x / 5;
            for (var b = 0; b < 5; b++) {
                ctx.moveTo(0 + marginLeft + (boxWidth * b), topY);
                ctx.lineTo(0 + marginLeft + (boxWidth * b), topY + scaleBarHeight);
                // draw center line
                if (b % 2 == 0) {
                    ctx.moveTo(marginLeft + 0 + (boxWidth * b), topY + (scaleBarHeight / 2));
                    ctx.lineTo(marginLeft + 0 + (boxWidth * (b + 1)), topY + (scaleBarHeight / 2));
                }
            }
        }
        ctx.stroke();
    }

    document.body.appendChild(canvas);
    if (metric) canvas.setAttribute("style","position: absolute; top:0;left:0;z-index:999999;width:" + (canvas.width / 2) + "px;height:" + (canvas.height / 2) + "px");
    else if (!metric) canvas.setAttribute("style","position: absolute; top:36px;left:0;z-index:999999;width:" + (canvas.width / 2) + "px;height:" + (canvas.height / 2) + "px");
}