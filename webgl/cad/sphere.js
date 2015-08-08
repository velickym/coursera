
var canvas;
var gl;

var pointsArray = [];
var colors = [];

var near = 0.1;
var far = 20;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var fill = "mesh";

var GREEN_COLOR = [ 0.0, 1.0, 0.0, 1.0 ];
var BLUE_COLOR = [ 0.0, 0.0, 1.0, 1.0 ];

function triangle(a, b, c, color) {
    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);

    colors.push(color);
    colors.push(color);
    colors.push(color);
}

function createSphere() {

    var latitudeBands = 30;
    var longitudeBands = 30;
    var radius = 2;

    var grid = [];

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

            if (lat > 0 && long > 0) {

                var previousLatVertex = grid[lat - 1][long];
                var previousLongVertex = row[long - 1];
                var diagonalVertex = grid[lat - 1][long - 1];

                triangle(diagonalVertex, previousLongVertex, previousLatVertex, GREEN_COLOR);
                triangle(previousLongVertex, currentVertex, previousLatVertex, BLUE_COLOR);
            }

            row[long] = currentVertex;
        }

        grid[lat] = row;
    }
}

function createCube() {

    var a = vec4(-0.5, -0.5,  0.5, 1.0),
        b = vec4(-0.5,  0.5,  0.5, 1.0),
        c = vec4( 0.5,  0.5,  0.5, 1.0),
        d = vec4( 0.5, -0.5,  0.5, 1.0),
        e = vec4(-0.5, -0.5, -0.5, 1.0),
        f = vec4(-0.5,  0.5, -0.5, 1.0),
        g = vec4( 0.5,  0.5, -0.5, 1.0),
        h = vec4( 0.5, -0.5, -0.5, 1.0);

    triangle(a, b, c, GREEN_COLOR);
    triangle(a, c, d, BLUE_COLOR);

    triangle(e, f, b, GREEN_COLOR);
    triangle(e, b, a, BLUE_COLOR);

    triangle(e, f, g, GREEN_COLOR);
    triangle(e, g, h, BLUE_COLOR);

    triangle(d, c, g, GREEN_COLOR);
    triangle(d, g, h, BLUE_COLOR);

    triangle(b, f, g, BLUE_COLOR);
    triangle(b, g, c, GREEN_COLOR);

    triangle(a, h, e, BLUE_COLOR);
    triangle(a, e, d, GREEN_COLOR);
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    //createSphere();
    createCube();

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    modelViewMatrixLoc = gl.getUniformLocation( program, "mvMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "pMatrix" );

    render();
};

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var eye = vec3(0, 10, 0);
    var at = vec3(5, 5, 5);
    var up = vec3(0.0, 1.0, 0.0);

    modelViewMatrix = lookAt(eye, at , up);

    var t = translate(5, 5, 5);

    modelViewMatrix = mult(modelViewMatrix, t);

    projectionMatrix = perspective(45, canvas.width / canvas.height, near, far);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    // clear & render
    gl.clear( gl.COLOR_BUFFER_BIT );
    if (fill === "mesh") {
        for (var i = 0; i < pointsArray.length; i += 3) {
            gl.drawArrays( gl.LINE_LOOP, i, 3 );
        }
    } else {
        gl.drawArrays( gl.TRIANGLES, 0, pointsArray.length );
    }
}

function renderObject() {

}