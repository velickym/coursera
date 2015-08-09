
var canvas;
var gl;

var program;
var objects = [];

var near = 0.1;
var far = 20;

var eye = vec3(0, 10, 0);
var at = vec3(5, 5, 5);
var up = vec3(0.0, 1.0, 0.0);

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var RED_COLOR = [ 1.0, 0.0, 0.0, 1.0 ];
var GREEN_COLOR = [ 0.0, 1.0, 0.0, 1.0 ];
var BLUE_COLOR = [ 0.0, 0.0, 1.0, 1.0 ];
var MAGENTA_COLOR = [ 1.0, 0.0, 1.0, 1.0 ];
var CYAN_COLOR = [ 0.0, 1.0, 1.0, 1.0 ];
var YELLOW_COLOR = [ 1.0, 1.0, 0.0, 1.0 ];

function triangle(a, b, c, color, vertices, colors) {
    vertices.push(a);
    vertices.push(b);
    vertices.push(c);

    colors.push(color);
    colors.push(color);
    colors.push(color);
}

function createSphere() {

    var latitudeBands = 30;
    var longitudeBands = 30;
    var radius = 1;

    var grid = [];
    var vertices = [];
    var colors = [];

    for (var lat = 0; lat <= latitudeBands; lat++) {

        var theta = lat * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        var row = [];

        for (var long = 0; long <= longitudeBands; long++) {

            var phi = long * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = radius * cosPhi * sinTheta;
            var y = radius * cosTheta;
            var z = radius * sinPhi * sinTheta;

            var currentVertex = vec4(x, y, z, 1.0);

            var color = lat % 2 == 0 && long % 2 == 0 ? GREEN_COLOR : BLUE_COLOR;

            if (lat > 0 && long > 0) {

                var previousLatVertex = grid[lat - 1][long];
                var previousLongVertex = row[long - 1];
                var diagonalVertex = grid[lat - 1][long - 1];

                triangle(diagonalVertex, previousLongVertex, previousLatVertex, color, vertices, colors);
                triangle(previousLongVertex, currentVertex, previousLatVertex, color, vertices, colors);
            }

            row[long] = currentVertex;
        }

        grid[lat] = row;
    }

    return {
        translation: translate(5, 5, 5),
        colors: colors,
        vertices: vertices
    }
}

function createCube() {

    var vertices = [];
    var colors = [];

    var a = vec4(-0.5, -0.5,  0.5, 1.0),
        b = vec4(-0.5,  0.5,  0.5, 1.0),
        c = vec4( 0.5,  0.5,  0.5, 1.0),
        d = vec4( 0.5, -0.5,  0.5, 1.0),
        e = vec4(-0.5, -0.5, -0.5, 1.0),
        f = vec4(-0.5,  0.5, -0.5, 1.0),
        g = vec4( 0.5,  0.5, -0.5, 1.0),
        h = vec4( 0.5, -0.5, -0.5, 1.0);

    triangle(a, b, c, RED_COLOR, vertices, colors);
    triangle(a, c, d, RED_COLOR, vertices, colors);

    triangle(e, f, b, GREEN_COLOR, vertices, colors);
    triangle(e, b, a, GREEN_COLOR, vertices, colors);

    triangle(e, f, g, BLUE_COLOR, vertices, colors);
    triangle(e, g, h, BLUE_COLOR, vertices, colors);

    triangle(d, c, g, CYAN_COLOR, vertices, colors);
    triangle(d, g, h, CYAN_COLOR, vertices, colors);

    triangle(b, f, g, YELLOW_COLOR, vertices, colors);
    triangle(b, g, c, YELLOW_COLOR, vertices, colors);

    triangle(a, h, e, MAGENTA_COLOR, vertices, colors);
    triangle(a, e, d, MAGENTA_COLOR, vertices, colors);

    return {
        translation: translate(9, 4, 4),
        colors: colors,
        vertices: vertices
    }
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    objects.push(createSphere());
    objects.push(createCube());

    modelViewMatrixLoc = gl.getUniformLocation( program, "mvMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "pMatrix" );

    render();
};

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    projectionMatrix = perspective(45, canvas.width / canvas.height, near, far);

    for (var o = 0; o < objects.length; o++) {

        var object = objects[o];

        modelViewMatrix = lookAt(eye, at , up);

        gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

        var vBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(object.vertices), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation( program, "vPosition");
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray( vPosition);

        var cBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(object.colors), gl.STATIC_DRAW );

        var vColor = gl.getAttribLocation( program, "vColor" );
        gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vColor );

        modelViewMatrix = mult(modelViewMatrix, object.translation);
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );

        gl.drawArrays( gl.TRIANGLES, 0, object.vertices.length );
    }
}
