'use strict'; // https://github.com/republic-of-clown/litejslib

function Live() {}

Live.prototype = (function(mainScript) {

    var home = null;
    var homepage = null;
    var jsArray = [];
    var jsIndex = 0;
    var reArray = [];
    var replied = false;
    var scripts = {};

    if (mainScript) {
        jsArray.push(mainScript);
        oncreate();
    } else {
        replied = true;
    }

    function oncreate() {
        if (jsIndex < jsArray.length) {
            var script = document.createElement('script');
            script.defer = true;
            script.src = jsArray[jsIndex];
            script.onload = onscript;
            document.head.appendChild(script);
        } else {
            var replies = reArray;
            reArray = [];
            replied = true;
            for (var i = 0; i < replies.length; ++i) {
                replies[i]?.();
            }
        }
    }

    function onscript() {
        var src = jsArray[jsIndex++];
        scripts[src] = this;
        scripts[src].onload = null;
        oncreate();
    }

    return Object.create(Object.prototype, {
        constructor: { value: Live },
        clear: {
            value: function() {
                for (var prop in this) {
                    delete this[prop];
                }
                home = null;
                homepage = null;
            }
        },
        defineConstValue: {
            value: function(prop, value) {
                Object.defineProperty(this, prop, {
                    value: value,
                    configurable: false,
                    enumerable: false,
                    writable: false
                });
            }
        },
        defineGet: {
            value: function(prop, getter) {
                Object.defineProperty(this, prop, {
                    get: getter,
                    configurable: true,
                    enumerable: true
                });
            }
        },
        defineGetSet: {
            value: function(prop, getter, setter) {
                Object.defineProperty(this, prop, {
                    get: getter,
                    set: setter,
                    configurable: true,
                    enumerable: true
                });
            }
        },
        defineValue: {
            value: function(prop, value) {
                Object.defineProperty(this, prop, {
                    value: value,
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
            }
        },
        home: {
            get: function() {
                if (home === null) {
                    home = new URL(document.URL);
                }
                return home;
            }
        },
        homepage: {
            get: function() {
                if (home === null) {
                    home = new URL(document.URL);
                }
                if (homepage === null) {
                    homepage = {
                        delete: function(name) {
                            home.searchParams.delete(name);
                            return this;
                        },
                        get: function(name, defaultValue) {
                            var param = home.searchParams.get(name);
                            if (param) {
                                return param;
                            }
                            return defaultValue;
                        },
                        getInt: function(name, defaultValue) {
                            var param = home.searchParams.get(name);
                            if (param) {
                                param = parseInt(param);
                                return isNaN(param) ? defaultValue : param;
                            }
                            return defaultValue;
                        },
                        set: function(name, defaultValue) {
                            home.searchParams.set(name, defaultValue);
                            return this;
                        },
                        toSearchUri: function() {
                            return home.origin + home.pathname + home.search;
                        },
                        toUri: function() {
                            return home.origin + home.pathname;
                        }
                    };
                }
                return homepage;
            }
        },
        import: {
            value: function(js, reply) {
                (Array.isArray(js) ? js : [js]).forEach(function(src) {
                    if (scripts.hasOwnProperty(src) === false) {
                        jsArray.push(src);
                        scripts[src] = false;
                    }
                });
                if (replied) {
                    replied = false;
                    reArray.push(reply?.bind(this));
                    oncreate();
                } else {
                    reArray.push(reply?.bind(this));
                }
            }
        },
        invoke: {
            value: function(prop) {
                if (this.hasOwnProperty(prop)) {
                    this[prop]();
                    return true;
                }
                return false;
            }
        },
        [Symbol.toStringTag]: { value: Live.name }
    });
})(document.currentScript.getAttribute('data-defersrc'));

var live = new Live();
