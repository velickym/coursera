window.Shape = function() {

    var COLOR = {
        blue: vec4(0.0, 0.0, 1.0, 1.0),
        green: vec4(0.0, 1.0, 0.0, 1.0)
    };

    function triangle(a, b, c, color, vertices, colors) {

        vertices.push(a);
        vertices.push(b);
        vertices.push(c);

        colors.push(color);
        colors.push(color);
        colors.push(color);
    }

    return {

        sphere: function() {

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

                    var color = lat % 2 == 0 && long % 2 == 0 ? COLOR.green : COLOR.blue;

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
                name: "Sphere",
                matrix: mat4(),
                colors: colors,
                vertices: vertices
            }
        },

        cone: function() {

            var bands = 30;
            var radius = 0.8;
            var top = 0.8;
            var bottom = -0.6;

            var vertexBottom = vec4(0, bottom, 0, 1.0);
            var vertexTop = vec4(0, top, 0, 1.0);

            var vertices = [];
            var colors = [];
            var previousVertex = null;

            for (var i = 0; i <= bands; i++) {

                var theta = i * (2 * Math.PI / bands);

                var x = radius * Math.sin(theta);
                var z = radius * Math.cos(theta);

                var vertex = vec4(x, bottom, z, 1.0);

                var color = i % 2 == 0 ? COLOR.green : COLOR.blue;

                if (previousVertex != null) {
                    triangle(vertexBottom, previousVertex, vertex, color, vertices, colors);
                    triangle(vertexTop, vertex, previousVertex, color, vertices, colors);
                }

                previousVertex = vertex;
            }

            return {
                name: "Cone",
                matrix: mat4(),
                colors: colors,
                vertices: vertices
            }
        },

        cylinder: function() {

            var bands = 30;
            var radius = 0.8;
            var top = 0.6;
            var bottom = -0.6;

            var vertexCenterBottom = vec4(0, bottom, 0, 1.0);
            var vertexCenterTop = vec4(0, top, 0, 1.0);

            var vertices = [];
            var colors = [];
            var previousVertexTop = null;
            var previousVertexBottom = null;

            for (var i = 0; i <= bands; i++) {

                var theta = i * (2 * Math.PI / bands);

                var x = radius * Math.sin(theta);
                var z = radius * Math.cos(theta);

                var vertexTop = vec4(x, top, z, 1.0);
                var vertexBottom = vec4(x, bottom, z, 1.0);

                var color = i % 2 == 0 ? COLOR.green : COLOR.blue;

                if (previousVertexTop != null && previousVertexBottom != null) {
                    triangle(vertexCenterTop, vertexTop, previousVertexTop, color, vertices, colors);
                    triangle(vertexCenterBottom, vertexBottom, previousVertexBottom, color, vertices, colors);
                    triangle(vertexBottom, previousVertexBottom, previousVertexTop, color, vertices, colors);
                    triangle(previousVertexTop, vertexTop, vertexBottom, color, vertices, colors);
                }

                previousVertexTop = vertexTop;
                previousVertexBottom = vertexBottom;
            }

            return {
                name: "Cylinder",
                matrix: mat4(),
                colors: colors,
                vertices: vertices
            }
        }
    }
}();