window.TextureProgram = function() {

    // global "class" to be injected
    var Sphere;

    // core variables
    var canvas,
        gl,
        program;

    // shader related variables
    var modelViewMatrix,
        modelViewMatrixLoc,
        projectionMatrix,
        projectionMatrixLoc,
        thetaLoc;

    // projection & view related variables
    var near = 0.1,
        far = 30,
        eye = vec3(5, 3, 5),
        at = vec3(0, 0, 0),
        up = vec3(0.0, 1.0, 0.0);


    // texturing variables
    var textureEarth,
        textureCheckerboard,
        imageEarth,
        currentTexture;

    // procedural variables variables
    var theta = [0, 0, 0],
        autoRotate = true,
        textureSize = 256;

    function render() {

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var object = Sphere.get();

        modelViewMatrix = lookAt(eye, at , up);

        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        // vertex position

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(object.arrays.vertices), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        // texture

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, currentTexture);
        var textureSampler = gl.getUniformLocation(program, "texture");
        gl.uniform1i(textureSampler, 0);

        var tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(object.arrays.texture), gl.STATIC_DRAW);

        var vTexCoord = gl.getAttribLocation(program, "aTextureCoord");
        gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vTexCoord);

        modelViewMatrix = mult(modelViewMatrix, object.matrix);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

        if (autoRotate) {
            theta[1] += 0.05;
        }

        gl.uniform3fv(thetaLoc, flatten(theta));

        gl.drawArrays(gl.TRIANGLES, 0, object.arrays.vertices.length);
        requestAnimFrame(render);
    }

    function initCheckerboardTexture() {

        textureCheckerboard = gl.createTexture();

        var image = new Array();
        for (var i = 0; i < textureSize; i++) {
            image[i] = new Array();
        }

        for (var i = 0; i < textureSize; i++) {
            for (var j = 0; j < textureSize; j++)
                image[i][j] = new Float32Array(4);
        }

        for (var i = 0; i < textureSize; i++) {
            for (var j = 0; j < textureSize; j++) {
                var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
                image[i][j] = [c, c, c, 1];
            }
        }

        // Convert floats to ubytes for texture

        var checkerboard = new Uint8Array(4 * textureSize * textureSize);

        for (var i = 0; i < textureSize; i++) {
            for (var j = 0; j < textureSize; j++) {
                for (var k = 0; k < 4; k++) {
                    checkerboard[4 * textureSize * i + 4 * j + k] = 255 * image[i][j][k];
                }
            }
        }

        gl.bindTexture(gl.TEXTURE_2D, textureCheckerboard);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureSize, textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, checkerboard);
        gl.generateMipmap( gl.TEXTURE_2D );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        currentTexture = textureCheckerboard;

        render();
    }

    return {

        init: function(globalSphere) {

            if (globalSphere == undefined) {
                console.log("Shape not injected into Cad.");
                return false;
            } else {
                Sphere = globalSphere;
            }

            canvas = document.getElementById("gl-canvas");

            gl = WebGLUtils.setupWebGL(canvas, undefined);
            if (!gl) {
                alert("WebGL isn't available");
                return false;
            }

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0, 0, 0, 1.0);

            gl.enable(gl.DEPTH_TEST);

            program = initShaders(gl, "vertex-shader", "fragment-shader");
            gl.useProgram(program);

            modelViewMatrixLoc = gl.getUniformLocation(program, "mvMatrix");
            projectionMatrixLoc = gl.getUniformLocation(program, "pMatrix");
            thetaLoc = gl.getUniformLocation(program, "theta");

            projectionMatrix = perspective(45, canvas.width / canvas.height, near, far);

            // load image of the earth all the time
            textureEarth = gl.createTexture();
            imageEarth = new Image();
            imageEarth.onload = function() {

                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.bindTexture(gl.TEXTURE_2D, textureEarth);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageEarth);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                gl.generateMipmap(gl.TEXTURE_2D);

                render();
            };
            currentTexture = textureEarth;
            imageEarth.src = "img/earth.jpg";
        },

        rotateX: function(value) {
            autoRotate = false;
            theta[0] = Number(value);
        },

        rotateY: function(value) {
            autoRotate = false;
            theta[1] = Number(value);
        },

        rotateZ: function(value) {
            autoRotate = false;
            theta[2] = Number(value);
        },

        enableAutoRotate: function() {
            autoRotate = true;
        },

        changeTexture: function(texture) {

            if (texture == "checkerboard") {
                initCheckerboardTexture();
            } else {
                currentTexture = textureEarth;
                render();
            }
        }
    }
}();
