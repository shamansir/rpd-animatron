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
Spread.zip = function(spreads) {
    var trg = [];
    var finished = [];
    var signal = Kefir.emitter();
    for (var i = 0; i < spreads.length; i++) {
        trg.push(Kefir.repeat((function(i) {
            return function(cycle) {
                if (cycle === 1) finished.push(i);
                return spreads[i].iter((cycle > 0) ? signal.toProperty(undefined) : signal);
            }
        })(i)));
    };
    var zipped = Kefir.zip(trg).takeWhile(function() {
        return (finished.length < spreads.length);
    });
    return function(fn_res, fn_sig) {
        var stream_finished = false;
        zipped.onEnd(function() { stream_finished = true; });
        if (fn_res) zipped = fn_res(zipped);
        if (fn_sig) signal = fn_sig(signal);
        if (!zipped || !signal) return;
        while (!stream_finished) signal.emit();
    }
}

Spread.STOP = '_STOP_';

Spread.EMPTY = 'Empty';
Spread.ARRAY = 'Array';
Spread.NUMBERS = 'Numbers';
Spread.PAIRS = 'Pairs';
Spread.COLORS = 'Colors';
Spread.ELEMENTS = 'Elements';

function emptySpread() {
    return new Spread(Spread.EMPTY, function() {
        return function() {
            return Spread.STOP;
        };
    })
}

function oneNumSpread(val) {
    return new Spread(Spread.NUMBERS, function() {
        var done = false;
        return function() {
            if (done) return Spread.STOP;
            done = true;
            return val;
        }
    });
}

function minMaxSpread(a, b, count) {
    var min = Math.min(a, b) || 0,
        max = Math.max(a, b) || 0;
    return new Spread(Spread.NUMBERS, function() {
        if (min !== max) {
            var step = (max - min) / (count - 1);
            var value = min;
            return function() {
                if (value > max) return Spread.STOP;
                var current = value;
                value += step;
                return current;
            };
        } else {
            return function() {
                if (!count) return Spread.STOP;
                count--; return min;
            }
        }
    });
}

function arrSpread(arr) {
    return new Spread(Spread.ARRAY, function() {
        var i = 0, len = arr.length;
        return function() {
            if (i < arr.length) return arr[i++];
            return Spread.STOP;
        };
    });
}

function Pair(a, b) {
    this.a = a || 0;
    this.b = b || 0;
}

function isDefined(v) {
    return (typeof v !== 'undefined') && (v !== null);
}
