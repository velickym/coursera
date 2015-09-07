window.Sphere = function() {

    var COLOR = {
        blue: vec4(0.0, 0.0, 1.0, 1.0),
        green: vec4(0.0, 1.0, 0.0, 1.0)
    };

    function triangle(a, b, c, color, arrays) {

        arrays.vertices.push(a.position);
        arrays.vertices.push(b.position);
        arrays.vertices.push(c.position);

        //arrays.colors.push(color);
        //arrays.colors.push(color);
        //arrays.colors.push(color);

        arrays.texture.push(a.texture);
        arrays.texture.push(b.texture);
        arrays.texture.push(c.texture);

        //var t1 = subtract(b, a);
        //var t2 = subtract(c, b);
        //var normal = vec3(cross(t1, t2));
        //arrays.normals.push(normal);
    }

    return {

        get: function () {

            var latitudeBands = 32;
            var longitudeBands = 32;
            var radius = 2;

            var grid = [];
            var arrays = {
                vertices: [],
                //colors: [],
                //normals: [],
                texture: []
            };

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
                    var u = 1 - (long / longitudeBands);
                    var v = 1 - (lat / latitudeBands);

                    var currentVertex = {
                        position: vec4(x, y, z, 1.0),
                        texture: vec2(u, v)
                    };

                    var color = lat % 2 == 0 && long % 2 == 0 ? COLOR.green : COLOR.blue;

                    if (lat > 0 && long > 0) {

                        var previousLatVertex = grid[lat - 1][long];
                        var previousLongVertex = row[long - 1];
                        var diagonalVertex = grid[lat - 1][long - 1];

                        triangle(diagonalVertex, previousLongVertex, previousLatVertex, color, arrays);
                        triangle(previousLongVertex, currentVertex, previousLatVertex, color, arrays);
                    }

                    row[long] = currentVertex;
                }

                grid[lat] = row;
            }

            return {
                name: "Sphere",
                matrix: mat4(),
                arrays: arrays
            }
        }
    }
}();