import {
	createShader,
	createProgram,
	createBuffer,
	createTexture,
	bindAttribute,
	setViewport,
} from './glutils.js'
import vShader from './shaders/raytracer.vert.js';
import fShader from './shaders/raytracer.frag.js';

const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl2');

const program = createProgram(gl, vShader, fShader);
const screenAttr = gl.getAttribLocation(program, 'a_screen');
const screenBuffer = createBuffer(gl,
	new Float32Array([-1,-1, -1,1, 1,-1, 1,1]));

const uniforms = {
	res:     gl.getUniformLocation(program, 'u_res'),
	csgtree: gl.getUniformLocation(program, 'u_csgtree'),
	spheres: gl.getUniformLocation(program, 'u_spheres'),
};

// node types
const NIL = 0;
const OP  = 1;
const LF  = 2;

// operations
const VIRTL = 0;
const UNION = 1;
const INTER = 2;
const SUBST = 3;

//                     virtl
//                    /     \
//                   /       \
//                  /         \
//             union           nil
//            /     \
//           /       \
//          /         \
//     union           union
//    /     \         /     \
//  sph0   sph1     sph2   sph3
// const csgtree = createTexture(gl, new Uint8Array([
// 	OP,VIRTL,
// 	OP,UNION, NIL,NIL,
// 	OP,UNION, OP,UNION, NIL,NIL, NIL,NIL,
// 	LF,0, LF,1, LF,2, LF,3, NIL,NIL, NIL,NIL, NIL,NIL, NIL,NIL // primitives
// ]));
// // sph0, sph1, sph2, sph3
// const spheres = createTexture(gl, new Float32Array([-0.5,1,0,1, 0.5,1,0,1, 0,1.5,0,1, 0,0.5,0,1]));

const csgtree = createTexture(gl, new Uint8Array([
	OP,VIRTL,
	OP,INTER, NIL,NIL,
	OP,UNION, OP,UNION, NIL,NIL, NIL,NIL,
	LF,0, LF,1, LF,2, LF,3, NIL,NIL, NIL,NIL, NIL,NIL, NIL,NIL   // primitives
	// LF,0, LF,1, NIL,NIL, NIL,NIL,  // primitives
]));
// sph0, sph1, sph2, sph3
const spheres = createTexture(gl, new Float32Array([-0.5,1,0,1, 0.5,1,0,1, 0,1.5,0,1, 0,0.5,0,1]));
// const spheres = createTexture(gl, new Float32Array([-0.5,1,0,1, 0.5,1,0,1]));

setViewport(gl, gl.canvas.clientWidth, gl.canvas.clientHeight);
bindAttribute(gl, screenBuffer, screenAttr, 2);
gl.useProgram(program);
gl.uniform1i(uniforms.csgtree, 0);
gl.uniform1i(uniforms.spheres, 1);
gl.uniform2f(uniforms.res, gl.canvas.width, gl.canvas.height);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);