export default `#version 300 es

in vec2 a_screen;

void main() {
	gl_Position = vec4(a_screen, 0, 1);
}
`;