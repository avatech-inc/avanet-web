

angular.module('avatech').factory('snowpitExport', ['$q','snowpitConstants','$compile','$rootScope','Global', function ($q, snowpitConstants,$compile,$rootScope, Global) { 


var getGrainType = function(layer, isSecondary) {
    var icssg = "";
    if (!layer || !layer["grainType" + isSecondary]) return "";
    for (var i = 0; i < snowpitConstants.grainTypes.length;i++){
        if (snowpitConstants.grainTypes[i].legacyCode == layer["grainType" + isSecondary].category) {
            for (var j = 0; j < snowpitConstants.grainTypes[i].types.length; j++) {
                if (snowpitConstants.grainTypes[i].types[j].code == layer["grainType" + isSecondary].code) {
                    icssg = snowpitConstants.grainTypes[i].types[j].icssg;
                }
            }
            break;
        }
    }
    return icssg;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}

var formatters = {

    format: function(str) {
        if (!str || str == "") return "--";
        return str;
    },
    formatOrg: function(org) {
        if (!org || org == "" || !org.name) return "--";
        return org.name;
    },
    formatCmOrIn: function(str) {
        if (!str || isNaN(str)) return "--";

        var val;
        if (Global.user.settings.elevation == 1) 
            return numberWithCommas(Math.round(parseFloat(str) * 0.393701)) + " in";
        else return numberWithCommas(Math.round(parseFloat(str))) + " cm";

        return "--";
    },
    formatDistance: function(str) {
        return this.formatElevation(str);
    },
    formatKmOrMiles: function(str) {
        if (!str || isNaN(str)) return "--";

        var km = parseFloat(str);
        if (Global.user.settings.elevation == 1) 
            return (km * 0.621371).toFixed(3) + " mi"; 
        else return km.toFixed(3) + " km";
    },
    formatMetersOrFeet: function(str) {
        return this.formatElevation(str);
    },
    formatElevation: function(str) {
        if (!str || isNaN(str)) return "--";

        var val;
        if (Global.user.settings.elevation == 1) 
            return numberWithCommas(Math.round(parseFloat(str) * 3.28084)) + " ft";
        else return numberWithCommas(Math.round(parseFloat(str))) + " m";

        return "--";
    },
    formatCm: function(str) {
        if (!str) return "--";
        return str + " cm";
    },
    formatTemp: function(str) {
        var temp = parseFloat(str);
        if (isNaN(temp)) return "--";

        if (Global.user.settings.tempUnits == 0)
            return temp.toFixed(1) + "°C";
        else {
            var newTemp = (temp*1.8+32).toFixed(1);
            return (Math.round(newTemp * 1) / 1).toFixed(0) + "°F";
        }
    },
    formatSlope: function(str) {
        if (!str) return "--";
        return str + "°";
    },
    formatDirection: function(str) {
        if (str == null) return "--";

        var direction = parseFloat(str);
        if (isNaN(direction)) return "--";

        if ((direction > 354.38 && direction <= 360) || (direction >= 0 && direction < 5.62)) str='N';
        else if (direction >5.63 && direction < 16.87) str='NbE';
        else if (direction >16.88 && direction < 28.12) str='NNE';
        else if (direction >28.13 && direction < 39.37) str='NEbN';
        else if (direction >39.38 && direction < 50.62) str='NE';
        else if (direction >50.63 && direction < 61.87) str='NEbE';
        else if (direction >61.88 && direction < 73.12) str='ENE';
        else if (direction >73.13 && direction < 84.37) str='EbN';
        else if (direction >84.38 && direction < 95.62) str='E';
        else if (direction >95.63 && direction < 106.87) str='EbS';
        else if (direction >106.88 && direction < 118.12) str='ESE';
        else if (direction >118.13 && direction < 129.37) str='SEbE';
        else if (direction >129.38 && direction < 140.62) str='SE';
        else if (direction >140.63 && direction < 151.87) str='SEbS';
        else if (direction >151.88 && direction < 163.12) str='SSE';
        else if (direction >163.13 && direction < 174.37) str='SbE';
        else if (direction >174.38 && direction < 185.62) str='S';
        else if (direction >185.63 && direction < 196.87) str='SbW';
        else if (direction >196.88 && direction < 208.12) str='SSW';
        else if (direction >208.13 && direction < 219.37) str='SWbS';
        else if (direction >219.38 && direction < 230.62) str='SW';
        else if (direction >230.63 && direction < 241.87) str='SWbW';
        else if (direction >241.88 && direction < 253.12) str='WSW';
        else if (direction >253.13 && direction < 264.37) str='WbS';
        else if (direction >264.38 && direction < 275.62) str='W';
        else if (direction >275.63 && direction < 286.87) str='WbN';
        else if (direction >286.88 && direction < 298.12) str='WNW';
        else if (direction >298.13 && direction < 309.37) str='NWbW';
        else if (direction >309.38 && direction < 320.62) str='NW';
        else if (direction >320.63 && direction < 331.87) str='NWbN';
        else if (direction >331.88 && direction < 343.12) str='NNW';
        else if (direction >343.13 && direction < 354.37) str='NbW';

        direction = direction.toFixed(0);
        
        return direction + "° " + str;
    },
    formatPrecip: function(str) {
        if (!str) return "--";

        if (str == "NO") return "No Precipitation";

        if (str == "RA1") return "Rain - Very Light";
        if (str == "RA2") return "Rain - Light";
        if (str == "RA3") return "Rain - Moderate";
        if (str == "RA4") return "Rain - Heavy";

        if (str == "SN1") return "Snow - Very Light";
        if (str == "SN2") return "Snow - Light";
        if (str == "SN3") return "Snow - Moderate";
        if (str == "SN4") return "Snow - Heavy";
        if (str == "SN5") return "Snow - Very Heavy";

        if (str == "RS") return "Rain & Snow";
        if (str == "GR") return "Graupel & Hail";
        if (str == "ZR") return "Freezing Rain";

        return "--";
    },
    formatSky: function(str) {
        if (!str || str == "") return "--";
        if (str == "CLR") return "Clear";
        if (str == "FEW") return "Few";
        if (str == "SCT") return "Scattered";
        if (str == "BKN") return "Broken";
        if (str == "OVC") return "Overcast";
        if (str == "X") return "Obscured";

        return "--";
    },
    getSkyIcon: function(symbol) {
        if (symbol == "BKN") return "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAFAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTEwQzEwRDc0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTEwQzEwRDg0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMTBDMTBENTQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMTBDMTBENjQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEABcVFSEXITQfHzRCLykvQj0zMjIzPUZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkYBGSEhKiUqMyAgM0YzKjNGRkY4OEZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRv/AABEIAHAAcAMBIgACEQEDEQH/xAB1AAADAQEBAQEAAAAAAAAAAAAABAYFBwIDAQEBAAAAAAAAAAAAAAAAAAAAABAAAAQCBgcGBQQDAAAAAAAAAAECAwQFESGxEnIGMUFRccHRNGGRoSJCM/CBMmIT4VKCFPGiIxEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8ArAAAAB4ccQ0k1LMkpLWYzpnN2oBNH1OGXlTz2CMeiYuauXa17EJ0F8bT7wFHGZmabpTDpvn+46k8z8BgPT6MdOm/d7E1ENiDyuVBKiVHT+xPE+XiMmeQjUG+ltoqE3CP50mAUONi31U/kWauwz4AKNi2FU/kWSu0z4i5kqS/ptHRXd4mF8xpL+mo6K6U2gJhifRjKqTXfLYusuB+IoYLMrLx3Xy/Ge3Snv1WDFkECzGqcS8VJERUdgejcsUeaFV/BXA+feAq0rSsiUkyMj1kPQ5wzExcqcu+ZFGlCtB/LiXeLOWTdqPTR9LhF5k8toDUAAAAGROZqmAbup91ZHd7Pu5bRpPvJYbU6upKSpMc4Wp2ZRO1biquz9CAe4CAdmbpkR9q1n8VmYvYGXtQKLjZV+pWswS+BRAtE2jT6lbTDgAENmfqywJtULkQ2Z+rLAm1QCnkvRNYeJhfMfRK3ptDEl6JrDxML5j6JW9NoDIyp7juFNosRHZU9x3Cm0WIBOOl7Uci44VfpVrIQUfAOyx0iM+1Cy+KjIdJCcwgURzRtr0+lWwwC8omaY9qugnE/Unj8xqDnEM85KovzVXFXVltLXzL5DoqFEtJKSdJGVJAJnNEWaEIh0n9fmVXqLR42D5ZYgqb0UrCjifDvGVPnjdjF06E0JL5fqLaXQ5Q0O23rJJU7zrPxAOAAAACGzP1ZYE2qFyIbM/VlgTaoBTyXomsPEwvmPolb02hiS9E1h4mF8x9Erem0BkZU9x3Cm0WIjsqe47hTaLEAAAABI5ogyI0xKdflXwPh3B7LUYbzBsq0t6MJ6O7QHZ0x+aDcLWkr5fxrspElIIhTMWki0L8pl8doBWMP+xGLvVXnDTVvoHSUldIi2Dm0WRsRi73pcM/9qR0lJ3iI9oD9AAAAENmfqywJtULkQ2Z+rLAm1QCnkvRNYeJhfMfRK3ptDEl6JrDxML5j6JW9NoDIyp7juFNosRHZU9x3Cm0WIAAAADw4i+g0nXSRlWObwKlMRbe1KyLxoHSHF3EGo6qCM6xzaCJT8W3R9RrI/GkAzPWjbjHKfVQovmQuJe//Zhm3dZpKneVR+In80wpmSIgiqLyKPxLiPWWI0jSqGVpLzJ49wCpAAAAENmfqywJtULkQ2Z+rLAm1QCnkvRNYeJhfMfRK3ptDEl6JrDxML5j6JW9NoDIyp7juFNosRHZU9x3Cm0WIAAAADOnDxMwbpnrSaS/lUI2Qsm7GIo9PmPcQ2c0RhUJhk6T86uHMfbLMH+NpUQoq11JwlzOwBvRMOmJaU0v6VFR8bhzv/rK4r7m1d5clEOlDInMqTHt3k+6gju9v28tgB2CjERrROt6DqMth7A0ObwEweljh0FVoWhXxUYvIGYNRyL7Z1+pOsgDghsz9WWBNqhciGzP1ZYE2qAU8l6JrDxML5j6JW9NoYkvRNYeJhfMfRK3ptAZGVPcdwptFiI7KnuO4U2ixAAVjYxEE0brmgqiLaeweY6YNQKL7h1+lOsxBx8wembhUlVoQhPxWYD2y25OIyk/WdKvtT/iou0dCbbS0gkJKhKSoIZ0oliYBqug3FfUrh8hqAAAAAMiayZuPTeTQh391GnFz1CKUiJlrvqbWWvbzIdMHyfh24lBtupJST1GAmoLM6TK7EpoMvWnXvL4+QyZ/FNRUQS2VXk3CKntpPaNWKysRmZw66C1JXzLkMd2RRjZ0fjvdqTIwFjJTpgmt3EL5j6JW9NojzhIxg7txxO4lcAFCRj53bjit5K4gNHL0YzBqcW8q6RkVHbpDkbmenywqf5q4Fz7hksyGMdOi5d7VVENuDyulJ3olV77U6O/TYAm0oiZk76nFnr2ciFrKpM3AJvKoW7+6jRh56xpMsNsJuNJJKS1EPqAAAAA/9k=";
        else if (symbol == "CLR") return "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAFAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OERBMzZEQkU0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OERBMzZEQkY0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4REEzNkRCQzQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4REEzNkRCRDQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEABcVFSEXITQfHzRCLykvQj0zMjIzPUZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkYBGSEhKiUqMyAgM0YzKjNGRkY4OEZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRv/AABEIAHEAcAMBIgACEQEDEQH/xAByAAEAAwEBAQEAAAAAAAAAAAAABQYHBAMCAQEBAAAAAAAAAAAAAAAAAAAAABAAAQMBBAULAwUBAAAAAAAAAQACAwQRIRIFMUFRIgbwYXGRobHB0TJCE4FSkuFiIzMUghEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AtiIiAviSRsTS55DWjWVH5lm0WXtsO9IRus89gVLnq6rNZMN7vtY3QOW0oLHWcTRR2tpxjP3G5vmexQM2fVkptx4eZtylqPhcEB1S6/7W+J8lNQ5NRwiwRh3O/e7/AAQUU11VM635Hk8xPggrqqF1vyPB5yfFaSyJkfoaBZdcEfEyT1tBtuvCCgQZ9WQutL8Y2P0dlhVhouJIZzhmHxO26W9er63LvmyajmFhjDedm73eKg67hgjepXW/sd4HzQW1rg8Ymm0HWF+rOIKuqyuTDe2zSx2g8toV0y3NoswbYN2QDeZ5bQgk0REBROcZo2gjwj+14OAbP3fTtUlNK2FjpH+lotKzeWSXMqm3S6R1jRs2DoH6oPuioZszlIab/U97uWtXygy6KhZhjF/udrKZdQMoIhG2zF7nbTy0LtQEREBERAREQcVfl0VczDIL/a7WFQ62hmyyUBxv9THt5alpK4sxoGV8RjdZi9rth5aUHjlOZNr4rTYJG3Pb49BUms5o55Mrq960YThkG0a/MLRWuDgHC8G8IK1xRVlkbadvv3ndA0dvcubhihxF1U8XDdZ06z4dajc/mM1Y/Yyxg+n6kq6ZbTf5aaOPWBa7pN5QdqIiAiIgIiICIiAiIgp/E9EGubUt9267p1FSPDdYZ6f4neqK7/k6PJdmdwfNRyDW0Y/xv7rVU+H6kw1bW+2TdI7urzQctaf9FY+27FJh7bFpDRhAGxZrVWw1jy+6yQk/latKBxC0a0H6iIgIiICIiAiIgIiIPiVgkY5hFocCLOlZvl7jBVx2i8PA7bFpL3YWl2wWrNaPFNVsIF7ng9tqD3zyMx1slus4usK90E4qKeOUe5o69faq5xVTG2OcC6zA49o8V78MVgfG6mdpZvN6Dp6j3oLMiIgIiICIiAiIgIiII/N5RFRyk62lv5XeKpeRxOkrI8PtOI9AU5xRVhsbacaXHE7oGjrPcv3hekwsdUuF7t1vQNPb3IJ6spW1kLoX6HDTsOorPoJZMsqrSN6N1jhtGvrGhaUoLPcp/wBjPmj/ALWDR9w2dOzqQS1LUx1cYliNrTysPOvdZ5lebSZc8gjFGfUzxHOr5TVUdUwSRG0Hs6UHuiIgIiICIiAvCqqY6SMyymxo5WDnSpqo6VhklNgHb0Kh5pm0mYvAAwxj0s8TzoPgmTN6zZjd+Lf0HatCghbBG2NnpaLAonJMr/wx43j+V/q5hs81NICIiCv5vkTaoGWABsukjU7yPI7VU4Kmoy2U4CWOFzmnxC0xclZQQ1rcMrbTqcNI6CgiqLiOCYYZ/wCN232ny5XqcjmZKLY3Bw2tNvcqbVcMTsJMBD26gbj5dqiXUlXSu9D2Hmt7wg0xFmrcwq4N35Ht12EnxR2YVc+78j3a7AT4INGlmjhGKRwaNpNigK7iWKLdpx8jvu0N8yquyjq6t1ga97trre8qYo+GJXm2oIY37W3nyHaghp6mozKUYyXuNzWjwCtmUZE2lAlnAdLpA1N8zyG1S1JQQUbbIWgc+s/VdSAiIgIiICIiAiIg4Kj1pT+tEQd6IiAiIgIiIP/Z";
        else if (symbol == "FEW") return "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAFAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTEwQzEwQ0Y0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTEwQzEwRDA0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4REEzNkRDMDQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMTBDMTBDRTQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEABcVFSEXITQfHzRCLykvQj0z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";
        else if (symbol == "X") return "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABQAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OERBMzZEQkE0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OERBMzZEQkI0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4REEzNkRCODQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4REEzNkRCOTQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEAAICAgICAgICAgIDAgICAwQD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";
        else if (symbol == "OVC") return "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAA8AAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTEwRTBCQjA0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTEwRTBCQjE0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMTBFMEJBRTQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMTBFMEJBRjQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEAAYEBAQFBAYFBQYJBgUGCQsI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";
        else if (symbol == "SCT") return "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAFAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QTEwQzEwRDM0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QTEwQzEwRDQ0OEQxMTFFNDk4MzJGMTkwQzlERDBEM0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMTBDMTBEMTQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMTBDMTBEMjQ4RDExMUU0OTgzMkYxOTBDOUREMEQzQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEABcVFSEXITQfHzRCLykvQj0z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";
        else return "";
    },
    formatWind: function(speed,direction) {
        var str = "";

        if (speed == "C") str = "Calm";
        else if (speed == "L") str = "Light";
        else if (speed == "M") str = "Moderate";
        else if (speed == "S") str = "Strong";
        else if (speed == "X") str = "Extreme";

        if (direction != null) {
            str += ", " + formatters.formatDirection(direction);
        }
        if (str == "") return "--";
        else return str;
    },
    formatBlowingSnow: function(speed,direction) {
        var str = "";

        if (speed == "None") str = "None";
        else if (speed == "Prev") str = "Previous";
        else if (speed == "L") str = "Light";
        else if (speed == "M") str = "Moderate";
        else if (speed == "I") str = "Intense";
        else if (speed == "U") str = "Unkown";
        if (direction != null) {
            str += ", " + formatters.formatDirection(direction);
        }
        if (str == "") return "--";
        else return str;
    },
    formatLatLng: function(point) {
        if (!point) return "--"
        var s = "";

        if (point.lat != null && point.lng != null) {
            s+= point.lat.toFixed(5) + ", "
            s+= point.lng.toFixed(5)
        }
        else if (point.length == 2) {
            s+= point[1].toFixed(5) + ", "
            s+= point[0].toFixed(5)
        }
        else s = "--"

        return s;
    },
    formatLatLngAsUTM: function(point, html) {
        if (!point) return "--"
        var s = "";

        var lat, lng;
        if (point.lat != null && point.lng != null) {
            lat = point.lat;
            lng = point.lng;
        }
        else if (point.length == 2) {
            lat = point[1];
            lng = point[0];
        }
        else return "--";

        // get utm
        var utm = LatLonToUTMXY(DegToRad(lat), DegToRad(lng));

        var e = utm.x.toFixed(0);

        var n = utm.y.toFixed(0);
        if (n.length == 6) n = "0" + n;

        var _e = e;
        var _n = n;
        if (html) {
            _e = e.substr(0, 1);
            _e += "<span>" + e.substr(1, 2) + "</span>";
            _e += e.substr(3, 3);

            _n = n.substr(0, 2);
            _n += "<span>" + n.substr(2, 2) + "</span>";
            _n += n.substr(4, 3);
        }

        // format
        s += utm.zone + utm.band + " ";
        s += _e + " ";
        s += _n;

        return s;
    },
    formatDate: function(date,time) {
        var str = "";
        if (date) str += moment(date).format("YYYY-MM-DD");
        if (time) str += " " + moment(time).format("h:mm a"); //todo: user setting 24 hour/ 12 hour clock
        if (str == "") str = "--";
        return str;
    },
    formatDuration: function(minutes) {
        var str = "--";
        if (minutes >= 60) {
            var hours = minutes / 60;
            //var mins = Math.floor(minutes % 60);
            var mins = parseInt(minutes % 60);
            str = Math.floor(hours) + " hr";
            if (mins > 0) str += " " + mins + " min";
        }
        else str = Math.floor(minutes) + " min";
        return str;
    }
};

return {
    formatters: formatters,
    CSV: function(profile) {
        var text = "depth top (cm),height (cm),hardness top,hardness bottom,grain type primary,grain type secondary\n";

        angular.forEach(profile.layers,function(layer){
            text += profile.depth - layer.depth - layer.height + ",";
            text += layer.height + ",";
            text += layer.hardness + ",";
            text += layer.hardness2 + ",";
            text += getGrainType(layer, "") + ",";
            text += getGrainType(layer, "2") + "";

            text += "\n";
        });

        var data = "data:text/csv;base64," + btoa(unescape(encodeURIComponent(text)));

        var link = document.createElement('a');
        angular.element(link)
            .attr('href', data)
            .attr('download', 'profile.csv');
        link.click();
    },
    // JPEG: function(profile, _settings) {

    //     var columns = [
    //         { width: 140 },
    //         { width: 28 },
    //         { width: 282 + 100 },
    //         { width: 240 }
    //     ];
    //     var canvasOptions = { scale: 2, borderColor: "#222", background: "#fff", labelColor: "#222", commentLineColor: "#aaa", dashedLineColor: "#ddd", showDepth: true, showDensity: true };
    //     var settings = {
    //         selectedLayer: null,
    //         dragging: null,
    //         hoverDragLayer: null,
    //         view: null,
    //         depthDescending: true,
    //         fontsLoaded: false,
    //         tempMode: false,
    //         tempUnits: Global.user.settings.tempUnits == 0 ? 'C' : 'F'
    //     }
    //     if (_settings) {
    //         if (_settings.view) settings.view = _settings.view;
    //         if (_settings.depthDescending) settings.depthDescending = _settings.depthDescending;
    //     }

    //     // compile canvas
    //     // todo: a cleaner event-based way? maybe two-way binding? $watch the param? "newScope.loaded = function..."
    //     var canvasHtml = '<canvas profile-editor="profile" settings="settings" options="canvasOptionsPrint" columns="columnsPrint" width="790" height="600"></canvas>';
    //     var newScope = $rootScope.$new();
    //     newScope.profile =  profile;
    //     newScope.settings =  settings;
    //     newScope.canvasOptionsPrint = canvasOptions;
    //     newScope.columnsPrint = columns;

    //     var canvas = $compile(angular.element(canvasHtml))(newScope)[0];

    //     var newScope2 = $rootScope.$new();
    //     newScope2.profile =  profile;
    //     newScope2.formatters =  formatters;
    //     var detailsCanvas = $compile(angular.element(document.getElementById("img-area").innerHTML))(newScope2)[0];
        
    //     $("#img-render").remove();
    //     var div = document.createElement('DIV');
    //     div.id = "img-render";

    //     div.appendChild(detailsCanvas);

    //     var iframe = document.getElementById('img-holder'),
    //     iframedoc = iframe.contentDocument || iframe.contentWindow.document;
    //     iframedoc.body.className = "iframe";
    //     iframedoc.body.innerHTML = "";
    //     iframedoc.body.appendChild(div);
       
    //     console.log($("#img-holder").contents().find('body'));


    //     html2canvas($("#img-holder").contents().find('body'), {
    //         height: 1400,
    //         width: 1260,
    //         onrendered: function(_canvas) {
    //             var context = _canvas.getContext('2d');
    //             context.fillStyle = '#fff';
    //             context.fillRect(0,430,2000,2000);
    //             context.drawImage(canvas,18,430,canvas.width*.8,canvas.height*.8)

    //             var _data = _canvas.toDataURL('image/jpeg', .9);
    //             var _link = document.createElement('a');
    //             angular.element(_link)
    //                 .attr('href', _data)
    //                 .attr('download', 'profile2.jpg');
    //             _link.click();
    //         }
    //     });

    //     // setTimeout(function(){
    //     //     var data = canvas.toDataURL('image/jpeg', .8);
    //     //     var link = document.createElement('a');
    //     //     angular.element(link)
    //     //         .attr('href', data)
    //     //         .attr('download', 'profile.jpg');
    //     //     link.click();

    //     // },300);
    // },

    PDF: function(profile, _settings) {
        this.PDForJPEG(profile, _settings, 'PDF');
    },
    JPEG: function(profile, _settings) {
        this.PDForJPEG(profile, _settings, 'JPEG');
    },
    PDForJPEG: function(profile, _settings, PDForJPEG) {

        var columns = [
            { width: 150 },
            { width: 27 },
            { width: 353 },
            { width: 240 }
        ];
        // canvas options
        var profileHeight = 708;
        if (PDForJPEG == 'JPEG') profileHeight = 608;
        var canvasOptions = { scale: 4, borderColor: "#000", labelColor: "#000", commentLineColor: "#000", background: "#fff", dashedLineColor: "#aaa", print: true, showDepth: true, showDensity: true };

        var settings = {
            selectedLayer: null,
            dragging: null,
            hoverDragLayer: null,
            view: null,
            depthDescending: true,
            fontsLoaded: false,
            tempMode: false,
            tempUnits: Global.user.settings.tempUnits == 0 ? 'C' : 'F'
        }
        if (_settings) {
            if (_settings.view) settings.view = _settings.view;
            if (_settings.depthDescending) settings.depthDescending = _settings.depthDescending;
        }

        // compile canvas
        // todo: a cleaner event-based way? maybe two-way binding? $watch the param? "newScope.loaded = function..."
        var canvasHtml = '<canvas profile-editor="profile" settings="settings" options="canvasOptionsPrint" columns="columnsPrint" width="1540" height="' + profileHeight + '"></canvas>';
        var newScope = $rootScope.$new();
        newScope.profile = profile;
        newScope.settings = settings;
        newScope.canvasOptionsPrint = canvasOptions
        newScope.columnsPrint = columns;
        var canvas = $compile(angular.element(canvasHtml))(newScope)[0];

        // timeout is used to allow the canvas time to render
        // todo: a cleaner event-based way?
        setTimeout(function() {

            // canvas for JPEG output
            var _canvas = document.createElement('canvas');
            var scale = 2;
            _canvas.width = 760 * scale;
            _canvas.height = 930 * scale;
            _canvas.style.display = 'none';
            var context = _canvas.getContext("2d");
            document.body.appendChild(_canvas);

            context.fillStyle = "#fff";
            context.fillRect(0,0,_canvas.width,_canvas.height);
            context.fillStyle = "#000";

            context.translate(-30 * scale, -18 * scale);
            context.scale(scale,scale);

            var render = {
                drawImage: function(img, x, y, w, h) {
                    if (img.tagName && img.tagName == "CANVAS") {
                        var _img = img.toDataURL("image/jpeg",1);
                        doc.addImage(_img, "JPEG", x, y, w, h);
                    }
                    else doc.addImage(img, "JPEG", x, y, w, h);

                    x *= 3.779527559;
                    y *= 3.779527559;
                    w *= 3.779527559;
                    h *= 3.779527559;
                    x = parseInt(x) + .5;
                    y = parseInt(y) + .5;
                    w = parseInt(w) + .5;
                    h = parseInt(h) + .5;

                    if (img.tagName && img.tagName == "CANVAS") {
                        context.drawImage(img, x, y, w, h);
                    }
                    else {
                        var image = new Image();    
                        image.src = img;
                        image.onload = function() { context.drawImage(image, x, y, w, h); }
                    }
                },
                drawLine: function(x1, y1, x2, y2) {
                    doc.line(x1, y1, x2, y2);

                    x1 *= 3.779527559;
                    y1 *= 3.779527559;
                    x2 *= 3.779527559;
                    y2 *= 3.779527559;
                    x1 = parseInt(x1) + .5;
                    y1 = parseInt(y1) + .5;
                    x2 = parseInt(x2) + .5;
                    y2 = parseInt(y2) + .5;

                    context.beginPath();
                    context.moveTo(x1, y1);
                    context.lineTo(x2, y2);
                    context.stroke();
                },
                setLineWidth: function(width) {
                    doc.setLineWidth(width);

                    width *= 3.779527559;
                    width = parseInt(width) + .5;

                    context.lineWidth = width;
                },
                setFont: function(name, size, type) {
                    if (!type) type = "normal";

                    doc.setFont(name);
                    doc.setFontSize(size);
                    doc.setFontType(type);

                    context.font = type + ' ' + size + 'pt ' + name;
                },
                setLineColor: function(r, g, b) {
                    doc.setDrawColor(r, g, b);

                    context.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',1)';
                },
                // setDrawColor: function(r, g, b) {
                //     doc.setDrawColor(r, g, b);

                //     context.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',1)';
                // },
                setTextColor: function(r, g, b) {
                    doc.setTextColor(r, g, b);

                    context.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',1)';
                },
                drawText: function(x, y, text, width) {
                    if (width) { 
                        var lines = doc.splitTextToSize(text, width, {});
                        doc.text(x, y, lines);

                        x *= 3.779527559;
                        y *= 3.779527559;
                        x = parseInt(x) + .5;
                        y = parseInt(y) + .5;

                        var lineHeight = doc.internal.getLineHeight();
                        lineHeight *= 1.333333; //lineHeight is in pt, convert to px
                        for(var i = 0; i < lines.length; i++) {
                            var newY = y + (lineHeight * i);
                            context.fillText(lines[i], x, newY);
                        }
                    }
                    else {
                        doc.text(x, y, text);

                        x *= 3.779527559;
                        y *= 3.779527559;
                        x = parseInt(x) + .5;
                        y = parseInt(y) + .5;

                        context.fillText(text, x, y);
                    }
                },
                addPage: function() {
                    doc.addPage();
                }
            }

            function drawParam(label, val, x, y, labelWidth) {

                render.setFont("helvetica", 10.5, "normal");
                render.setTextColor(110, 110, 110);
                render.drawText(x, y, label);
                render.setTextColor(0, 0, 0);
                render.drawText(x + labelWidth, y, val);

            }
            
            function drawSkySymbol(symbol, x, y) {
                if (!symbol | symbol == "") return;
                var imgData = formatters.getSkyIcon(symbol);
                if (imgData != "") render.drawImage(imgData, x, y, 4, 4);
            };

            // All units are in the set measurement for the document
            // This can be changed to "pt" (points), "mm" (Default), "cm", "in"
            var doc = new jsPDF("p", "mm", "letter");

            var docWidth = 216;
            var margin = 15;
            var marginTop = 13;
            var fullWidth = docWidth - margin;

            var topLine = 12.6 + marginTop + 5;
            var upperLine = 33.3 + 6;
            var lowerLine = 73.7 + 6;

            // draw logo
            
            var logoWidth = 64;
            var logoHeight = 16;
            var isLogoLoaded = $q.defer();
            console.log("ORG");
            console.log(profile.organization);
            if (profile.organization && profile.organization.logoUrl) {
                var logo = new Image();
                logo.crossOrigin =" Anonymous";
                logo.src = profile.organization.logoUrl + "?sdgdsgsdg";
                logo.onload = function() {
                    console.log("PHOTO LOADED!");

                    var photoWidthMM = logo.width * 0.264583333;
                    var photoHeightMM = logo.height * 0.264583333;

                    var scale = Math.min(logoWidth/photoWidthMM, logoHeight/photoHeightMM);
                    var _photoWidth = photoWidthMM * scale;
                    var _photoHeight = photoHeightMM * scale;

                    // draw to canvas

                    var photoCanvas = document.createElement("canvas");
                    photoCanvas.height = (_photoHeight * 3.779527559) * 2;
                    photoCanvas.width = (_photoWidth * 3.779527559) * 2;
                    photoCanvas.style.display = "none";
                    document.body.appendChild(photoCanvas);
                    photoContext = photoCanvas.getContext('2d');
                    photoContext.drawImage(logo,0,0,photoCanvas.width,photoCanvas.height);

                    //var imgData = photoCanvas.toDataURL("image/jpeg",1);
                    render.drawImage(photoCanvas, 
                        // logo x, y
                        docWidth - margin - (_photoWidth), 
                        0 + marginTop - (_photoHeight - 9.8),
                        //0 + marginTop + ((logoHeight - _photoHeight) / 2), 
                        // logo width, height
                        _photoWidth ,_photoHeight);
                    isLogoLoaded.resolve();
                }
            }
            else {
                isLogoLoaded.resolve();
            }

            console.log("3!");

            // 'Snow Profile' title

            var imgData = 'data:image/jpeg;base64,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';
            render.drawImage(imgData, margin - .5, marginTop + 2.3, 75 * .66, 11.5 * .66);

            var titleCanvas=document.createElement("canvas");
            titleCanvas.width = 600;
            titleCanvas.height = 70;
            titleCanvas.style.display = 'none'
            document.body.appendChild(titleCanvas);
            var ctx=titleCanvas.getContext("2d");
            ctx.fillStyle = "#fff";
            ctx.fillRect(0,0,titleCanvas.width,titleCanvas.height);

            ctx.fillStyle = "#000";
            //ctx.font="76px 'Roboto Condensed'";
            //ctx.fillText("Snow Profile",0,60);

            ctx.font="700 68px 'Roboto Condensed'";
            ctx.fillText("Avanet",0,60);

            ctx.font="100 68px 'Roboto Condensed'";
            ctx.fillStyle = "#000";
            ctx.fillText("Snow Profile",206,60);

            setTimeout(function() {

                render.drawImage(titleCanvas, margin + 9.24, marginTop + 1.7, (titleCanvas.width / 2) * 0.264583333, (titleCanvas.height / 2) * 0.264583333);

            },60);

            //var _imgData = 'data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABaAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEM4REYwNjg4MUMzMTFFNDlERkJGRTkxRDk0NDgwNEIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEM4REYwNjk4MUMzMTFFNDlERkJGRTkxRDk0NDgwNEIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0QzhERjA2NjgxQzMxMUU0OURGQkZFOTFEOTQ0ODA0QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0QzhERjA2NzgxQzMxMUU0OURGQkZFOTFEOTQ0ODA0QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEAAEBAQEBAQEBAQECAQEBAgIC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';
            //render.drawImage(_imgData, margin, 1.5 + marginTop, (titleCanvas.width / 2) * 0.264583333, (titleCanvas.height / 2) * 0.264583333)



            //render.setFont("helvetica", 31, "normal");
            //render.drawText(margin, 8.6 + marginTop, 'Snow Profile');

            console.log("4!");

            // gray line beneath title
            render.setLineColor(130,130,130);
            render.setLineWidth(.6);
            render.drawLine(margin, topLine - 5.8, fullWidth, topLine - 5.8); // horizontal line

            console.log("5!");
            // graph
            var posY = 93;


            var scale = .122
            var height = (canvas.height / 2) * scale;
            var width = (canvas.width / 2) * scale;
            render.drawImage(canvas, margin, posY, width, height);
            //var profile_image = canvas.toDataURL("image/jpeg",1);
            //render.drawImage(profile_image, margin, posY, width, height);

            console.log("6!");

            drawParam("Organization:", formatters.formatOrg(profile.organization), margin, topLine + 2, 24);

            drawParam("Location:", formatters.format(profile.locationName), margin, topLine + 9.1, 18);
            drawParam("Lat/Lng:", formatters.formatLatLng(profile.location), margin, topLine + 16.1, 18);

            console.log("7!");

            drawParam("Date:", formatters.formatDate(profile.date,profile.time), margin + 80, topLine + 9.1, 19);
            drawParam("Observer:", formatters.format(profile.user.fullName), margin + 80, topLine + 16.1, 19);

            console.log("8!");

            drawParam("Snowpit depth:", formatters.formatCm(profile.depth), margin + 144, topLine + 9.1, 30);
            drawParam("Snowpack depth:", formatters.formatCm(profile.snowpackHeight), margin + 144, topLine + 16.1, 30);

            console.log("9!");

            drawParam("Elevation:", formatters.formatElevation(profile.elevation), margin, upperLine + 12 + 8.5, 18);
            console.log("10a!");
            drawParam("Slope:", formatters.formatSlope(profile.slope), margin, upperLine + 12 + 15.5, 18);
            console.log("10b!");
            drawParam("Aspect:", formatters.formatDirection(profile.aspect), margin, upperLine + 12 + 22.5, 18);
            console.log("10c!");
            drawParam("Air temp.:", formatters.formatTemp(profile.airTemp), margin, upperLine + 12 + 29.5, 18);
            console.log("10d!");
            drawParam("Sky:", formatters.formatSky(profile.sky), margin, upperLine + 12 + 36.5, 18);
            console.log("10e!");
            drawSkySymbol(profile.sky, margin + 10.5, upperLine + 12 + 33.2);

            console.log("10!");

            drawParam("Wind:", formatters.formatWind(profile.windSpeed,profile.windDirection), margin + 45, upperLine + 12 + 8.5, 27);
            console.log("11a!");

            drawParam("Blowing snow:", formatters.formatBlowingSnow(profile.blowingSnow,profile.blowingSnowDirection), margin + 45, upperLine + 12 + 15.5, 27);
            console.log("11b!");

            drawParam("Precipitation:", formatters.formatPrecip(profile.precipType), margin + 45, upperLine + 12 + 22.5, 27);
            console.log("11c!");

            drawParam("Foot Pen. (PF):", formatters.formatCm(profile.PF), margin + 45, upperLine + 12 + 29.5, 27);
            console.log("11d!");

            drawParam("Ski Pen. (PS):", formatters.formatCm(profile.PS), margin + 45, upperLine + 12 + 36.5, 27);

            console.log("11!");

            // horizontal line top
            render.setLineColor(130,130,130);
            render.setLineWidth(.24);
            render.drawLine(margin, upperLine + marginTop, fullWidth, upperLine + marginTop); 

            render.drawLine(54.9, upperLine + marginTop, 54.9, lowerLine + marginTop); // vertical line 1

            render.drawLine(127, upperLine + marginTop, 127, lowerLine + marginTop); // vertical line 2

            console.log("12!");

            if (profile.notes) {
                render.setFont("helvetica", 8);
                render.drawText(130.5, upperLine + 18, profile.notes, 70);
            }

            console.log("13!");

            render.drawLine(margin, lowerLine + marginTop, fullWidth, lowerLine + marginTop); // horizontal line bottom

            console.log("14!");

            // footer

            var footerY = 272;
            if (PDForJPEG == 'JPEG') footerY -= (100 * 0.264583333);

            render.setTextColor(110, 110, 110);
            render.setFont("helvetica", 6, "normal");
            render.drawText(docWidth - margin - 21.9, footerY, "Powered by AVATECH");
            // var left = docWidth - margin - 42.6;
            // render.drawText(left, footerY, "Powered by");
            // var _imgData = 'data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABaAAD/4QMtaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEM4REYwNjg4MUMzMTFFNDlERkJGRTkxRDk0NDgwNEIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEM4REYwNjk4MUMzMTFFNDlERkJGRTkxRDk0NDgwNEIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0QzhERjA2NjgxQzMxMUU0OURGQkZFOTFEOTQ0ODA0QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0QzhERjA2NzgxQzMxMUU0OURGQkZFOTFEOTQ0ODA0QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEAAEBAQEBAQEBAQECAQEBAgIC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';
            // render.drawImage(_imgData, left + 12.4, footerY - 4.22, 300 * .1 , 43 * .1);

            //render.drawText(170.6, 273, profile._id.toUpperCase());
            render.drawText(margin, footerY, profile._id.toUpperCase());

            console.log("13!");

            // PHOTOS PAGE

            // if (profile.photos.length) {

            //     var photoWidth = 86; //91.4;
            //     var photoHeight = 127;
            //     var photoHeightInside = 115;
            //     var photoMargin = 0;
            //     var photoMarginHorizontal = 13.5;

            //     // doc.rect(margin, marginTop, photoWidth, photoHeight);
            //     // doc.rect(margin, marginTop + photoMargin + photoHeight, photoWidth, photoHeight);
            //     // doc.rect(margin + photoWidth + photoMarginHorizontal, marginTop, photoWidth, photoHeight);
            //     // doc.rect(margin + photoWidth + photoMarginHorizontal, marginTop + photoMargin + photoHeight, photoWidth, photoHeight);

            //     var photoPageCount = Math.ceil(profile.photos.length / 4);

            //     for (var page = 0; page < photoPageCount; page++) {

            //         // ahhhhhhhh!!!! we have to figure out how to add the page when everything is async
            //         render.addPage();

            //         // footer
            //         render.setTextColor(110, 110, 110);
            //         render.setFont("helvetica", 6, "normal");
            //         render.drawText(margin, 270, "Powered by AVATECH");
            //         render.drawText(170.6, 270, profile._id.toUpperCase());

            //         render.setLineColor(130,130,130);
            //         render.setLineWidth(.3);

            //         var photoStart = page * 4;

            //         for(var i = photoStart; i < (photoStart + 4); i++) {
            //             if (i == profile.photos.length) break;

            //             var url = profile.photos[i].url;
            //             var caption = profile.photos[i].caption;
            //             (function(url, caption, i, photoStart){
            //                 var photo = new Image();
            //                 photo.crossOrigin =" Anonymous";

            //                 photo.src = url; // + "?" + escape(new Date());

            //                 photo.onload = function() {
            //                     console.log("Photo URL: " + photo.src);
            //                     console.log("photo.width: " + photo.width);
            //                     console.log("photo.height: " + photo.height);

            //                     // calculate size

            //                     var photoWidthMM = photo.width * 0.264583333;
            //                     var photoHeightMM = photo.height * 0.264583333;

            //                     console.log("photoWidthMM: " + photoWidthMM);
            //                     console.log("photoHeightMM: " + photoHeightMM);

            //                     var scale = Math.min(photoWidth/photoWidthMM, photoHeightInside/photoHeightMM);
            //                     var _photoWidth = photoWidthMM * scale;
            //                     var _photoHeight = photoHeightMM * scale;

            //                     console.log("scale: " + scale);
            //                     console.log("_photoWidth: " + _photoWidth);

            //                     // draw to canvas

            //                     var photoCanvas = document.createElement("canvas");
            //                     photoCanvas.height = (_photoHeight * 3.779527559) * 2;
            //                     photoCanvas.width = (_photoWidth * 3.779527559) * 2;
            //                     photoCanvas.style.display = "none";
            //                     document.body.appendChild(photoCanvas);
            //                     photoContext = photoCanvas.getContext('2d');
            //                     photoContext.drawImage(photo,0,0,photoCanvas.width,photoCanvas.height);

            //                     console.log("_photoHeight: " + _photoHeight);

            //                     var dataURL = photoCanvas.toDataURL("image/jpeg",1);

            //                     var offsetY = photoHeightInside - _photoHeight;

            //                     // calcualte positions

            //                     var x, y;

            //                     console.log("currentPos: " + (i - photoStart));

            //                     if (i - photoStart == 0) { 
            //                         x = margin;
            //                         y = marginTop + offsetY;
            //                     }
            //                     else if (i - photoStart == 1) {
            //                         x = margin;
            //                         y = marginTop + photoMargin + photoHeight + offsetY;
            //                     }
            //                     else if (i - photoStart == 2) { 
            //                         x = margin + photoWidth + photoMarginHorizontal; 
            //                         y = marginTop + offsetY;
            //                     }
            //                     else if (i - photoStart == 3) { 
            //                         x = margin + photoWidth + photoMarginHorizontal; 
            //                         y = marginTop + photoMargin + photoHeight + offsetY;
            //                     }

            //                     if (x && y) {
            //                         // render photo
            //                         render.drawImage(dataURL, x, y, _photoWidth, _photoHeight);

            //                         // render caption
            //                         render.setFont("helvetica", 8, "normal");
            //                         render.setTextColor(0, 0, 0);
            //                         render.drawText(x, y + _photoHeight + 4.5, caption);
            //                     }


            //                 }
            //             })(url, caption, i, photoStart);
            //         }
            //     }
            // }


            $q.all([isLogoLoaded.promise]).then(function(){

                if (PDForJPEG == "PDF") {
                        doc.save('profile.pdf');
                }
                else if (PDForJPEG == "JPEG") {

                    setTimeout(function(){

                        // var finalScale = .66;
                        // var finalCanvas = document.createElement('canvas');
                        // finalCanvas.width = _canvas.width * finalScale;
                        // finalCanvas.height = _canvas.height * finalScale;
                        // finalCanvas.style.display = 'none';
                        // document.body.appendChild(finalCanvas);
                        // var finalContext = finalCanvas.getContext("2d");
                        // //finalContext.scale(finalScale, finalScale);
                        // finalContext.setTransform(finalScale,0,0,finalScale,0,0);
                        // finalContext.drawImage(_canvas, 0, 0, _canvas.width, _canvas.height);

                        _canvas.toBlob(function(blob) {
                            saveAs(blob, "profile.jpg");
                        }, "image/jpeg", 1);

                        // remove canvas elements from DOM
                        setTimeout(function(){
                            if (_canvas) document.body.removeChild(_canvas);
                            //if (finalCanvas) document.body.removeChild(finalCanvas);
                        },1000);

                        //saveAs(blob, "profile.jpg");
                        // if(typeof saveAs.unload === 'function') {
                        //     if(global.setTimeout) {
                        //         setTimeout(saveAs.unload,911);
                        //     }
                        // }



                    }, 300);
                }

            });

        }, 300);
    }
}

}]);