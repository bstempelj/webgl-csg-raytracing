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

// op[virtl], null, op[union], lf[sph0], lf[sph1]
const csgtree = createTexture(gl, new Uint8Array([1,0, 1,1, 0,0, 2,0, 2,1, 0,0, 0,0]));
// sph0, sph1
const spheres = createTexture(gl, new Float32Array([0,1,0,1, 0,2,0,1]));

setViewport(gl, gl.canvas.clientWidth, gl.canvas.clientHeight);
bindAttribute(gl, screenBuffer, screenAttr, 2);
gl.useProgram(program);
gl.uniform1i(uniforms.csgtree, 0);
gl.uniform1i(uniforms.spheres, 1);
gl.uniform2f(uniforms.res, gl.canvas.width, gl.canvas.height);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);