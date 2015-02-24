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
                var itemElm;
                outlets[prop].iter().onValue(function(item) {
                    itemElm = document.createElement('span');
                    f(itemElm, item);
                    holder.appendChild(itemElm);
                });
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
            if (!inlets.what) return;
            player.stop();
            if (player.anim) player.anim.unregister();
            var root = new anm.Element();
            inlets.what.iter().onValue(function(child) {
                if (!child) return;
                root.add(child);
            });
            player.load(root);
            player.play();
        }
    };
});


Rpd.channelrenderer('anm/colors', 'html', {
    show: function(target, value, repr) {
        /* if (value.length() == 1) {
            target.classList.add('rpd-anm-one-color');
            target.style.backgroundColor = value.get(0);
        } else { */
            target.innerText = target.textContent = value.toString();
            target.style.backgroundColor = 'transparent';
            target.classList.remove('rpd-anm-one-color');
        // }
    }
});

function clearNode(node) {
    while (node.firstChild) { node.removeChild(node.firstChild); }
}
