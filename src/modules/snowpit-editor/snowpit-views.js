angular.module('avatech').factory('snowpitViews', ['$q','snowpitConstants', function ($q,snowpitConstants) { 

// helper functions

function averageGrainSize(num1, num2) {
    if (!isNaN(num1)) num1 = parseFloat(num1);
    if (!isNaN(num2)) num2 = parseFloat(num2);
    if (num1 && num2) return (num1 + num2) / 2;
    else if (num1 && !num2) return num1;
    else if (num2 && !num1) return num2;
}
function hasGrainTypeCategory(layer, cats) {
    if (layer.grainType)
        if (cats.indexOf(layer.grainType.category) > -1) return true;
    if (layer.grainType2)
        if (cats.indexOf(layer.grainType2.category) > -1) return true;
    return false;
}

// calculate

var calculatePersistentGrains = function(profile) {

    angular.forEach(profile.layers,function(layer, index){

        if (!layer.views) layer.views = {};
        layer.views.pgrains = { layer: [] };

        // RULE 1: Persistent grain types (faceted crystals, depth hoar, surface hoar)
        if (hasGrainTypeCategory(layer,["D","e","I"])) layer.views.pgrains.layer.push({ });

    });
}
var calculateFlags = function(profile) {

    // A: Average grain size > 1mm
    // B: Layer hardness < 1F
    // C: Grain type is facets, depth hoar or surface hoar
    // D: Interface grain size difference > 0.15mm
    // E: Interface hardness difference > 1 step
    // F: Interface is 20-85cm deep

    angular.forEach(profile.layers,function(layer, index){

        if (!layer.views) layer.views = {};
        layer.views.flags = { layer: [], interface: []};

        var nextLayer = profile.layers[index + 1];
        var depth = profile.depth - layer.depth;

        // RULE 1: average of grain sizes > 1mm
        if (grainSize > 1) layer.views.flags.layer.push({ rule: 'A' });

        // RULE 2: Hardness < 1F
        var hardness = snowpitConstants.hardness[layer.hardness].index;
        if (layer.hardness2) hardness = (hardness + snowpitConstants.hardness[layer.hardness2].index) / 2;

        if (hardness < 7) layer.views.flags.layer.push({ rule: 'B' });

        // RULE 3: Grain type (faceted crystals, depth hoar, surface hoar)
        if (hasGrainTypeCategory(layer,["D","e","I"])) layer.views.flags.layer.push({ rule: 'C' });

        // RULE 4: INTERFACE: grain size diff > 0.5mm
        var grainSize = averageGrainSize(layer.grainSize,layer.grainSize2);
        if (nextLayer) {
            var nextGrainSize = averageGrainSize(nextLayer.grainSize,nextLayer.grainSize2);

            var dif = Math.abs(nextGrainSize - grainSize);
            if (dif > .5) layer.views.flags.interface.push({ rule: 'D' });
        }

        // RULE 5: INTERFACE: hardness difference > 1 step
        var hardness = snowpitConstants.hardness[layer.hardness].index;
        if (layer.hardness2) hardness = (hardness + snowpitConstants.hardness[layer.hardness2].index) / 2;

        if (nextLayer) {
            var nextHardness = snowpitConstants.hardness[nextLayer.hardness].index;
            if (nextHardness.hardness2) nextHardness = (nextHardness + snowpitConstants.hardness[nextLayer.hardness2].index) / 2;

            var dif = Math.abs(nextHardness - hardness);
            if (dif > 3) layer.views.flags.interface.push({ rule: 'E' });
        }

        // RULE 6: INTERFACE: 20-85cm deep
        var depthDown = profile.depth - layer.depth;
        if (depthDown >= 20 && depthDown <= 85) layer.views.flags.interface.push({ rule: 'F' });
    });
}
var calculateLemons = function(profile) {

    // A: Layer depth ≤ 1m
    // B: Layer height ≤ 10 cm
    // C: Grain type is facets or surface hoar
    // D: Interface hardness difference ≥ 1 step
    // E: Interface grain size difference ≥ 1 mm

    angular.forEach(profile.layers,function(layer, index){

        if (!layer.views) layer.views = {};
        layer.views.lemons = { layer: [], interface: []};

        var nextLayer = profile.layers[index + 1];
        var depth = profile.depth - layer.depth;

        // RULE 1: layer depth ≤ 1m from surface
        if ((profile.depth - layer.depth) < 100) layer.views.lemons.layer.push({ rule: 'A' });

        // RULE 2: Weak layer thickness ≤ 10 cm
        if (layer.height <= 10) layer.views.lemons.layer.push({ rule: 'B' });

        // RULE 3: Persistent grain types (faceted crystals, depth hoar, surface hoar)
        if (hasGrainTypeCategory(layer,["D","e","I"])) layer.views.lemons.layer.push({ rule: 'C' });

        // RULE 4: INTERFACE: hardness difference ≥ 1 step
        var hardness = snowpitConstants.hardness[layer.hardness].index;
        if (layer.hardness2) hardness = (hardness + snowpitConstants.hardness[layer.hardness2].index) / 2;

        if (nextLayer) {
            var nextHardness = snowpitConstants.hardness[nextLayer.hardness].index;
            if (nextHardness.hardness2) nextHardness = (nextHardness + snowpitConstants.hardness[nextLayer.hardness2].index) / 2;

            var dif = Math.abs(nextHardness - hardness);
            if (dif >= 3) layer.views.lemons.interface.push({ rule: 'D' });
        }

        // RULE 5: INTERFACE: grain size difference ≥ 1 mm
        var grainSize = averageGrainSize(layer.grainSize,layer.grainSize2);
        if (nextLayer) {
            var nextGrainSize = averageGrainSize(nextLayer.grainSize,nextLayer.grainSize2);

            var dif = Math.abs(nextGrainSize - grainSize);
            if (dif > 1) layer.views.lemons.interface.push({ rule: 'E' });
        }

    });
}

var calculateICSSG = function(profile) {

    angular.forEach(profile.layers,function(layer, index){

        if (!layer.views) layer.views = {};
        layer.views.icssg = { layer: [] };

        if (!layer.grainType) return;

        if (layer.grainType.category == "a") layer.views.icssg.layer.push({ color: "#00FF00" });
        else if (layer.grainType.category == "s") layer.views.icssg.layer.push({ color: "#FFD700" });
        else if (layer.grainType.category == "u") layer.views.icssg.layer.push({ color: "#228B22" });
        else if (layer.grainType.category == "d") layer.views.icssg.layer.push({ color: "#FFB6C1" });
        else if (layer.grainType.category == "e") layer.views.icssg.layer.push({ color: "#ADD8E6" });
        else if (layer.grainType.category == "D") layer.views.icssg.layer.push({ color: "#0000FF" });
        else if (layer.grainType.category == "I") layer.views.icssg.layer.push({ color: "#FF00FF" });
        else if (layer.grainType.category == "h" && layer.grainType.code == "O") layer.views.icssg.layer.push({ color: "#BBBBBB" }); // should be black bars ||||||||
        else if (layer.grainType.category == "h") layer.views.icssg.layer.push({ color: "#FF0000" });
        else if (hasGrainTypeCategory(layer,["i"])) layer.views.icssg.layer.push({ color: "#00FFFF" });

    });
}

return [
    { name: "Default", id: null },
    { name: "Flags", id: "flags", func: calculateFlags },
    { name: "Lemons", id: "lemons", func: calculateLemons },
    { name: "Persistent Grains", id: "pgrains", func: calculatePersistentGrains },
    { name: "ICSSG Grain Coloring", id: "icssg", func: calculateICSSG }
];

}]);