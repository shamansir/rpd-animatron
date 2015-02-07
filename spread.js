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

function isDefined(v) {
    return (typeof v !== 'undefined') && (v !== null);
}
