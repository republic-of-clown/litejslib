'use strict'; /* https://github.com/republic-of-clown/litejslib */

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

    function set(name, value) {
        this.setAttribute(name, value ?? name);
    }

    function unset(name) {
        this.removeAttribute(name);
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
        craft: {
            value: function() {
                var elements = null;
                var index = -1;
                var start = function(tagName, className, id, closing = false) {
                    var element = document.createElement(tagName);
                    if (closing) {
                        if (elements !== null) {
                            elements[index].appendChild(element);
                        }
                    } else {
                        if (index < 0) {
                            index = 0;
                            elements = [element];
                        } else {
                            elements.push(element);
                            elements[index++].appendChild(element);
                        }
                    }
                    if (className) {
                        element.className = className;
                    }
                    if (id) {
                        element.id = id;
                    }
                    return element;
                };
                return {
                    append: function(text) {
                        elements[index].append(text);
                    },
                    appendByHTML: function(text) {
                        elements[index].innerHTML = elements[index].outerHTML + text;
                    },
                    back: function() {
                        if (0 < index) {
                            elements.pop();
                            --index;
                        } else {
                            elements = null;
                            index = -1;
                        }
                    },
                    backTo: function(tagName) {
                        if (tagName) {
                            tagName = tagName.toUpperCase();
                        }
                        do {
                            if (0 < index--) {
                                elements.pop();
                            } else {
                                elements = null;
                                index = -1;
                            }
                        } while (index !== -1 && elements[index].tagName !== tagName);
                    },
                    br: function() {
                        return start('br', '', '', true);
                    },
                    close: function(tagName, className, id, properties, text) {
                        if (tagName) {
                            var element = start(tagName, className, id, true);
                            element.set = set;
                            element.unset = unset;
                            if (properties) {
                                for (var i in properties) {
                                    element.set(i, properties[i]);
                                }
                            }
                            if (text) {
                                elements[index].append(text);
                            }
                            return element;
                        }
                        if (0 < index) {
                            elements.pop();
                            --index;
                            return elements[index];
                        }
                        elements = null;
                        index = -1;
                        return null;
                    },
                    flush: function() {
                        var element = elements[0];
                        elements = null;
                        index = -1;
                        return element;
                    },
                    hr: function() {
                        return start('hr', '', '', true);
                    },
                    init: function(html) {
                        elements[index].innerHTML = html ?? '';
                    },
                    set: function(name, value) {
                        elements[index].setAttribute(name, value ?? name);
                    },
                    start: function(tagName, className, id, properties, html) {
                        var element = start(tagName, className, id);
                        element.set = set;
                        element.unset = unset;
                        if (properties) {
                            for (var i in properties) {
                                element.set(i, properties[i]);
                            }
                        }
                        if (html) {
                            element.innerHTML = html;
                        }
                        return element;
                    },
                    startCustom: function(element) {
                        if (index < 0) {
                            index = 0;
                            elements = [element];
                        } else {
                            elements.push(element);
                            ++index;
                        }
                        element.set = set;
                        element.unset = unset;
                        return element;
                    },
                    unset: function(name) {
                        elements[index].removeAttribute(name);
                    }
                };
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
