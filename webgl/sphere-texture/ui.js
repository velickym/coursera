window.Ui = function() {

    var TextureProgram;

    return {

        init: function(globalTextureProgram) {

            if (globalTextureProgram == undefined) {
                console.log("TextureProgram not injected into UI.");
                return false;
            } else {
                TextureProgram = globalTextureProgram;
            }

            // texture handlers
            var textureEarth = document.getElementById("texture-earth");
            var textureCheckerboard = document.getElementById("texture-checkerboard");

            function changeTexture() {
                TextureProgram.changeTexture(this.value);
            }

            textureEarth.addEventListener("change", changeTexture);
            textureCheckerboard.addEventListener("change", changeTexture);

            // rotation handlers
            var rotationX = document.getElementById("x");
            var labelX = document.getElementById("x-label");
            var rotationY = document.getElementById("y");
            var labelY = document.getElementById("y-label");
            var rotationZ = document.getElementById("z");
            var labelZ = document.getElementById("z-label");

            rotationX.addEventListener("input", function() {
                TextureProgram.rotateX(this.value);
                labelX.innerHTML = this.value;
                TextureProgram.enableAutoRotate();
            });
            rotationY.addEventListener("input", function() {
                TextureProgram.rotateY(this.value);
                labelY.innerHTML = this.value;
                TextureProgram.enableAutoRotate();
            });
            rotationZ.addEventListener("input", function() {
                TextureProgram.rotateZ(this.value);
                labelZ.innerHTML = this.value;
                TextureProgram.enableAutoRotate();
            });
        }
    }
}();