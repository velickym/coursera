window.Cad = function() {

    // global "class" to be injected
    var Shape = null;

    // core variables
    var canvas,
        gl,
        program;

    // projection & view related variables
    var near = 0.1,
        far = 30,
        eye = vec3(-5, 5, -5),
        at = vec3(0, 0, 0),
        up = vec3(0.0, 1.0, 0.0);

    // shader related variables
    var modelViewMatrix,
        modelViewMatrixLoc,
        projectionMatrix,
        projectionMatrixLoc;


    var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
    var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
    var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
    var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

    var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
    var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
    var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
    var materialShininess = 100.0;

    var ambientColor, diffuseColor, specularColor;



    var objects = [];
    var uncommittedObject = null;

    function renderObject(object) {

        modelViewMatrix = lookAt(eye, at , up);

        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(object.vertices), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(object.colors), gl.STATIC_DRAW);

        var vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        modelViewMatrix = mult(modelViewMatrix, object.matrix);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));


        var ambientProduct = mult(lightAmbient, materialAmbient);
        var diffuseProduct = mult(lightDiffuse, materialDiffuse);
        var specularProduct = mult(lightSpecular, materialSpecular);


        gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
            flatten(ambientProduct));
        gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
            flatten(diffuseProduct) );
        gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
            flatten(specularProduct) );
        gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
            flatten(lightPosition) );

        gl.uniform1f(gl.getUniformLocation(program,
            "shininess"), materialShininess);


        gl.drawArrays(gl.TRIANGLES, 0, object.vertices.length);
    }

    function render() {

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (var o = 0; o < objects.length; o++) {
            renderObject(objects[o]);
        }

        if (uncommittedObject != null) {
            renderObject(uncommittedObject);
        }
    }

    return {

        init: function(globalShape) {

            if (globalShape == undefined) {
                console.log("Shape not injected into Cad.");
                return false;
            } else {
                Shape = globalShape;
            }

            canvas = document.getElementById("gl-canvas");

            gl = WebGLUtils.setupWebGL(canvas, undefined);
            if (!gl) {
                alert("WebGL isn't available");
                return false;
            }

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(1.0, 1.0, 1.0, 1.0);

            gl.enable(gl.DEPTH_TEST);

            program = initShaders(gl, "vertex-shader", "fragment-shader");
            gl.useProgram(program);

            modelViewMatrixLoc = gl.getUniformLocation(program, "mvMatrix");
            projectionMatrixLoc = gl.getUniformLocation(program, "pMatrix");

            projectionMatrix = perspective(45, canvas.width / canvas.height, near, far);
        },

        prepareObject: function(shape) {

            var objShape = Shape[shape];

            if (objShape == undefined) {
                console.log("Unknown shape: " + shape);
                return false;
            }

            uncommittedObject = objShape();
            render();
        },

        commitObject: function() {
            var objectName = uncommittedObject.name;
            var objectsLength = objects.push(uncommittedObject);
            uncommittedObject = null;
            render();
            return {
                name: objectName,
                index: objectsLength - 1
            };
        },

        discardPreparedObject: function() {
            uncommittedObject = null;
            render();
        },

        removeObject: function(index) {
            objects.splice(index, 1);
            render();
        },

        update: function(transition, rotation, scale) {
            var matrix = mat4();
            matrix = mult(matrix, transition);
            matrix = mult(matrix, rotation);
            uncommittedObject.matrix = mult(matrix, scale);
            render();
        }
    }
}();