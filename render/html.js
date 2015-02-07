Rpd.noderenderer('anm/color', 'html', function() {
    var colorsElm;
    return {
        first: function(bodyElm) {
            colorsElm = document.createElement('div');
            bodyElm.appendChild(colorsElm);
        },
        always: function(bodyElm, inlets, outlets) {
            clearNode(colorsElm);
            var colorElm;
            outlets.color.tap(function(color) {
                colorElm = document.createElement('span');
                colorElm.style.backgroundColor = color;
                colorsElm.appendChild(colorElm);
            });
        }
    };
});

Rpd.noderenderer('anm/linear-spread', 'html', {
    always: function(bodyElm, inlets, outlets) {
        clearNode(bodyElm);
        if (outlets.number.length() === 0) {
            bodyElm.innerText = bodyElm.textContent = '-';
        } else {
            var numElm;
            outlets.number.tap(function(num) {
                numElm = document.createElement('span');
                numElm.innerText = numElm.textContent = num.toFixed(3);
                bodyElm.appendChild(numElm);
            });
        }
    }
});

/* Rpd.noderenderer('anm/element', 'html', function() {
    var player;
    return {
        first: function(bodyElm) {
            var trg = document.createElement('div');
            bodyElm.appendChild(trg);
            player = anm.createPlayer(trg, {
                width: 100,
                height: 100,
                controlsEnabled: false,
                repeat: true
            });
        },
        always: function(bodyElm, inlets, outlets) {
            if (!outlets.element) return;
            player.stop();
            player.load(outlets.element);
            player.play();
            //colorElm.style.backgroundColor = outlets.color;
        }
    };
}); */


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
