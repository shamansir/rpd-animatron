Spread.STOP = '_STOP_';

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
Spread.cross = function(spreads) {
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

function numSpread(a, b) {
    var min = Math.min(a, b),
        max = Math.max(a, b);
    return new Spread('num', function() {
        var value = min;
        return function() {
            if ((max - value) < 0) return Spread.STOP;
            return value++;
        };
    });
}


function Pair(a, b) {
    this.a = a || 0;
    this.b = b || 0;
}
Pair.prototype.toString = function() {
    return this.a.toFixed(1) + ' : ' + this.b.toFixed(1);
}

function isDefined(v) {
    return (typeof v !== 'undefined') && (v !== null);
}
