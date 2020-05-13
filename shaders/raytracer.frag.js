export default `#version 300 es
precision highp float;

uniform vec2 u_res;
uniform sampler2D u_spheres;

out vec4 o_fragColor;

float iSphere(vec3 ro, vec3 rd, vec4 sph) {
	vec3 oc = ro - sph.xyz;
	float b = 2.0 * dot(oc, rd);
	float c = dot(oc, oc) - sph.w*sph.w;
	float disc = b*b - 4.0*c;
	if (disc < 0.0) return -1.0;
	float t = (-b - sqrt(disc)) / 2.0;
	return t;
}

vec3 nSphere(vec3 pos, vec4 sph) {
	return (pos-sph.xyz) / sph.w;
}

// vec4 sph1 = vec4(0,1,0,1);

bool intersect(vec3 ro, vec3 rd, vec4 sph, out float resT) {
	resT = 1000.0;
	float tsph = iSphere(ro, rd, sph);

	resT = tsph;
	return tsph > 0.0;
}

void main() {
	vec4 sph1 = texelFetch(u_spheres, ivec2(0, 0), 0);
	vec3 light = normalize(vec3(0.57703));
	// uv are pixel coordinates, from 0 to 1
	float aspect = u_res.y / u_res.x;
	vec2 uv = gl_FragCoord.xy / u_res.xy;

	// generate a ray with origin ro and direction rd
	vec3 ro = vec3(0,1,3);
	vec3 rd = normalize(vec3((-1.0+2.0*uv)*vec2(1.0, aspect), -1));

	// intersect ray with 3d scene
	float t;
	bool isect = intersect(ro, rd, sph1, t);

	// draw black by default
	vec3 col = vec3(0.0);
	vec3 pos = ro + t*rd;
	if (isect) {
		// if we hit the sphere
		vec3 nor = nSphere(pos, sph1);
		float dif = clamp(dot(nor, light), 0.0, 1.0);
		float ao = 0.5 + 0.5*nor.y;
		col = vec3(1,0,0)*dif*ao + vec3(1,0,0)*ao;
	}
	col = sqrt(col);

	o_fragColor = vec4(col,1);
}
`;