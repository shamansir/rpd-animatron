function makeSpread(v, type) {
    if (!isDefined(v)) return new Spread([ ], type);
    if (v instanceof Spread) return v;
    if (!Array.isArray(v)) return new Spread([ v ], type);
    return new Spread(v, type);
}

function Spread(array, type) {
    this.value = array;
    this.type = type || 'something';
}
Spread.prototype.toString = function() {
    var len = this.value.length;
    if (!len) return '[nothing]';
    if (len === 1) return '[' + this.type + ']';
    return '[' + len + ' ' + this.type + 's]';
}
Spread.prototype.map = function(f) {
    var trg = [];
    for (var i = 0, il = this.value.length; i < il; i++) {
        trg.push(f(this.value[i], i));
    }
    return new Spread(trg, this.type);
}
Spread.prototype.tap = function(f) {
    for (var i = 0, il = this.value.length; i < il; i++) {
        f(this.value[i], i);
    }
}
Spread.prototype.merge = function(other, f) {
    var trg = [];
    var other = makeSpread(other, this.type);
    this.tap(function(val) {
        other.tap(function(ival) {
            trg.push(f ? f(val, ival) : [ val, ival ]);
        });
    });
    return new Spread(trg, this.type);
}
Spread.prototype.combine = function(other, f) {
    var trg = [], sub;
    var other = makeSpread(other, this.type);
    this.tap(function(val) {
        sub = [];
        other.tap(function(ival) {
            sub.push(f ? f(val, ival) : [ val, ival ]);
        });
        trg.push(sub);
    });
    return new Spread(trg, this.type);
}

function isDefined(v) {
    return (typeof v !== 'undefined') && (v !== null);
}
