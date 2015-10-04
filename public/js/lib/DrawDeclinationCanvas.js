// By Andrew Sohn
// (C) 2015 Avatech, Inc.

function DrawDeclinationCanvas(declination, gridNorth) {
    // gridNorth not implemented yet

    var arrow_canvas = document.createElement("canvas");
    arrow_canvas.height = 400;
    arrow_canvas.width = 500;
    var ctx = arrow_canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0,0,arrow_canvas.width,arrow_canvas.height);

    var x = arrow_canvas.width / 2;

    // draw north star
    drawStar(ctx, x, 30, 5, 26, 13);

    // draw true north line
    ctx.lineWidth = 4;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(x, arrow_canvas.height - 5);
    var northLineY = (declination == 0) ? 120 : 62;
    ctx.lineTo(x, northLineY);

    // adjust declination angle for canvas and convert to radians
    var _declination = (declination - 90) * Math.PI/180;

    // length of declination line
    var dec_length = arrow_canvas.height - 140;
    var y = arrow_canvas.height - 5
    var endPointX = x + dec_length * Math.cos(_declination);
    var endPointY = y + dec_length * Math.sin(_declination);
    ctx.moveTo(x, y);
    ctx.lineTo(endPointX, endPointY);
    ctx.stroke();

    // draw arrow at end of line
    var endPointX2 = x + (dec_length + 20) * Math.cos(_declination);
    var endPointY2 = y + (dec_length + 20) * Math.sin(_declination);
    var endRadians = Math.atan((endPointY2-y)/(endPointX2-x))
        + ((endPointX2>x)?90:-90)*Math.PI/180;
    drawArrow(ctx, endPointX2, endPointY2, endRadians);

    // draw 'MN' label at end of line{
    ctx.fillStyle = "black";
    ctx.font = "37px Arial"
    var endPointX3 = x + (dec_length + 38) * Math.cos(_declination);
    var endPointY3 = y + (dec_length + 38) * Math.sin(_declination);
    ctx.save();
    ctx.translate(endPointX3,endPointY3);
    ctx.rotate(endRadians);
    var mn_x = -30;
    if (declination > 0 && declination < 5) mn_x = -3;
    else if (declination < 0 && declination > -5) mn_x = -(ctx.measureText("MN").width - 3);
    ctx.fillText("MN", mn_x, 0);
    ctx.restore();

    // draw angle label
    ctx.font = "48px Arial";
    var declinationText = Math.abs(declination).toFixed(1);
    if (declinationText.indexOf(".0") > -1) declinationText = declinationText.substring(0,declinationText.indexOf("."));
    declinationText += "°";
    var midPointX = x + (dec_length / 2) * Math.cos(_declination);
    var midPointY = y + (dec_length / 2) * Math.sin(_declination);
    ctx.fillText(declinationText, midPointX + (declination >= 0 ? 25 : -25 - ctx.measureText(declinationText).width), midPointY);


    function drawArrow(ctx, x, y, radians) {
        ctx.fillStyle = "black";
        ctx.save();
        ctx.beginPath();
        ctx.translate(x,y);
        ctx.rotate(radians);
        if (radians < 0) {
            ctx.moveTo(2,0);
            ctx.lineTo(2,50);
            ctx.lineTo(-18,60);
        }
        else if (radians > 0) {
            ctx.moveTo(-2,0);
            ctx.lineTo(18,60);
            ctx.lineTo(-2,50);
        }
        else {
            ctx.moveTo(0,0);
            ctx.lineTo(18,60);
            ctx.lineTo(0,50);
            ctx.lineTo(-18,60);
        }
        ctx.closePath();
        ctx.restore();
        ctx.fill();
    }

    function drawStar(ctx, cx,cy,spikes,outerRadius,innerRadius){
      var rot=Math.PI/2*3;
      var x=cx;
      var y=cy;
      var step=Math.PI/spikes;

      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.moveTo(cx,cy-outerRadius)
      for(i=0;i<spikes;i++){
        x=cx+Math.cos(rot)*outerRadius;
        y=cy+Math.sin(rot)*outerRadius;
        ctx.lineTo(x,y)
        rot+=step

        x=cx+Math.cos(rot)*innerRadius;
        y=cy+Math.sin(rot)*innerRadius;
        ctx.lineTo(x,y)
        rot+=step
      }
      ctx.lineTo(cx,cy-outerRadius)
      ctx.fill();
      ctx.closePath();
    }

    return arrow_canvas;
}