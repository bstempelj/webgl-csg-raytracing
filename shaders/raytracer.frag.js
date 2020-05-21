export default `#version 300 es
precision highp float;

////////////////////////////////////////////////////////////////////////////////
// DEFINES
#define DEBUG
#define STACKOVERFLOW 1000

// colors
#define BLACK  vec4(0,0,0,1)
#define WHITE  vec4(1,1,1,1)
#define RED    vec4(1,0,0,1)
#define GREEN  vec4(0,1,0,1)
#define BLUE   vec4(0,0,1,1)
#define YELLOW vec4(1,1,0,1)
#define TEAL   vec4(0,1,1,1)
#define PURPLE vec4(1,0,1,1)
#define ORANGE vec4(1,0.5,0,1)

// common indices
#define VIRTL_ROOT 0
#define ROOT 1

// math
#define MAXFLOAT 1e15f
#define M_PI   3.141592653f

// states
#define GOTOLFT  0
#define GOTORGH  1
#define LOADLFT  2
#define LOADRGH  3
#define SAVELFT  4
#define CLASSIFY 5

// actions
#define RETLIFCLOSER  0
#define RETRIFCLOSER  1
#define RETL          3
#define RETR          4
#define LOOPL         5
#define LOOPR         6
#define LOOPLIFCLOSER 7
#define LOOPRIFCLOSER 8
#define FLIPNORMR     9

// hit types
#define ENTER 0
#define EXIT  1
#define MISS  2

// node types
#define NIL 0
#define OP  1
#define LF  2

// operations
#define VIRTL 0
#define UNION 1
#define INTER 2
#define SUBST 3

// primitives
// #define SPHERE 0
// #define CUBE 1
// #define CYLINDER 2

// stack
#define STACK_SIZE 10

////////////////////////////////////////////////////////////////////////////////
// SHADER VARIABLES
uniform vec2 u_res;
uniform mediump usampler2D u_csgtree;
uniform sampler2D u_spheres;

out vec4 o_fragColor;

////////////////////////////////////////////////////////////////////////////////
// GLOBAL VARIABLES
int  stateHead = -1;
int  hitHead   = -1;
int  timeHead  = -1;
int  stateStack[STACK_SIZE];
vec4 hitStack[STACK_SIZE];
float timeStack[STACK_SIZE];

////////////////////////////////////////////////////////////////////////////////
// STRUCTS
// struct ray {
// 	vec3 origin;
// 	vec3 direct;
// };

// struct hitpoint {
// 	float t;
// 	vec3 normal;
// };

////////////////////////////////////////////////////////////////////////////////
// INTERSECTION FUNCTIONS
vec4 iSphere(vec3 ro, vec3 rd, int node, float tstart) {
	uvec4 sphNodeLoc = texelFetch(u_csgtree, ivec2(node, 0), 0);
	vec4 sph = texelFetch(u_spheres, ivec2(sphNodeLoc.y, 0), 0);
	
	//ro = ro + tstart*rd;
	vec3 oc = ro - sph.xyz;
	float b = 2.0 * dot(oc, rd);
	float c = dot(oc, oc) - sph.w*sph.w;
	float disc = b*b - 4.0*c;

	if (disc < 0.0) return vec4(-1.0);

	float t0 = (-b - sqrt(disc)) / 2.0;
	float t1 = (-b + sqrt(disc)) / 2.0;
	float tenter = min(t0, t1);
	float texit  = max(t0, t1);

	float t;
	if (texit < tstart) return vec4(-1.0);
	if (tenter <= tstart) t = texit;
	else t = tenter;

	vec3 pos = ro + t*rd;
	vec3 nor = (pos-sph.xyz) / sph.w;

	return vec4(t, nor);
}

////////////////////////////////////////////////////////////////////////////////
// HELPER FUNCTIONS
// stack push helpers
void pushState(int state) { stateStack[++stateHead] = state;   }
void pushHit(vec4 isect)  { hitStack[++hitHead] = vec4(isect); }
void pushTime(float t)    { timeStack[++timeHead] = t;         }

// stack pop helpers
int   popState() { return stateStack[stateHead--]; }
vec4  popHit()   { return hitStack[hitHead--];     }
float popTime()  { return timeStack[timeHead--]; }

// node access helpers
int left  (int node) { return 2*node + 1;     }
int right (int node) { return 2*node + 2;     }
int parent(int node) { return (node - 1) / 2; }

// node type helpers
bool operation(int node) { return texelFetch(u_csgtree, ivec2(node, 0), 0).x == uint(OP); }
bool primitive(int node) { return texelFetch(u_csgtree, ivec2(node, 0), 0).x == uint(LF); }

////////////////////////////////////////////////////////////////////////////////
// CSG ALGORITHM FUNCTIONS
int classifyHit(vec3 rd, vec4 isect) {
	if (isect.x < 0.0) return MISS;
	float res = dot(normalize(rd), normalize(isect.yzw));
	if (res > 0.0) return EXIT; // same direction
	else return ENTER;          // opposite direction
}

bool hasAction(ivec3 actions, int action) {
	return actions.x == action
		|| actions.y == action
		|| actions.z == action;
}

ivec3 stateTable(int op, int hitL, int hitR) {
	ivec3 actions = ivec3(-1);

	// UNION
	if (op == UNION) {
		// left ENTER
		if (hitL == ENTER && hitR == ENTER) {
			actions.x = RETLIFCLOSER;
			actions.y = RETRIFCLOSER;
		}
		else if (hitL == ENTER && hitR == EXIT) {
			actions.x = RETLIFCLOSER;
			actions.y = LOOPL;
		}
		else if (hitL == ENTER && hitR == MISS) {
			actions.x = RETL;
		}

		// left EXIT
		else if (hitL == EXIT && hitR == ENTER) {
			actions.x = RETLIFCLOSER;
			actions.y = LOOPR;
		}
		else if (hitL == EXIT && hitR == EXIT) {
			actions.x = LOOPLIFCLOSER;
			actions.y = LOOPRIFCLOSER;
		}
		else if (hitL == EXIT && hitR == MISS) {
			actions.x = RETL;
		}

		// left MISS
		else if (hitL == MISS && (hitR == ENTER || hitR == EXIT)) {
			actions.x = RETR;
		}
		else if (hitL == MISS && hitR == MISS) {
			actions.x = MISS;
		}
	}
	// INTERSECTION
	else if (op == INTER) {
		// left ENTER
		if (hitL == ENTER && hitR == ENTER) {
			actions.x = LOOPLIFCLOSER;
			actions.y = LOOPRIFCLOSER;
		}
		else if (hitL == ENTER && hitR == EXIT) {
			actions.x = RETLIFCLOSER;
			actions.y = LOOPR;
		}
		else if (hitL == ENTER && hitR == MISS) {
			actions.x = MISS;
		}

		// left EXIT
		else if (hitL == EXIT && hitR == ENTER) {
			actions.x = RETRIFCLOSER;
			actions.y = LOOPL;
		}
		else if (hitL == EXIT && hitR == EXIT) {
			actions.x = RETLIFCLOSER;
			actions.y = RETRIFCLOSER;
		}
		else if (hitL == EXIT && hitR == MISS) {
			actions.x = MISS;
		}

		// left MISS
		else if (hitL == MISS && (hitR == ENTER || hitR == EXIT || hitR == MISS)) {
			actions.x = MISS;
		}
	}
	// SUBSTRACTION
	else if (op == SUBST) {
		// left ENTER
		if (hitL == ENTER && hitR == ENTER) {
			actions.x = RETLIFCLOSER;
			actions.y = LOOPR;
		}
		else if (hitL == ENTER && hitR == EXIT) {
			actions.x = LOOPLIFCLOSER;
			actions.y = LOOPRIFCLOSER;
		}
		else if (hitL == ENTER && hitR == MISS) {
			actions.x = RETL;
		}

		// left EXIT
		else if (hitL == EXIT && hitR == ENTER) {
			actions.x = RETLIFCLOSER;
			actions.y = RETRIFCLOSER;
			actions.z = FLIPNORMR;
		}
		else if (hitL == EXIT && hitR == EXIT) {
			actions.x = RETRIFCLOSER;
			actions.y = FLIPNORMR;
			actions.z = LOOPL;
		}
		else if (hitL == EXIT && hitR == MISS) {
			actions.x = RETL;
		}

		// left MISS
		else if (hitL == MISS && (hitR == ENTER || hitR == EXIT || hitR == MISS)) {
			actions.x = MISS;
		}
	}

	return actions;
}

vec4 sceneNearestHit(vec3 ro, vec3 rd) {
	float tstart = 0.0;
	int node = 0;
	int state = GOTOLFT;

	vec4 isectL, isectR;
	bool traverseL, traverseR;

	int i = 0; // for debugging

	pushState(CLASSIFY); // do after GOTOLFT

	for (bool toContinue = true; toContinue; i++) {
		if (state == SAVELFT) {
			pushHit(isectL);
			tstart = popTime();
			state = GOTORGH;
		}
		if (state == GOTOLFT || state == GOTORGH) {
			if (state == GOTOLFT) {
				node = left(node);
			} else {
				node = right(node);
			}

			if (operation(node)) {
				traverseL = true;
				traverseR = true;

				if (traverseL && primitive(left(node))) {
					isectL = iSphere(ro, rd, left(node), tstart);
					traverseL = false;
				}
				if (traverseR && primitive(right(node))) {
					isectR = iSphere(ro, rd, right(node), tstart);
					traverseR = false;
				}

				if (traverseL || traverseR) {
					if (!traverseL) {
						pushHit(isectL);
						pushState(LOADLFT);
					}
					else if (!traverseR) {
						pushHit(isectR);
						pushState(LOADRGH);
					}
					else {
						pushTime(tstart);
						pushState(LOADLFT);
						pushState(SAVELFT);
					}

					if (traverseL) {
						state = GOTOLFT;
					} else {
						state = GOTORGH;
					}
				}
				else {
					state = CLASSIFY;
				}
			}
			else { // primitive(node)
				if (state == GOTOLFT) {
					isectL = iSphere(ro, rd, node, tstart);
				} else {
					isectR = iSphere(ro, rd, node, tstart);
				}
				state = CLASSIFY;
				node = parent(node); // go to parent
			}
		}
		if (state == LOADLFT || state == LOADRGH || state == CLASSIFY) {
			if (state == LOADLFT || state == LOADRGH) {
				if (state == LOADLFT) {
					isectL = popHit();
				} else {
					isectR = popHit();
				}
			}

			int hitL = classifyHit(rd, isectL);
			int hitR = classifyHit(rd, isectR);

			// if (i == 1 && hitL == ENTER && hitR == ENTER) return GREEN;
			//if (i == 1 && hitL == EXIT) return BLUE;
			//if (i == 1 && hitR == ENTER) return RED;

			int op = int(texelFetch(u_csgtree, ivec2(node, 0), 0).y);

			ivec3 actions = stateTable(op, hitL, hitR);
			if (hasAction(actions, RETL)
			|| (hasAction(actions, RETLIFCLOSER) && isectL.x <= isectR.x)) {
				isectR = isectL;
				state = popState();
				node = parent(node);
				
				toContinue = (stateHead >= 0);
			}
			else if (hasAction(actions, RETR)
				 || (hasAction(actions, RETRIFCLOSER) && isectR.x < isectL.x)) {
				if (hasAction(actions, FLIPNORMR)) {
					isectR.y *= -1.0;
					isectR.z *= -1.0;
					isectR.w *= -1.0;
				}
				isectL = isectR;
				state = popState();
				node = parent(node);

				toContinue = (stateHead >= 0);
			}
			else if (hasAction(actions, LOOPL)
				 || (hasAction(actions, LOOPLIFCLOSER) && isectL.x <= isectR.x)) {
				tstart = isectL.x;
				pushHit(isectR);
				pushState(LOADRGH);
				state = GOTOLFT;
			}
			else if (hasAction(actions, LOOPR)
				 || (hasAction(actions, LOOPRIFCLOSER) && isectR.x < isectL.x)) {
				tstart = isectR.x;
				pushHit(isectL);
				pushState(LOADLFT);
				state = GOTORGH;
			}
			else if (hasAction(actions, MISS)) {
				isectL.x = -1.0;
				isectR.x = -1.0;
				state = popState();
				node = parent(node);

				toContinue = (stateHead >= 0);
			}
			else { // virtual
				state = popState();
				toContinue = (stateHead >= 0);
			}
		}
		if (i >= STACKOVERFLOW) return PURPLE; // prevent crashing of gl
	}

	if (isectL.x < 0.0 && isectR.x < 0.0) return BLACK;
	if (isectL.x < 0.0 && isectR.x > 0.0) return isectR;
	if (isectR.x < 0.0 && isectL.x > 0.0) return isectL;
	if (isectL.x <= isectR.x) return isectL;
	if (isectR.x <= isectL.x) return isectR;
	return BLACK;
}

////////////////////////////////////////////////////////////////////////////////
// MAIN
void main() {
	vec3 light = normalize(vec3(0.57703));
	// uv are pixel coordinates, from 0 to 1
	float aspect = u_res.y / u_res.x;
	vec2 uv = gl_FragCoord.xy / u_res.xy;

	// generate a ray with origin ro and direction rd
	vec3 ro = vec3(0,1,3);
	vec3 rd = normalize(vec3((-1.0+2.0*uv)*vec2(1.0, aspect), -1));

#ifdef DEBUG
	vec4 isect = sceneNearestHit(ro, rd);
	vec3 col = isect.xyz;
#else
	// intersect ray with 3d scene
	vec4 isect = sceneNearestHit(ro, rd);
	// vec4 isect = iSphere(ro, rd, 1, 0.0);

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
#endif // DEBUG

	o_fragColor = vec4(col,1);
}
`;