'use strict';
var App = function() {

    var MAX_SHAPES = 99999;
    var VERTICES_PER_SHAPE = 4;

    // webgl-related variables
    var gl,
        program,
        vBuffer,
        cBuffer,
        canvas;

    // settings (default values in HTML)
    var lineWidth,
        color;

    // program variables
    var drawnCount = 0,
        previousPoint;

    function applyColor() {
        var colors = [];
        for (var i = 0; i < VERTICES_PER_SHAPE; i++) {
            colors.push(color.r, color.g, color.b);
        }

        var colorOffset = sizeof.vec3 * VERTICES_PER_SHAPE * drawnCount;
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, colorOffset, flatten(colors));
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            // divided by 255 because RGB to GL colors
            return {
                r: parseInt(result[1], 16) / 255,
                g: parseInt(result[2], 16) / 255,
                b: parseInt(result[3], 16) / 255
            };
        } else {
            return false;
        }
    }

    function createVertex(x, y) {
        var scaledX = (2 * x) / canvas.width;
        x = -1 + scaledX;
        var scaledY = (2 * (canvas.height - y)) / canvas.height;
        y = -1 + scaledY;
        return vec2(x, y);
    }

    function createSegmentVertices(pointA, pointB) {

        var dx = pointB.x - pointA.x,
            dy = pointB.y - pointA.y,
            segmentAreaRatio = Math.sqrt(lineWidth * lineWidth / (dx * dx + dy * dy)),
            offsetX = segmentAreaRatio * -dy,
            offsetY = segmentAreaRatio * dx;

        var a = createVertex(pointA.x - offsetX, pointA.y - offsetY);
        var b = createVertex(pointA.x + offsetX, pointA.y + offsetY);
        var c = createVertex(pointB.x - offsetX, pointB.y - offsetY);
        var d = createVertex(pointB.x + offsetX, pointB.y + offsetY);

        return [a, b, c, d];
    }

    /*
        Each line segment (from point A to B) is drawn as a GL_TRIANGLE_STRIP in order to smooth the final curve
     */
    function drawLine(pointA, pointB) {

        var vertices = createSegmentVertices(pointA, pointB);

        var bufferOffset = (sizeof.vec2 * VERTICES_PER_SHAPE * drawnCount);
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, bufferOffset, flatten(vertices));

        applyColor();
        render();
        drawnCount++;
    }

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT );
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, drawnCount * VERTICES_PER_SHAPE);
    }

    function drawStart(e) {
        previousPoint = {x: e.offsetX, y: e.offsetY};
    }

    function drawContinue(e) {
        if (previousPoint == null) return;
        var currentPoint = {x: e.offsetX, y: e.offsetY};
        drawLine(previousPoint, currentPoint);
        previousPoint = currentPoint;
    }

    function drawStop(e) {
        var currentPoint = {x: e.offsetX, y: e.offsetY};
        drawLine(previousPoint, currentPoint);
        previousPoint = null;
    }

    function initBufferSize() {
        var sizeOfVertex = sizeof.vec2;
        var sizeOfLine = sizeOfVertex * 2;
        return sizeOfLine * MAX_SHAPES;
    }

    return {

        init: function() {

            // Setup canvas
            canvas = document.getElementById('gl-canvas');
            gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer: true} );
            if (!gl) {
                alert("WebGL is not available");
                return;
            }

            // Bind settings
            var elementColor = document.getElementById("color");
            var elementLineWidth = document.getElementById("line-width");

            function updateSettings() {
                color = hexToRgb(elementColor.value);
                lineWidth = Number(elementLineWidth.value);
            }

            elementColor.addEventListener("change", updateSettings);
            elementLineWidth.addEventListener("change", updateSettings);

            updateSettings(); // initialise settings for first time

            // Register canvas event handlers
            canvas.addEventListener('mousedown', drawStart);
            canvas.addEventListener('mousemove', drawContinue);
            canvas.addEventListener('mouseup', drawStop);

            // Configure WebGL
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(1.0, 1.0, 1.0, 1.0);

            // Load shaders
            program = initShaders(gl, 'vertex-shader', 'fragment-shader');
            gl.useProgram(program);

            // Initialise vertex buffer
            vBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, initBufferSize(), gl.STATIC_DRAW);

            // Associate vertex shader variables with vertex data buffer
            var vPosition = gl.getAttribLocation(program, 'vPosition');
            gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vPosition);

            // Initialise color buffer
            cBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, initBufferSize(), gl.STATIC_DRAW);

            // Associate fragment shader variables with color data buffer
            var vColor = gl.getAttribLocation(program, 'vColor');
            gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vColor);
        }
    };
}();

window.onload = function() {
    App.init();
};