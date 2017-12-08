import _ from 'lodash'

export const __bind = function(fn, me) {
  return function() {
      return fn.apply(me, arguments);
  };
}

export const d = (typeof console !== "undefined" && console !== null ? console.log.bind(console) : function() {})
window._d = window.d = d
export const __hasProp = {}.hasOwnProperty
export const __extend = function (target = {}, source) {
    for (let key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key]
        }
    }
    return target
}
export const __extends = function(child, parent) {
  for (var key in parent) {
      if (__hasProp.call(parent, key))
          child[key] = parent[key];
  }
  function ctor() {
      this.constructor = child;
  }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
  child.__super__ = parent.prototype;
  return child;
}
export const __slice = [].slice;

export const $ = function (query, container) {
    return (container || document).querySelector(query)
}
export const $$ = function (query, container) {
    return [].slice.call((container || document).querySelectorAll(query), 0)
}
_.minxin({
    touch: function(e, prevent) {
        var touch;
        if (prevent == null) {
            prevent = false;
        }
        touch = null;
        if ((e.originalEvent != null) && (e.originalEvent.touches != null)) {
            touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        }
        if (touch != null) {
            if (prevent) {
                e.originalEvent.preventDefault();
            }
            return touch;
        } else {
            return e;
        }
    },
    save: function(key, val) {
        var e;
        val = JSON.stringify({
            contents: val
        });
        try {
            return localStorage.setItem(key, val);
        } catch (_error) {
            e = _error;
        }
    },
    load: function(key, otherwise) {
        var e, item;
        try {
            item = localStorage.getItem(key);
        } catch (_error) {
            e = _error;
            return otherwise;
        }
        if (item !== null) {
            return JSON.parse(item).contents;
        } else {
            return otherwise;
        }
    },
    lerp: function(a, b, pc) {
        return a + (b - a) * pc;
    },
    unlerp: function(a, b, val) {
        if (a === b) {
            return val;
        } else {
            return (val - a) / (b - a);
        }
    },
    constrain: function(num, lo, hi) {
        if (num > hi) {
            return hi;
        }
        if (num < lo) {
            return lo;
        }
        return num;
    },
    rto: function(hi) {
        return Math.random() * hi;
    },
    hexToRGB: function(hex) {
        var i, rgb, _i, _results;
        rgb = /^#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i.exec(hex).slice(1);
        _results = [];
        for (i = _i = 0; _i <= 2; i = ++_i) {
            _results.push(parseInt(rgb[i], 16));
        }
        return _results;
    }
})

export const _
