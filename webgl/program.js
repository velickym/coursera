"use strict";

function ang2rad(angle) {
    return angle * Math.PI / 180;
}

window.onload = function init() {

    var rangeTessalation = document.getElementById("tessalation"),
        labelTessalation = document.getElementById("tessalation-label"),
        rangeTwist = document.getElementById("twist"),
        labelTwist = document.getElementById("twist-label"),
        radiosShape = document.getElementsByClassName("shape"),
        radiosFill = document.getElementsByClassName("fill");

    var canvas = document.getElementById("gl-canvas");
    var gl = WebGLUtils.setupWebGL(canvas, undefined);

    if (!gl) { 
        alert( "WebGL isn't available" ); 
        return;
    }

    var points = [];
    var shapeSetup = {

        square: {

            divide: function (vertices, count, gasket) {

                var a = vertices[0];
                var b = vertices[1];
                var c = vertices[2];
                var d = vertices[3];

                if (count === 0) {
                    points.push(a, b, c);
                    points.push(a, c, d);
                } else {

                    var a1 = mix(c, a, 1 / 3);
                    var b1 = mix(d, b, 1 / 3);
                    var c1 = mix(a, c, 1 / 3);
                    var d1 = mix(b, d, 1 / 3);

                    --count;

                    this.divide([a, mix(b, a, 1 / 3), a1, mix(d, a, 1 / 3)], count, gasket);
                    this.divide([mix(b, a, 1 / 3), mix(b, a, 2 / 3), b1, a1], count, gasket);
                    this.divide([mix(b, a, 2 / 3), b, mix(c, b, 1 / 3), b1], count, gasket);
                    this.divide([mix(c, b, 1 / 3), mix(c, b, 2 / 3), c1, b1], count, gasket);
                    this.divide([c1, mix(c, b, 2 / 3), c, mix(d, c, 1 / 3)], count, gasket);
                    this.divide([d1, c1, mix(d, c, 1 / 3), mix(d, c, 2 / 3)], count, gasket);
                    this.divide([mix(d, a, 2 / 3), d1, mix(d, c, 2 / 3), d], count, gasket);
                    this.divide([mix(d, a, 1 / 3), a1, d1, mix(d, a, 2 / 3)], count, gasket);

                    if (!gasket) {
                        this.divide([a1, b1, c1, d1], count, gasket);
                    }
                }
            },

            vertices: [
                vec2(-0.5, 0.5),    // top left
                vec2(0.5, 0.5),     // top right
                vec2(0.5, -0.5),    // bottom right
                vec2(-0.5, -0.5)    // bottom left
            ],

            adjustRange: function(tessalation) {
                rangeTessalation.setAttribute("max", "4");
                if (tessalation > 4) {
                    return 4;
                }
                return tessalation;
            }

        },

        triangle: {

            divide: function (vertices, count, gasket) {

                var a = vertices[0];
                var b = vertices[1];
                var c = vertices[2];

                //this function is called recursively, hence check needed

                if (count === 0) {
                    points.push(a, b, c);
                } else {

                    //bisect the sides

                    var ab = mix(a, b, 0.5);
                    var ac = mix(a, c, 0.5);
                    var bc = mix(b, c, 0.5);

                    --count;

                    // divide three new triangles
                    this.divide([a, ab, ac], count, gasket);
                    this.divide([c, ac, bc], count, gasket);
                    this.divide([b, bc, ab], count, gasket);

                    if (!gasket) {
                        this.divide([ac, ab, bc], count, gasket);
                    }
                }
            },

            vertices: [
                vec2(-Math.cos(ang2rad(30)), -0.5),   // bottom left
                vec2(0, 1),                          // top middle
                vec2(Math.cos(ang2rad(30)), -0.5)     // bottom right
            ],

            adjustRange: function(tessalation) {
                rangeTessalation.setAttribute("max", "7");
                if (tessalation > 7) {
                    return 7;
                }
                return tessalation;
            }
        }
    };

    function update() {

        points = []; // reset points

        var tessalation = Number(rangeTessalation.value);
        var twist = Number(rangeTwist.value);
        var shape = "triangle";
        var fill = "gasket";

        for (var s = 0; s < radiosShape.length; s++) {
            if (radiosShape[s].checked) {
                shape = radiosShape[s].value;
                break;
            }
        }

        for (var f = 0; f < radiosFill.length; f++) {
            if (radiosFill[f].checked) {
                fill = radiosFill[f].value;
                break;
            }
        }

        var gasket = fill === "gasket";

        var objShape = shapeSetup[shape];
        var vertices = objShape.vertices;

        tessalation = objShape.adjustRange(tessalation);
        rangeTessalation.setAttribute("value", tessalation);
        objShape.divide(vertices, tessalation, gasket);

        if (twist > 0) {

            twist = ang2rad(twist);

            for (var i = 0; i < points.length; i++) {

                var point = points[i];
                var x = point[0];
                var y = point[1];

                var d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
                var xTwist = (x * Math.cos(d * twist)) - (y * Math.sin(d * twist));
                var yTwist = (x * Math.sin(d * twist)) + (y * Math.cos(d * twist));

                points[i] = vec2(xTwist, yTwist);
            }
        }

        // load buffer to GPU

        var bufferId = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

        // Associate out shader variables with our data buffer

        var vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );

        // clear & render
        gl.clear( gl.COLOR_BUFFER_BIT );
        if (fill === "mesh") {
            for (var i = 0; i < points.length; i += 3) {
                gl.drawArrays( gl.LINE_LOOP, i, 3 );
            }
        } else {
            gl.drawArrays( gl.TRIANGLES, 0, points.length );
        }
    }

    // assign handlers for HTML components

    rangeTessalation.addEventListener("input", function() {
        labelTessalation.innerHTML = rangeTessalation.value;
        update();
    });

    rangeTwist.addEventListener("input", function() {
        labelTwist.innerHTML = rangeTwist.value;
        update();
    });

    for (var s = 0; s < radiosShape.length; s++) {
        radiosShape[s].addEventListener("click", function() {


            var event; // The custom event that will be created

            if (document.createEvent) {
                event = document.createEvent("HTMLEvents");
                event.eventName = "change";
                event.initEvent("change", true, true);
                rangeTessalation.dispatchEvent(event);
            } else {
                event = document.createEventObject();
                event.eventName = "change";
                event.eventType = "change";
                rangeTessalation.fireEvent("on" + event.eventType, event);
            }

            update();
        });
    }

    for (var f = 0; f < radiosFill.length; f++) {
        radiosFill[f].addEventListener("click", update);
    }

    //  Configure WebGL
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);

    // call render for the first time 
    
    update();
};
