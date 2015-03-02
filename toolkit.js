function S(type) {
    return function(v) {
        return Spread.adapt(v, type);
    };
}
function stringify(v) { return v.toString(); };
function accept(type) { return function(v) { return Spread.is(v, type); } };

var NUMBERS = Spread.NUMBERS,
    VECTORS = Spread.VECTORS,
    COLORS = Spread.COLORS,
    ELEMENTS = Spread.ELEMENTS;

Rpd.channeltype('anm/numbers',   { adapt: S(NUMBERS),  show: stringify });
Rpd.channeltype('anm/vectors',   { adapt: S(VECTORS),  show: stringify, accept: accept(VECTORS)  });
Rpd.channeltype('anm/colors',    { adapt: S(COLORS),   show: stringify, accept: accept(COLORS)   });
Rpd.channeltype('anm/elements',  { adapt: S(ELEMENTS), show: stringify, accept: accept(ELEMENTS) });
Rpd.channeltype('anm/shapetype');

Rpd.nodetype('anm/spread', {
    name: 'spread',
    inlets: {
        'min':   { type: 'core/number', default: 0 },
        'max':   { type: 'core/number', default: 100 },
        'count': { type: 'core/number', default: 5 }
    },
    outlets: {
        'spread': { type: 'anm/numbers' }
    },
    process: function(inlets) {
        return {
            'spread': minMaxSpread(inlets.min, inlets.max, inlets.count)
        };
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
            Spread.zip([ inlets.red, inlets.green, inlets.blue, inlets.alpha ], COLORS,
                         function(r, g, b, a) {
                             return 'rgba(' + (r ? Math.round(r) : 0) + ',' +
                                              (g ? Math.round(g) : 0) + ',' +
                                              (b ? Math.round(b) : 0) + ',' +
                                              (a || 0) + ')';
                         })
        };
    }
});

Rpd.nodetype('anm/vector', {
    name: 'vector',
    inlets: {
        'x': { type: 'anm/numbers', default: 0 },
        'y': { type: 'anm/numbers', default: 0 }
    },
    outlets: {
        'vector': { type: 'anm/vectors' }
    },
    process: function(inlets) {
        return { 'vector':
            Spread.zip([ inlets.x, inlets.y ], VECTORS,
                         function(x, y) {
                            return new Vector(x, y);
                         })
        };
    }
});

Rpd.nodetype('anm/primitive', {
    name: 'primitive',
    inlets: {
        'pos':    { type: 'anm/vectors', default: Spread.of(new Vector(0, 0),    VECTORS) },
        'color':  { type: 'anm/colors',  default: Spread.of('rgba(255,60,60,1)', COLORS) },
        //'stroke': { type: 'anm/colors', default: 'transparent'    },
        'size':   { type: 'anm/vectors', default: Spread.of(new Vector(15, 15),  VECTORS) },
        'type':   { type: 'anm/shapetype', default: 'rect', hidden: true }
    },
    outlets: {
        'shape': { type: 'anm/elements' }
    },
    process: function(inlets) {
        if (!inlets.type) return;
        return { 'shape':
            Spread.zip([ inlets.pos, inlets.color, inlets.size ], ELEMENTS,
                         function(pos, color, size) {
                            return function() {
                                var elm = new anm.Element();
                                elm.move(pos.x, pos.y);
                                switch (inlets.type) {
                                    case 'dot':  elm.dot(0, 0); break;
                                    case 'rect': elm.rect(0, 0, size.x, size.y); break;
                                    case 'oval': elm.oval(0, 0, size.x, size.y); break;
                                    case 'triangle': elm.triangle(0, 0, size.x, size.y); break;
                                }
                                elm.fill(color);
                                return elm;
                            }
                         })
        };
    }
});

Rpd.nodetype('anm/cross', {
    name: 'cross',
    inlets: {
        'parent': { type: 'anm/elements' },
        'child':  { type: 'anm/elements' }
    },
    outlets: {
        'parent': { type: 'anm/elements' }
    },
    process: function(inlets) {
        return { 'parent':
            Spread.merge([ inlets.parent, inlets.child ], ELEMENTS,
                         function(parent, child) {
                            if (!parent || !child) return (parent || child);
                            if (parent === child) return;
                            return parent.add(child);
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
