function S(type) {
    return function(v) { return makeSpread(v, type) };
};
function stringify(v) { return v.toString(); };
function accept(type) { return function(v) { return !v || (v.type && v.type === type); } };

// spread types
var NUMBERS = 'number',
    PAIRS = 'pair',
    COLORS = 'color',
    ELEMENTS = 'element';

Rpd.channeltype('anm/numbers',   { adapt: S(NUMBERS),  show: stringify });
Rpd.channeltype('anm/pairs',     { adapt: S(PAIRS),    show: stringify, accept: accept(PAIRS)    });
Rpd.channeltype('anm/colors',    { adapt: S(COLORS),   show: stringify, accept: accept(COLORS)   });
Rpd.channeltype('anm/elements',  { adapt: S(ELEMENTS), show: stringify, accept: accept(ELEMENTS) });

Rpd.nodetype('anm/spread', {
    name: 'spread',
    inlets: {
        'min':   { type: 'core/number', default: 0 },
        'max':   { type: 'core/number', default: 100 },
        'count': { type: 'core/number', default: 5 }
    },
    outlets: {
        'number': { type: 'anm/numbers' }
    },
    process: function(inlets) {
        var min = (inlets.min || 0),
            max = (inlets.max || 0),
            count = (inlets.count || 1);
        var target = [];
        if (min !== max) {
            var step = (max - min) / (count - 1);
            for (var v = min, done = 0; done < count; v += step, done++) { target.push(v); }
        } else {
            while (count--) { target.push(min); }
        }
        return { 'number': makeSpread(target, NUMBERS) };
    }
});

Rpd.nodetype('anm/color', {
    name: 'color',
    inlets: {
        'red':   { type: 'anm/numbers', default: 255 },
        'green': { type: 'anm/numbers', default: 255 },
        'blue':  { type: 'anm/numbers', default: 255 },
        'alpha': { type: 'anm/numbers', default: 1 }
    },
    outlets: {
        'color': { type: 'anm/colors' }
    },
    process: function(inlets) {
        return { 'color':
            Spread.merge([ inlets.red, inlets.green, inlets.blue, inlets.alpha ], COLORS,
                         function(r, g, b, a) {
                             return 'rgba(' + (r ? Math.round(r) : 0) + ',' +
                                              (g ? Math.round(g) : 0) + ',' +
                                              (b ? Math.round(b) : 0) + ',' +
                                              (a || 0) + ')';
                         })
        };
    }
});

Rpd.nodetype('anm/pair', {
    name: 'pair',
    inlets: {
        'a': { type: 'anm/numbers', default: 0 },
        'b': { type: 'anm/numbers', default: 0 }
    },
    outlets: {
        'pair': { type: 'anm/pairs' }
    },
    process: function(inlets) {
        return { 'pair':
            Spread.merge([ inlets.a, inlets.b ], PAIRS,
                         function(a, b) {
                            return new Pair(a, b);
                         })
        };
    }
});

Rpd.nodetype('anm/rect', {
    name: 'rect',
    inlets: {
        'point': { type: 'anm/pairs'  },
        'color': { type: 'anm/colors' },
        'size':  { type: 'anm/pairs'  }
    },
    outlets: {
        'rect': { type: 'anm/elements' }
    },
    process: function(inlets) {
        return { 'rect':
            Spread.merge([ inlets.point, inlets.color, inlets.size ], ELEMENTS,
                         function(point, color, size) {
                            var point = point || new Pair(0, 0);
                            var color = color || '#000';
                            var size = size || new Pair(15, 15);
                            return new anm.Element()
                                          .move(point.a, point.b)
                                          .rect(0, 0,
                                                size.a, size.b)
                                          .fill(color);
                         })
        };
    }
});

Rpd.nodetype('anm/render', function() {
    var element;
    return {
        name: 'render',
        inlets: {
            'what': { type: 'anm/elements' },
        },
        process: function() { }
    };
});
