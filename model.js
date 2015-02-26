// Spread

function Spread(type, iter_fn) {
    this.type = type;
    this.rule = function(signal) {
        var iter = iter_fn();
        if (signal) {
            return signal.map(function() { return iter(); })
                         .takeWhile(function(v) { return (v !== Spread.STOP); });

        } else {
            return Kefir.fromBinder(function(emitter) {
                var v;
                while ((v = iter()) !== Spread.STOP) { emitter.emit(v); }
                emitter.end();
            });
        }
    };
}
Spread.prototype.iter = function(signal) {
    return this.rule(signal);
}
Spread.prototype.empty = function() {
    return this.is(Spread.EMPTY);
}
Spread.prototype.is = function(type) {
    return this.type === type;
}
Spread.prototype.toString = function() {
    return '[' + this.type + ']';
}
Spread.is = function(val, type) {
    if (!val) return false;
    if (!(val instanceof Spread)) return false;
    return val.is(type);
}
Spread.zip = function(spreads, res_type, map_fn) {
    return new Spread(res_type, function(signal) {
        var trg = [];
        var finished = [];
        var signal = signal || Kefir.emitter();
        for (var i = 0; i < spreads.length; i++) {
            if (!spreads[i] || spreads[i].empty()) return function() { return Spread.STOP; };
            trg.push(Kefir.repeat((function(i) {
                return function(cycle) {
                    if (cycle === 1) finished.push(i);
                    if (cycle > Spread.MAX_REPEATS) throw new Error('Probably you\'re in infinite loop, set Spread.MAX_REPEATS to Inifinity if you are not.');
                    return spreads[i].iter((cycle > 0) ? signal.toProperty(undefined) : signal);
                }
            })(i)));
        };
        var zipped = Kefir.zip(trg).takeWhile(function() {
            return (finished.length < spreads.length);
        });
        var stream_finished = false;
        var last_val;
        if (map_fn) {
            zipped = zipped.map(function(vals) { return map_fn.apply(null, vals); });
        };
        zipped.onValue(function(v) { last_val = v; })
              .onEnd(function() { stream_finished = true; });
        return function() {
            signal.emit();
            if (stream_finished) return Spread.STOP;
            return last_val;
        }
    });
}
Spread.adapt = function(v, type) {
    if (!v) return Spread.empty();
    if (Array.isArray(v)) return Spread.fromArray(v, type);
    if (!(v instanceof Spread)) return Spread.fromValue(v, type);
    return v;
}
Spread.empty = function() {
    return new Spread(Spread.EMPTY, function() {
        return function() {
            return Spread.STOP;
        };
    })
}
Spread.fromValue = function(val, type) {
    return new Spread(type, function() {
        var done = false;
        return function() {
            if (done) return Spread.STOP;
            done = true;
            return val;
        }
    });
}
Spread.fromArray = function(arr, type) {
    return new Spread(type, function() {
        var i = 0, len = arr.length;
        return function() {
            if (i < arr.length) return arr[i++];
            return Spread.STOP;
        };
    });
}

Spread.MAX_REPEATS = 1000;

Spread.STOP = '_STOP_';

Spread.EMPTY = 'Empty';
Spread.UNKNOWN = 'Empty';

Spread.NUMBERS = 'Numbers';
Spread.PAIRS = 'Pairs';
Spread.COLORS = 'Colors';
Spread.ELEMENTS = 'Elements';

// Implementations

function minMaxSpread(a, b, count) {
    var min = Math.min(a, b) || 0,
        max = Math.max(a, b) || 0;
    var count = (count > 1) ? count : 1;
    return new Spread(Spread.NUMBERS, function() {
        if (min !== max) {
            var step = (max - min) / (count - 1);
            var value = min;
            var done = 0;
            return function() {
                if (done < count) {
                    var current = value;
                    value += step; done++;
                    return current;
                }
                return Spread.STOP;
            };
        } else {
            var to_do = count;
            return function() {
                if (!to_do) return Spread.STOP;
                to_do--; return min;
            }
        }
    });
}

// Pair

function Pair(a, b) {
    this.a = a || 0;
    this.b = b || 0;
}
