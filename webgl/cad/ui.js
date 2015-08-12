window.UI = function() {

    var transition = {};
    var rotation = {};
    var size = {};

    var divObjects = null;
    var divTransformations = null;
    var buttonAdd = null;
    var buttonPlace = null;
    var buttonCancel = null;

    function update() {

        var matrixTransition = translate(transition.x.value, transition.y.value, transition.z.value);

        var matrixRotation = mult(mat4(), rotateX(rotation.x.value));
        matrixRotation = mult(matrixRotation, rotateY(rotation.y.value));
        matrixRotation = mult(matrixRotation, rotateZ(rotation.z.value));

        var sizeRatio = size.ratio.value;
        var matrixScale = scalem(sizeRatio, sizeRatio, sizeRatio);

        Cad.update(matrixTransition, matrixRotation, matrixScale);
    }

    function reset() {

        [rotation, transition].forEach(function(transformation) {

            for (var axis in transformation) {
                var elementRange = transformation[axis];
                elementRange.value = 0;
                var label = document.getElementById("label-" + elementRange.id);
                label.innerHTML = 0;
            }
        });

        size.ratio.value = 1;
        document.getElementById("label-size").innerHTML = "1";

        divTransformations.style.display = "none";

        buttonAdd.disabled = false;
    }

    function addObjectButton(object) {

        var button = document.createElement("button");
        var imgTrash = '<img src="remove.png" class="remove" />';
        button.innerHTML = imgTrash + object.name;
        button.setAttribute("data-index", object.index);
        button.setAttribute("class", "object");
        button.addEventListener("click", function() {

            var index = Number(this.getAttribute("data-index"));
            Cad.removeObject(index);
            divObjects.removeChild(button);

            var buttons = document.getElementsByClassName("object");
            for (var b = 0; b < buttons.length; b++) {
                var buttonIndex = Number(buttons[b].getAttribute("data-index"));
                if (buttonIndex > index) {
                    buttons[b].setAttribute("data-index", buttonIndex - 1);
                }
            }
        });

        divObjects.appendChild(button);
    }

    return {
        
        init: function(Cad) {

            if (Cad == undefined) {
                return false;
            }

            divObjects = document.getElementById("objects");
            divTransformations = document.getElementById("transformations");

            transition.x = document.getElementById("transition-x");
            transition.y = document.getElementById("transition-y");
            transition.z = document.getElementById("transition-z");
            
            rotation.x = document.getElementById("rotation-x");
            rotation.y = document.getElementById("rotation-y");
            rotation.z = document.getElementById("rotation-z");

            size.ratio = document.getElementById("size");

            [rotation, transition, size].forEach(function(transformation) {

                for (var sub in transformation) {
                    var elementRange = transformation[sub];
                    elementRange.addEventListener("input", function() {

                        // update label
                        var label = document.getElementById("label-" + this.id);
                        label.innerHTML = this.value;

                        update();
                    });
                }
            });

            buttonAdd = document.getElementById("add");
            buttonAdd.addEventListener("click", function() {
                var shape = document.getElementById("shape").value
                Cad.prepareObject(shape);
                divTransformations.style.display = "block";
                this.disabled = true;
            });

            buttonPlace = document.getElementById("place");
            buttonPlace.addEventListener("click", function() {
                var object = Cad.commitObject();
                addObjectButton(object);
                reset();
            });

            buttonCancel = document.getElementById("cancel");
            buttonCancel.addEventListener("click", function() {
                Cad.discardPreparedObject();
                reset();
            });
        }
    }
}();