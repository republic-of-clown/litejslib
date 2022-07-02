'use strict'; /* https://github.com/republic-of-clown/litejslib */

function Live() {}

Live.prototype = (function(currentScript) {

    var data = { defersrc: currentScript.getAttribute('data-defersrc'), index: currentScript.getAttribute('data-index') };
    var dataCanonical = document.querySelector('link[rel="canonical"]');
    var dataSuffix = currentScript.src.split('?')[1];
    var home = null;
    var homepage = null;
    var jsArray = [];
    var jsIndex = 0;
    var reArray = [];
    var replied = false;
    var scripts = {};

    if (data.defersrc) {
        jsArray.push(data.defersrc);
        oncreate();
    } else {
        replied = true;
    }

    if (data.index) {
        home = new URL(document.URL);
        if (dataCanonical && home.searchParams.has(data.index)) {
            dataCanonical.href = dataCanonical.href + '?' + data.index + '=' + home.searchParams.get(data.index);
        }
    }

    function oncreate() {
        if (jsIndex < jsArray.length) {
            var script = document.createElement('script');
            script.defer = true;
            script.src = dataSuffix ? jsArray[jsIndex] + (jsArray[jsIndex].indexOf('?') === -1 ? '?' : '&') + dataSuffix : jsArray[jsIndex];
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
        craft: {
            value: (function() {
                var set = function(name, value) {
                    if (name instanceof Object) {
                        for (var key in name) {
                            this.setAttribute(key, name[key]);
                        }
                    } else {
                        this.setAttribute(name, value ?? '');
                    }
                };
                var unset = function(name) {
                    if (name instanceof Array) {
                        for (var key in name) {
                            this.removeAttribute(name[key]);
                        }
                    } else {
                        this.removeAttribute(name);
                    }
                };
                return function() {
                    var cache = null;
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
                        appendBeforeHTML: function(text) {
                            elements[index].innerHTML = text + elements[index].innerHTML;
                        },
                        appendHTML: function(text) {
                            elements[index].innerHTML = elements[index].innerHTML + text;
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
                            while (elements[index].tagName !== tagName) {
                                elements.pop();
                                if (--index < 0) {
                                    elements = null;
                                    break;
                                }
                            }
                        },
                        blockquote: function(html, className = '', id = '') {
                            var element = start('blockquote', className, id, true);
                            element.set = set;
                            element.unset = unset;
                            if (html) {
                                element.innerHTML = '<p>' + (Array.isArray(html) ? html.join('</p><p>') : html) + '</p>';
                            }
                            return element;
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
                                        element.setAttribute(i, properties[i]);
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
                            if (elements) {
                                var element = elements[0];
                                elements = null;
                                index = -1;
                                return element;
                            }
                            return null;
                        },
                        h: function(html, className = '', id = '', size = 3) {
                            var element = start('h' + size, className, id, true);
                            element.set = set;
                            element.unset = unset;
                            if (html) {
                                element.innerHTML = html;
                            }
                            return element;
                        },
                        hr: function() {
                            return start('hr', '', '', true);
                        },
                        init: function(html) {
                            elements[index].innerHTML = html ?? '';
                        },
                        load: function() {
                            elements = cache;
                            index = cache.length - 1;
                            cache = null;
                            return elements[index];
                        },
                        p: function(html, className = '', id = '') {
                            var element = start('p', className, id, true);
                            element.set = set;
                            element.unset = unset;
                            if (html) {
                                element.innerHTML = Array.isArray(html) ? html.join('<br>') : html;
                            }
                            return element;
                        },
                        save: function() {
                            cache = Array.from(elements);
                        },
                        set: function(name, value) {
                            elements[index].set(name, value);
                        },
                        space: function() {
                            elements[index].append(' ');
                        },
                        start: function(tagName, className, id, properties, html) {
                            var element = start(tagName, className, id);
                            element.set = set;
                            element.unset = unset;
                            if (properties) {
                                for (var i in properties) {
                                    element.setAttribute(i, properties[i]);
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
                                index = elements.length;
                                elements.push(element);
                            }
                            element.set = set;
                            element.unset = unset;
                            return element;
                        },
                        startCustomById: function(id) {
                            var element = document.getElementById(id);
                            if (index < 0) {
                                index = 0;
                                elements = [element];
                            } else {
                                index = elements.length;
                                elements.push(element);
                            }
                            element.set = set;
                            element.unset = unset;
                            return element;
                        },
                        unset: function(name) {
                            elements[index].unset(name);
                        }
                    };
                };
            })()
        },
        decode: {
            value: function(hexstr) {
                var u8arr = new Uint8Array(hexstr.length >> 1);
                for (var i = 0, j = 0; i < u8arr.length; ++i) {
                    var jNext = j + 2;
                    u8arr[i] = parseInt(hexstr.slice(j, jNext), 16);
                    j = jNext;
                }
                return this.decoder.decode(u8arr);
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
        edit: {
            value: (function() {
                var args = [];
                var replacer = function(text, i) {
                    return args[i] || args[i] === 0 ? args[i] : text;
                };
                return function(text, params) {
                    args = Array.isArray(params) ? params : [params];
                    if (Array.isArray(text)) {
                        return text.join('<br>').replace(/{(\d+)}/g, replacer).split('<br>');
                    }
                    return text = text.replace(/{(\d+)}/g, replacer);
                };
            })()
        },
        encode: {
            value: function(str) {
                var u8arr = this.encoder.encode(str);
                for (var i = 0, hexstr = ''; i < u8arr.length; ++i) {
                    var byte = u8arr[i];
                    if (byte < 16) {
                        hexstr += '0' + u8arr[i].toString(16);
                    } else {
                        hexstr += u8arr[i].toString(16)
                    }
                }
                return hexstr;
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
                        reset: function() {
                            home = new URL(document.URL);
                        },
                        set: function(name, value) {
                            if (value) {
                                home.searchParams.set(name, value);
                            } else {
                                home.searchParams.delete(name);
                            }
                            return this;
                        },
                        toSearchUri: function(name, value) {
                            if (name) {
                                if (name instanceof Object) {
                                    for (var key in name) {
                                        this.set(key, name[key]);
                                    }
                                } else {
                                    this.set(name, value);
                                }
                            }
                            return home.origin + home.pathname + home.search;
                        },
                        toUri: function(name, value) {
                            if (name) {
                                if (name instanceof Object) {
                                    var params = [];
                                    for (var key in name) {
                                        if (name[key]) {
                                            params.push(key + '=' + name[key]);
                                        }
                                    }
                                    return home.origin + home.pathname + '?' + params.join('&');
                                }
                                if (value) {
                                    return home.origin + home.pathname + '?' + name + '=' + value;
                                }
                            }
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
        importYouTube: {
            value: function(reply) {
                var src = 'https://www.youtube.com/iframe_api';
                scripts[src] = document.createElement('script');
                scripts[src].async = true;
                scripts[src].src = src;
                document.head.insertBefore(scripts[src], currentScript);
                window.onYouTubeIframeAPIReady = reply?.bind(this);
            }
        },
        importYTPlayer: {
            value: function(id, onready, onstate, p = 360) {
                var x = Math.ceil(p * 16 / 9);
                var y = p;
                return new YT.Player(id, {
                    events: { onReady: onready, onStateChange: onstate },
                    host: 'https://www.youtube-nocookie.com',
                    videoId: id,
                    width: x, height: y
                });
            }
        },
        invoke: {
            value: function() {
                var args = Array.from(arguments);
                if (args.length !== 0 && this.hasOwnProperty(args[0])) {
                    this[args.shift()].apply(this, args);
                    return true;
                }
                return false;
            }
        },
        trim: {
            value: function(text) {
                return text.replace(/\s+/g, '');
            }
        },
        [Symbol.toStringTag]: { value: Live.name }
    });
})(document.currentScript);

var live = new Live();
