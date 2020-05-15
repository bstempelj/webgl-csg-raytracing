export default `#version 300 es
precision highp float;

uniform vec2 u_res;
uniform highp usampler2D u_csgtree;
uniform sampler2D u_spheres;

out vec4 o_fragColor;

vec3 nSphere(vec3 pos, vec4 sph) {
	return (pos-sph.xyz) / sph.w;
}

vec4 iSphere(vec3 ro, vec3 rd, int node) {
	uvec4 lfNode = texelFetch(u_csgtree, ivec2(node, 0), 0);
	vec4 sph = texelFetch(u_spheres, ivec2(lfNode.y, 0), 0);

	vec3 oc = ro - sph.xyz;
	float b = 2.0 * dot(oc, rd);
	float c = dot(oc, oc) - sph.w*sph.w;
	float disc = b*b - 4.0*c;

	if (disc < 0.0) return vec4(-1.0);

	float t = (-b - sqrt(disc)) / 2.0;
	vec3 pos = ro + t*rd;
	vec3 nor = nSphere(pos, sph);

	return vec4(t, nor);
}

void main() {
	vec3 light = normalize(vec3(0.57703));
	// uv are pixel coordinates, from 0 to 1
	float aspect = u_res.y / u_res.x;
	vec2 uv = gl_FragCoord.xy / u_res.xy;

	// generate a ray with origin ro and direction rd
	vec3 ro = vec3(0,1,3);
	vec3 rd = normalize(vec3((-1.0+2.0*uv)*vec2(1.0, aspect), -1));

	// intersect ray with 3d scene
	vec4 isect = iSphere(ro, rd, 1);

	// draw black by default
	vec3 col = vec3(0.0);
	if (isect.x != -1.0) {
		// if we hit the sphere
		vec3 nor = isect.yzw;
		float dif = clamp(dot(nor, light), 0.0, 1.0);
		float ao = 0.5 + 0.5*nor.y;
		col = vec3(1,0,0)*dif*ao + vec3(1,0,0)*ao;
	}
	col = sqrt(col);

	o_fragColor = vec4(col,1);
}
`;