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
                HTMLElement.prototype.init = function(html) {
                    this.innerHTML = html ?? '';
                };
                HTMLElement.prototype.isset = function(name, value = '') {
                    if (value !== '') {
                        return this.getAttribute(name) === value;
                    }
                    return this.getAttribute(name) !== null;
                };
                HTMLElement.prototype.set = function(name, value) {
                    if (name instanceof Object) {
                        for (var key in name) {
                            this.setAttribute(key, name[key]);
                        }
                    } else {
                        this.setAttribute(name, value ?? '');
                    }
                };
                HTMLElement.prototype.unset = function(name) {
                    if (Array.isArray(name)) {
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
                            if (html) {
                                element.innerHTML = html;
                            }
                            return element;
                        },
                        hr: function() {
                            return start('hr', '', '', true);
                        },
                        init: function(html) {
                            elements[index].init(html);
                        },
                        load: function() {
                            elements = cache;
                            index = cache.length - 1;
                            cache = null;
                            return elements[index];
                        },
                        move: function(id) {
                            var element = document.getElementById(id);
                            elements[index].append(element);
                            return element;
                        },
                        p: function(html, className = '', id = '') {
                            var element = start('p', className, id, true);
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
                return (this.decoder ?? new TextDecoder()).decode(u8arr);
            }
        },
        define: {
            value: function(prop, value) {
                Object.defineProperty(this, prop, {
                    value: value,
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
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
                var u8arr = (this.encoder ?? new TextEncoder()).encode(str);
                for (var i = 0, hexstr = ''; i < u8arr.length; ++i) {
                    var byte = u8arr[i];
                    if (byte < 16) {
                        hexstr += '0' + byte.toString(16);
                    } else {
                        hexstr += byte.toString(16)
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
        lang: {
            value: function(pattern) {
                if (pattern) {
                    return (navigator.language ?? '').slice(0, 2) === pattern;
                }
                return navigator.language ?? '';
            }
        },
        rand: {
            value: (function() {
                var buffer = new Uint32Array(1);
                var num = function() { crypto.getRandomValues(buffer); return buffer[0]; };
                return function(range = 0) {
                    switch (range) {
                        case 0x0:
                        case 0x100000000:
                            return num();
                        case 0x1:
                            return 0;
                        case 0x2:
                        case 0x4:
                        case 0x8:
                        case 0x10:
                        case 0x20:
                        case 0x40:
                        case 0x80:
                        case 0x100:
                        case 0x200:
                        case 0x400:
                        case 0x800:
                        case 0x1000:
                        case 0x2000:
                        case 0x4000:
                        case 0x8000:
                        case 0x10000:
                        case 0x20000:
                        case 0x40000:
                        case 0x80000:
                        case 0x100000:
                        case 0x200000:
                        case 0x400000:
                        case 0x800000:
                        case 0x1000000:
                        case 0x2000000:
                        case 0x4000000:
                        case 0x8000000:
                        case 0x10000000:
                        case 0x20000000:
                        case 0x40000000:
                            return num() & (range - 1);
                        case 0x80000000:
                            return num() & 0x7FFFFFFF;
                        default:
                            if (range < 0 || range > 0x100000000) {
                                return num();
                            }
                            return num() % range;
                    }
                };
            })()
        },
        rand64: {
            value: function(numofInt64, format = false) {
                var hashArray = new BigUint64Array(numofInt64);
                crypto.getRandomValues(hashArray);
                if (format) {
                    var hash = '';
                    for (var i = 0; i < numofInt64; ++i) {
                        hash += hashArray[i].toString(16).padStart(16, '0');
                    }
                    return hash;
                }
                return hashArray;
            }
        },
        sha256: {
            value: function(text) {
                return crypto.subtle.digest('SHA-256', (this.encoder ?? new TextEncoder()).encode(text));
            }
        },
        sha512: {
            value: function(text) {
                return crypto.subtle.digest('SHA-512', (this.encoder ?? new TextEncoder()).encode(text));
            }
        },
        strval: {
            value: function(buffer) {
                if (buffer instanceof ArrayBuffer) {
                    var u8arr = new Uint8Array(buffer);
                    for (var i = 0, hexstr = ''; i < u8arr.length; ++i) {
                        var byte = u8arr[i];
                        if (byte < 16) {
                            hexstr += '0' + byte.toString(16);
                        } else {
                            hexstr += byte.toString(16);
                        }
                    }
                    return hexstr;
                }
                return buffer.toString();
            }
        },
        timer: {
            value: (function() {
                var date = null;
                var id = 0;
                return {
                    start: function(reply) {
                        if (id) {
                            clearTimeout(id);
                            id = 0;
                        }
                        if (reply(date = new Date())) {
                            var ontimer = function() {
                                date.setTime(Date.now());
                                id = 0;
                                if (reply(date)) {
                                    id = setTimeout(ontimer, 1000 - date.getMilliseconds());
                                }
                            }
                            id = setTimeout(ontimer, 1000 - date.getMilliseconds());
                        }
                    },
                    stop: function() {
                        if (id) {
                            clearTimeout(id);
                            id = 0;
                            return true;
                        }
                        return false;
                    }
                };
            })()
        },
        [Symbol.toStringTag]: { value: Live.name }
    });
})(document.currentScript);

var live = new Live();
