"use strict";

function ang2rad(angle) {
    return angle * Math.PI / 180;
}

window.onload = function init() {

    var canvas = document.getElementById("gl-canvas");
    var gl = WebGLUtils.setupWebGL( canvas );

    if (!gl) { 
        alert( "WebGL isn't available" ); 
        return;
    }

    var points = [],
        rangeTessalation = document.getElementById("tessalation"),
        labelTessalation = document.getElementById("tessalation-label"),
        rangeTwist = document.getElementById("twist"),
        labelTwist = document.getElementById("twist-label"),
        checkboxGasket = document.getElementById("gasket"),
        radiosShape = document.getElementsByClassName("radio");

    function divideTriangle( a, b, c, count, gasket) {
        // check for end of recursion

        if ( count === 0 ) {
            points.push( a, b, c );
        } else {

            //bisect the sides

            var ab = mix( a, b, 0.5 );
            var ac = mix( a, c, 0.5 );
            var bc = mix( b, c, 0.5 );

            --count;

            // three new triangles

            divideTriangle(a, ab, ac, count, gasket);
            divideTriangle(c, ac, bc, count, gasket);
            divideTriangle(b, bc, ab, count, gasket);

            if (gasket) {
                divideTriangle(ac, ab, bc, count, gasket);
            }
        }
    }

    function divideSquare(a, b, c, d, count, gasket) {

        if (count === 0) {
            points.push(a, b, c);
            points.push(a, c, d);
        } else {

            // var center = mix(a, c, 0.5);

            // var a1 = mix( c, a, 1/3);
            // var b1 = mix( d, b, 1/3);
            // var c1 = mix( a, c, 1/3);
            // var d1 = mix( b, d, 1/3);

            // var ab = mix( a, b, 0.5 );
            // var bc = mix( b, c, 0.5 );
            // var cd = mix( c, d, 0.5 );
            // var ad = mix( a, d, 0.5 );

            var ab = mix( a, b, 0.5 );
            var bc = mix( b, c, 0.5 );
            var cd = mix( c, d, 0.5 );
            var da = mix( d, a, 0.5 );
            var md = mix( ab, cd, 0.5 );

            --count;
            
            divideSquare( a, ab, md, da, 0, count);
            divideSquare( ab, b, bc, md, 1, count);
            divideSquare( da, md, cd, d, 2, count);
            divideSquare( md, bc, c, cd, 3, count);

            if (gasket) {
                divideSquare(a1, b1, c1, d1, count, gasket);
            }
        }
    }

    function getVerticesBy(shape) {

        if (shape == "square") {
            return [
                vec2(-0.5, 0.5),    // top left
                vec2(0.5, 0.5),     // top right
                vec2(0.5, -0.5),    // bottom right 
                vec2(-0.5, -0.5)    // bottom left
            ];
        } else {
            return [
                vec2( -Math.cos(ang2rad(30)), -0.5 ),   // bottom left
                vec2( 0,  1 ),                          // top middle
                vec2( Math.cos(ang2rad(30)), -0.5 )     // bottom right
            ];
        }
    }

    function update() {

        points = [];

        var tessalation = Number(rangeTessalation.value);
        var twist = Number(rangeTwist.value);
        var gasket = !checkboxGasket.checked;
        var shape = "triangle";

        for (var s = 0; s < radiosShape.length; s++) {
            if (radiosShape[s].checked) {
                shape = radiosShape[s].value;
                break;
            }
        }

        var vertices = getVerticesBy(shape);

        if (shape == "triangle") {
            divideTriangle(vertices[0], vertices[1], vertices[2], tessalation, gasket);    
        } else {
            divideSquare(vertices[0], vertices[1], vertices[2], vertices[3], tessalation, gasket);
        }

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
        gl.drawArrays( gl.TRIANGLES, 0, points.length );        
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

    checkboxGasket.addEventListener("click", update);

    for (var s = 0; s < radiosShape.length; s++) {
        radiosShape[s].addEventListener("click", update);    
    }

    //  Configure WebGL
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // call render for the first time 
    
    update();
};
