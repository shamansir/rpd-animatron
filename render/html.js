Rpd.noderenderer('anm/color', 'html',
    renderSpread('color', function(elm, color) {
        elm.style.backgroundColor = color;
    })
);

Rpd.noderenderer('anm/spread', 'html',
    renderSpread('number', function(elm, num) {
        elm.innerText = elm.textContent = num.toFixed(3);
    })
);

Rpd.noderenderer('anm/pair', 'html',
    renderSpread('pair', function(elm, pair) {
        elm.innerText = elm.textContent = pair.toString();
    })
);

function renderSpread(prop, f) {
    return function() {
        var holder;
        return {
            first: function(bodyElm) {
                holder = document.createElement('div');
                bodyElm.appendChild(holder);
            },
            always: function(bodyElm, inlets, outlets) {
                clearNode(holder);
                if (outlets[prop].length() === 0) {
                    holder.innerText = holder.textContent = '-';
                } else {
                    var itemElm;
                    outlets[prop].tap(function(item) {
                        itemElm = document.createElement('span');
                        f(itemElm, item);
                        holder.appendChild(itemElm);
                    });
                }
            }
        }
    };
}

Rpd.noderenderer('anm/render', 'html', function() {
    var player;
    return {
        first: function(bodyElm) {
            var trg = document.createElement('div');
            bodyElm.appendChild(trg);
            player = anm.createPlayer(trg, {
                width: 140,
                height: 140,
                controlsEnabled: false,
                repeat: true
            });
        },
        always: function(bodyElm, inlets, outlets) {
            if (!inlets.what || inlets.what.empty()) return;
            player.stop();
            var root = new anm.Element();
            inlets.what.tap(function(element) {
                root.add(element);
            });
            player.load(root);
            player.play();
        }
    };
});


Rpd.channelrenderer('anm/colors', 'html', {
    show: function(target, value, repr) {
        if (value.length() == 1) {
            target.classList.add('rpd-anm-one-color');
            target.style.backgroundColor = value.get(0);
        } else {
            target.innerText = target.textContent = value.toString();
            target.style.backgroundColor = 'transparent';
            target.classList.remove('rpd-anm-one-color');
        }
    }
});

function clearNode(node) {
    while (node.firstChild) { node.removeChild(node.firstChild); }
}
