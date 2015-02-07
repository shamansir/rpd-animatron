function S(type) {
    return function(v) { return makeSpread(v, type) };
};
function stringify(v) { return v.toString(); };

// spread types
var NUMBERS = 'number',
    POINTS = 'point',
    COLORS = 'color',
    ELEMENTS = 'element';

Rpd.channeltype('anm/numbers',   { adapt: S(NUMBERS),  show: stringify });
Rpd.channeltype('anm/points',    { adapt: S(POINTS),   show: stringify });
Rpd.channeltype('anm/colors',    { adapt: S(COLORS),   show: stringify });
Rpd.channeltype('anm/elements',  { adapt: S(ELEMENTS), show: stringify });

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

Rpd.nodetype('anm/linear-spread', {
    name: 'spread',
    inlets: {
        'min':   { type: 'core/number', default: 0 },
        'max':   { type: 'core/number', default: 500 },
        'count': { type: 'core/number', default: 5 }
    },
    outlets: {
        'number': { type: 'anm/numbers' }
    },
    process: function(inlets) {
        var target = [];
        var min = (inlets.min || 0),
            max = (inlets.max || 0),
            count = (inlets.count || 1);
        var step = (max - min) / (count - 1);
        for (var v = min; v <= max; v += step) { target.push(v); }
        return { 'number': makeSpread(target, NUMBERS) };
    }
});

Rpd.nodetype('anm/point', {
    name: 'point',
    inlets: {
        'x': { type: 'anm/numbers' },
        'y': { type: 'anm/numbers' }
    },
    outlets: {
        'point': { type: 'anm/points' }
    }
});

Rpd.nodetype('anm/rect', {
    name: 'rect',
    inlets: {
        'point': { type: 'anm/points' },
        'color': { type: 'anm/colors' },
        'size':  { type: 'anm/points' } // FIXME
    },
    outlets: {
        'rect': { type: 'anm/elements' }
    }
});

Rpd.nodetype('anm/render', function() {
    var element;
    return {
        name: 'render',
        inlets: {
            'what': { type: 'anm/elements',  default: 0 },
        },
        process: function(inlets) {
            if (!element) {
                element = new anm.Element();
                element.rect(0, 0, 20, 20);
            }
            element.x = inlets.x;
            element.y = inlets.y;
            element.fill(inlets.color);
            return { 'element': element };
        }
    };
});
