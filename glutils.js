export function createShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(shader));
	}
	return shader;
}

export function createProgram(gl, vertSource, fragSource) {
	const program = gl.createProgram();
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertSource);
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragSource);

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(gl.getProgramInfoLog(program));
	}
	return program;
}

export function createBuffer(gl, data) {
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	return buffer;
}

export function bindAttribute(gl, buffer, attribute, numComponents) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(attribute);
	gl.vertexAttribPointer(attribute, numComponents, gl.FLOAT, false, 0, 0);
}

export function setViewport(gl, width, height) {
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.viewport(0, 0, width, height);
}
