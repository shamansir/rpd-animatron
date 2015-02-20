function makeSpread(v, type) {
    if (!isDefined(v)) return Spread.empty(type);
    if (v instanceof Spread) return v;
    if (!Array.isArray(v)) return new Spread([ v ], type);
    return new Spread(v, type);
}

function Spread(array, type) {
    this.value = array;
    this.type = type || 'something';
}
Spread.prototype.get = function(i) {
    return this.value[i];
}
Spread.prototype.length = function() {
    return this.value.length;
}
Spread.prototype.empty = function() {
    return this.value.length === 0;
}
Spread.prototype.map = function(f) {
    return new Spread(this.value.map(f), this.type);
}
Spread.prototype.tap = function(f) {
    this.value.forEach(f);
}
Spread.prototype.reduce = function(f) {
    return new Spread([ this.value.reduce(f) ], this.type);
}
Spread.prototype.merge = function(other, f) {
    return Spread.merge([ this, other ], this.type, f);
}
Spread.prototype.cross = function(other, f) {
    var target = [];
    var other = makeSpread(other, this.type);
    var outer = (other.length() > this.length()) ? other : this;
        inner = (other.length() > this.length()) ? this : other;
    outer.tap(function(val) {
        inner.tap(function(ival) {
            target.push(f ? f(val, ival) : [ val, ival ]);
        });
    });
    return new Spread(target, this.type);
}
Spread.prototype.toString = function() {
    var len = this.length();
    if (!len) return '-';
    if (len === 1) return this.value[0];
    return '[' + len + ' ' + this.type + 's]';
}

Spread.empty = function(type) {
    return new Spread([], type);
}
Spread.findLongest = function(spreads) {
    var longest;
    spreads.forEach(function(spread) {
        if (!longest || (spread && (spread.length() > longest.length()))) {
            longest = spread;
        }
    });
    return longest;
}
Spread.merge = function(spreads, type, f) {
    if (!spreads.length) return Spread.empty(type);
    var longest = Spread.findLongest(spreads);
    if (!longest) return Spread.empty(type);
    var target = [], values;
    longest.tap(function(_, val_idx) {
        values = [];
        spreads.forEach(function(spread) {
            if (spread) {
                values.push(spread.value[
                    (val_idx < spread.length()) ? val_idx
                                                : (val_idx % spread.length())
                ]);
            } else { values.push(null); }
        });
        target.push(values);
    });
    if (f) { target = target.map(function(v) { return f.apply(null, v); }); };
    return new Spread(target, type);
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





/* function spread(fn) {
    return Kefir.fromBinder(fn());
}

function numericSpread(min, max, count) {

}

function sigNumericSpread(signal, min, max, count) {

}

function rgbaColorSpread(red, blue, green, alpha) {

}

function hslaColorSpread(red, blue, green, alpha) {

}

function pairSpread(first, second) {

}

function elementSpread(nextElement) {

}

var s = new Spread(function() {
    var count = 5;
    return function(values) {
        while (count--) {
            values.emit(count);
        }
        values.end();
    };
});

function isDefined(v) {
    return (typeof v !== 'undefined') && (v !== null);
}

s.get().map(function(v) { return 1 / v; }).log('first');
s.get().log('second');



*/

/*
function repeat(fn, onCycle) {
  return Kefir.fromBinder(function(sink) {
    var stream, valHandler, endHandler, cycle = 0;
    function sub() {
        valHandler = function(v) { sink.emit(v); };
        endHandler = function() {
            if (onCycle && !onCycle(cycle++)) return;
            sub();
        };
        stream = fn();
        stream.onValue(valHandler).onEnd(endHandler);
    }
    sub();
    return function() {
      stream.offValue(valHandler).offEnd(endHandler);
    };
  });
}


function Spread(type, fn) {
    this.type = type;
    this.fn = fn;
}

nextFn

Spread.prototype.iter = function() {
    return Kefir.fromBinder(this.fn());
}

function numericSpread(min, max, count) {
    return new Spread('num', function() {
        var step = (max - min) / (count - 1);
        return (function(count) { return function(values) {
            var nextVal = min;
            while (count--) {
                values.emit(nextVal);
                nextVal += step;
            }
            values.end();
        } })(count);
    });
}

function sigNumericSpread(signal, min, max, count) {

}

function rgbaColorSpread(red, green, blue, alpha) {
    return repeat(function() { return red.iter(); },
                  function(cycle) { return (cycle < 7); });
    // return Kefir.zip([ repeat(red),
    //                   repeat(green),
    //                   repeat(blue),
    //                   repeat(alpha) ]);
}

function hslaColorSpread(red, green, blue, alpha) {

}

function pairSpread(first, second) {

}

function elementSpread(nextElement) {

}

function isDefined(v) {
    return (typeof v !== 'undefined') && (v !== null);
}

numericSpread(0, 20, 5).iter().log();

numericSpread(10, 100, 3).iter().log();

rgbaColorSpread(numericSpread(0, 255, 5), numericSpread(0, 255, 10), numericSpread(0, 100, 3), numericSpread(0, 1, 8)).log();
*/

/* function numIter(max) {
    return function(signal) {
        if (signal) {
            var value = 0;
            return signal.map(function() { return value++; })
                         .takeWhile(function(val) { return val < max;  });
        } else {
            return Kefir.fromBinder(function(emitter) {
                var value = 0;
                while (value < max) emitter.emit(value++);
                emitter.end();
            });
        }
    }
}

function joinIters(arr) {
    var trg = [];
    var signal = Kefir.emitter();
    var finished = [];
    for (var i = 0; i < arr.length; i++) {
        trg.push(arr[i](signal).repeat((function(i) {
            return function(cycle) {
                if (cycle == 1) finished.push(i);
                return arr[i](signal);
            }
        })(i)));
    };
    return Kefir.zip(trg).takeWhile(function() {
        return finished.length < arr.length;
    });
}

var e = Kefir.emitter();
Kefir.repeat(function(i) {
    if (i > 3) return;
    return numIter(5)(e);
}).log();
e.emit();
e.emit();
e.emit();
e.emit();
e.emit();
e.emit();
e.emit();
e.emit();
e.emit();
e.emit();
e.emit();
e.emit();
e.emit();
e.emit();
e.emit();
e.emit();

joinIters([ ]) */
