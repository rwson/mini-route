/**
 * MiniRoute
 *
 * brower route library
 */

(function(win, doc) {

    var body = doc.body,
        head = doc.head;

    var replaceParam = /(\/\:\w+)/g,
        prefix = location.protocol + "//" + location.host,
        caches = {},
        lastContainer,
        isPushpushState;

    function _loop(obj, interator) {
        var type = _typeOf(obj);
        switch (type) {
            case "Array":
                for (var i = 0, len = obj.length; i < len; i ++) {
                    interator(obj[i], i, obj);
                }
            break;
            case "Object":
                for (var i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        interator(obj[i], i, obj);
                    }
                }
            break;
            default:
            break;
        }
    }

    function _decode(str) {
        str = str || "";
        return decodeURIComponent(str);
    }

    function _typeOf(obj) {
        return {}.toString.call(obj).slice(8, -1);
    }

    function _ensureRouteObj(route) {
        var res, msg;
        if (_typeOf(route) !== "Object") {
            msg = "route item must be an object!";
        }

        if (!msg) {
            if (_typeOf(route.url) !== "String" || !route.url.length) {
                msg = "you must provide a valid url!";
            }
        }

        if (!msg) {
            if (_typeOf(route.templateUrl) !== "String" || !route.templateUrl.length) {
                msg = "you must provide a valid templateUrl!";
            }
        }

        if (!msg) {
            if (route.handler && _typeOf(route.handler) !== "Function") {
                msg = "you must provide a valid handler!";
            }
        }

        if (msg) {
            res = {
                valid: false,
                msg: msg
            };
        } else {
            res = {
                valid: true
            };
        }

        return res;
    }

    function _bindEvents() {
        if (doc.addEventListener) {
            doc.removeEventListener("click", _clickHandle);
            doc.addEventListener("click", _clickHandle);
        } else if (doc.attachEvent) {
            doc.detachEvent("onclick", _clickHandle);
            doc.attachEvent("onclick", _clickHandle);
        } else {
            doc.onclick = null;
            doc.onclick = _clickHandle;
        }
    }

    function _clickHandle(e) {
        var eve = e || win.event,
            target = eve.target || eve.srcElement,
            tagName = target.tagName.toLowerCase(),
            href = target.href;
        if (tagName === "a" && href) {
            if (isPushpushState) {} else {
                href = href.replace(prefix, "/").replace(/^\/\#/, "/");
                location.hash = href;
            }
        }
        eve.preventDefault();
        return false;
    }

    function _UrlToRegexp(url) {
        var params = [],
            tmp = [],
            prefixs = [];
        tmp = url.split(/\//g);
        _loop(tmp, function(tmpChild, i, tmp) {
            if (tmpChild.charAt(0) === ":") {
                params.push(tmpChild.slice(1));
            } else {
                prefixs.push(tmpChild);
            }
        });

        return {
            regexp: new RegExp((url).replace(replaceParam, "\\/\\w+")),
            params: params,
            prefix: prefixs.join("/")
        };
    }

    function _getRoute(routes) {
        var path, cur, target, params, paramObj, res;

        path = location.hash.replace("#", "");
        paramObj = {};

        _loop(routes, function(routeChild, i, routes) {
            if (!routeChild.regexp) {
                if(routeChild.url === path) {
                    target = routeChild;
                }
            } else if (routeChild.regexp && routeChild.regexp.test(path)) {
                params = path.replace(routeChild.prefix, "").slice(1).split("/");
                _loop(params, function(paramChild, j, params) {
                    paramObj[routeChild.params[j]] = _decode(params[j]);
                });
                target = routeChild;
            }
        });

        res = {
            path: path,
            params: paramObj,
            name: target.name,
            origin: target
        };
        return res;
    }

    function _getTemplate(cfg, callback) {
        var ob, xhr, container, template, readyState, status, responseText, rootEl;

        rootEl = cfg.rootEl;
        ob = cfg.ob;
        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            readyState = xhr.readyState;
            status = xhr.status;
            responseText = xhr.responseText;

            if (readyState === 4) {
                if (status >= 200 && status < 300 || status === 304) {
                    template = responseText;
                    container = doc.createElement("div");
                    container.class = (name + "-container");
                    container.innerHTML = template;
                    if (lastContainer) {
                        rootEl.removeChild(lastContainer);
                    }
                    rootEl.appendChild(container);
                    lastContainer = container;
                    ob.pub("route:change:success");
                    ob.pub("route:change:completed");
                    if (_typeOf(callback) === "Function") {
                        callback();
                    }
                } else {
                    ob.pub("route:change:failed", {
                        response: responseText,
                        statusCode: status
                    });
                    ob.pub("route:change:completed");
                    if (_typeOf(callback) === "Function") {
                        callback();
                    }
                }
            }
        };
        xhr.open("GET", cfg.route.origin.templateUrl, true);
        xhr.send(null);
    }

    function _Obversver() {
        this.events = [];
    }

    _Obversver.prototype = {
        constructor: _Obversver,

        pub: function(name) {
            var events = this.events,
                args = [].slice.call(arguments, 1);
            _loop(events, function(cur, i, events) {
                if (name === cur.name) {
                    if (!args) {
                        args = [];
                    }
                    cur.handler.apply(cur.context, args);
                }
            });
        },

        sub: function(name, handler, context) {
            context = context || win;
            this.events.push({
                name: name,
                handler: handler,
                context: context
            });
        }
    };

    function MiniRoute(el) {
        return new MiniRoute.fn.init(el);
    }

    MiniRoute.fn = MiniRoute.prototype = {
        constructor: MiniRoute,

        init: function(el) {
            this.rootEl = el || body;
            this.routes = [];
            caches = {};
            ob = new _Obversver();
            _bindEvents();
        },

        config: function(cfgs) {
            var self = this,
                routes = cfgs.routes,
                typeRoute = _typeOf(routes),
                validInfo, url2Obj;
            isPushpushState = cfgs.pushState || false;

            if (!isPushpushState) {
                prefix += location.pathname;
            }

            switch (typeRoute) {
                case "Array":
                    _loop(routes, function(cur, i) {
                        validInfo = _ensureRouteObj(cur);
                        if (!validInfo.valid) {
                            throw validInfo.msg;
                        }
                        if (replaceParam.test(cur.url)) {
                            url2Obj = new _UrlToRegexp(cur.url);
                            cur.params = url2Obj.params;
                            cur.regexp = url2Obj.regexp;
                            cur.prefix = url2Obj.prefix;
                        } else {
                            cur.params = [];
                        }
                        self.routes.push(cur);
                    });
                break;
                case "Object":
                    _loop(routes, function(cur, i, routes) {
                        cur.name = i;
                        validInfo = _ensureRouteObj(cur);
                        if (!validInfo.valid) {
                            throw validInfo.msg;
                        }
                        if (replaceParam.test(cur.url)) {
                            url2Obj = new _UrlToRegexp(cur.url);
                            cur.params = url2Obj.params;
                            cur.regexp = url2Obj.regexp;
                            cur.prefix = url2Obj.prefix;
                        } else {
                            cur.params = [];
                        }
                        self.routes.push(cur);
                    });
                break;
                default:
                break;
            }
        },

        change: function(route) {
            ob.pub("route:change:start");

            try {
                _getTemplate({
                    rootEl: this.rootEl,
                    ob: ob,
                    route: route
                }, function() {
                    if(_typeOf(route.origin.handler) === "Function") {
                        route.origin.handler(route.params);
                    }
                });
            } catch (e) {
                ob.pub("route:change:failed", e);
            }
        },

        go: function(name, params) {
            var routes = this.routes,
                cur, target, targetUrl;
            _loop(routes, function(cur, i, routes) {
                if (cur.name === name) {
                    target = cur;
                }
            });

            if (target.params.length) {

            }

            if (isPushpushState) {
            } else {
            }
        },

        start: function() {
            var routes = this.routes,
                self = this,
                routeObj;
            if (!isPushpushState) {
                win.onhashchange = function() {
                    routeObj = _getRoute(routes);
                    self.change(routeObj);
                };
                if (location.hash) {
                    routeObj = _getRoute(routes);
                    self.change(routeObj);
                }
            } else {}
        },

        on: function(name, handler, context) {
            context = context || win;
            ob.sub(name, handler, context);
        }
    };

    MiniRoute.fn.init.prototype = MiniRoute.prototype;

    win.MiniRoute = MiniRoute;
})(window, document);