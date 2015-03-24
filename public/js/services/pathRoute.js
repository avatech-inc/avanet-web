angular.module('avatech').factory("pathRoute", ['$location',
    function($location) {

	    function inherit(parent, extra) {
	        return angular.extend(new (angular.extend(function() {}, {prototype:parent}))(), extra);
	    }

	    function pathRegExp(path, opts) {
	        var insensitive = opts.caseInsensitiveMatch,
	            ret = {
	              originalPath: path,
	              regexp: path
	            },
	            keys = ret.keys = [];

	        path = path
	          .replace(/([().])/g, '\\$1')
	          .replace(/(\/)?:(\w+)([\?\*])?/g, function(_, slash, key, option){
	            var optional = option === '?' ? option : null;
	            var star = option === '*' ? option : null;
	            keys.push({ name: key, optional: !!optional });
	            slash = slash || '';
	            return ''
	              + (optional ? '' : slash)
	              + '(?:'
	              + (optional ? slash : '')
	              + (star && '(.+?)' || '([^/]+)')
	              + (optional || '')
	              + ')'
	              + (optional || '');
	          })
	          .replace(/([\/$\*])/g, '\\$1');

	        ret.regexp = new RegExp('^' + path + '$', insensitive ? 'i' : '');
	        return ret;
	    }

	    function switchRouteMatcher(on, route) {
	        var keys = route.keys,
	          params = {};

	        if (!route.regexp) return null;

	        var m = route.regexp.exec(on);
	        if (!m) return null;

	        for (var i = 1, len = m.length; i < len; ++i) {
	        var key = keys[i - 1];

	        var val = 'string' == typeof m[i]
	              ? decodeURIComponent(m[i])
	              : m[i];

	        if (key && val) {
	          params[key.name] = val;
	        }
	        }
	        return params;
	    }

	    function parseRoute(_routes) {
	        // Match a route
	        var params, match;

	        angular.forEach(_routes, function(route, path) {
	            if (!match && (params = switchRouteMatcher($location.path(), route))) {
	              match = inherit(route, {
	                params: angular.extend({}, $location.search(), params),
	                pathParams: params});
	              match.$$route = route;
	            }
	        });
	        // No route matched; fallback to "otherwise" route
	        return match || routes[null] && inherit(routes[null], {params: {}, pathParams:{}});
	    }

        return function() {
	        var _routes = [];
	        angular.forEach(routes,function(route, path){
	            _routes.push(pathRegExp(path, route));
	        });
	        var route = parseRoute(_routes);
	        if (route) return route.originalPath;
        	else return null;
    	};
    }
]);