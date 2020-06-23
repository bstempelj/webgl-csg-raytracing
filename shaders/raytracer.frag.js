export default `#version 300 es
precision highp float;

////////////////////////////////////////////////////////////////////////////////
// DEFINES
// #define DEBUG
#define NORMALS
#define STACKOVERFLOW 1000
#define TMIN -100.0
#define TMAX 100.0
#define STACK_SIZE 10

#define INVALID_HIT vec4(-1,0,0,0)

#define M_PI   3.141592653f

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

// states
#define DOBOTH   0x0001
#define DOLEFT   0x0002
#define DORIGHT  0x0003
#define DONE	 0x0004

// operations
#define UNION    0x0005
#define INTER    0x0006
#define SUBTR    0x0007

// node types
#define NIL      0x0008
#define OP       0x0009
#define SPHERE   0x0010
#define BOX      0x0011
#define CYLINDER 0x0012

////////////////////////////////////////////////////////////////////////////////
// SHADER VARIABLES
uniform vec2 u_res;
uniform mediump usampler2D u_csgtree;
uniform sampler2D u_spheres;
uniform sampler2D u_boxes;
uniform sampler2D u_cylinders;
uniform mat4 u_cameraToWorld;

out vec4 o_fragColor;

////////////////////////////////////////////////////////////////////////////////
// GLOBAL VARIABLES
int  stateHead  = -1;
int  hitHead    = -1;
int  hitHead2   = -1;
int  hitHead3   = -1;
int  timeHead   = -1;
bool invalidHit = false;
int  stateStack[STACK_SIZE];
vec4 hitStack[STACK_SIZE];
vec4 hitStack2[STACK_SIZE];
vec4 hitStack3[STACK_SIZE];
int timeStack[STACK_SIZE];

////////////////////////////////////////////////////////////////////////////////
// MATH FUNCTIONS
mat4 translate( float x, float y, float z )
{
    return mat4( 1.0, 0.0, 0.0, 0.0,
				 0.0, 1.0, 0.0, 0.0,
				 0.0, 0.0, 1.0, 0.0,
				 x,   y,   z,   1.0 );
}

mat4 rotationAxisAngle( vec3 v, float angle )
{
    float s = sin( angle );
    float c = cos( angle );
    float ic = 1.0 - c;

    return mat4( v.x*v.x*ic + c,     v.y*v.x*ic - s*v.z, v.z*v.x*ic + s*v.y, 0.0,
                 v.x*v.y*ic + s*v.z, v.y*v.y*ic + c,     v.z*v.y*ic - s*v.x, 0.0,
                 v.x*v.z*ic - s*v.y, v.y*v.z*ic + s*v.x, v.z*v.z*ic + c,     0.0,
			     0.0,                0.0,                0.0,                1.0 );
}

////////////////////////////////////////////////////////////////////////////////
// INTERSECTION FUNCTIONS
vec4 iSphere(vec3 ro, vec3 rd, uint node, float tmin, float tmax) {
	vec4 sph = texelFetch(u_spheres, ivec2(node, 0), 0);

	invalidHit = false;

	vec3 oc = ro - sph.xyz;
	float a = dot(rd, rd);
	float b = 2.0 * dot(oc, rd);
	float c = dot(oc, oc) - sph.w*sph.w;
	float disc = b*b - 4.0*c;
	if (disc > 0.0) {
		float t = (-b - sqrt(disc)) / (2.0*a);
		if (t > tmin && t < tmax) {
			vec3 pos = ro + t*rd;
			vec3 nor = normalize(pos-sph.xyz);
			return vec4(t, nor);
		}
		t = (-b + sqrt(disc)) / (2.0*a);
		if (t > tmin && t < tmax) {
			vec3 pos = ro + t*rd;
			vec3 nor = normalize(pos-sph.xyz);
			return vec4(t, nor);
		}
	}

	invalidHit = true;
	return INVALID_HIT;
}

// http://iquilezles.org/www/articles/boxfunctions/boxfunctions.htm
vec4 iBox(vec3 ro, vec3 rd, uint node, bool far) {
	vec4 boxOrigin   = texelFetch(u_boxes, ivec2(node,    0), 0);
	vec4 boxSize     = texelFetch(u_boxes, ivec2(node+1u, 0), 0);
	vec4 boxRotation = texelFetch(u_boxes, ivec2(node+2u, 0), 0);

	mat4 rotx = rotationAxisAngle(normalize(vec3(1.0,0.0,0.0)), boxRotation.x * (M_PI/180.0));
	mat4 roty = rotationAxisAngle(normalize(vec3(0.0,1.0,0.0)), boxRotation.y * (M_PI/180.0));
	mat4 rotz = rotationAxisAngle(normalize(vec3(0.0,0.0,1.0)), boxRotation.z * (M_PI/180.0));
	mat4 tra = translate(boxOrigin.x, boxOrigin.y, boxOrigin.z);
	mat4 txi = tra * rotx * roty * rotz; 
	mat4 txx = inverse(txi);

    // convert from ray to box space
	vec3 rdd = (txx*vec4(rd,0.0)).xyz;
	vec3 roo = (txx*vec4(ro,1.0)).xyz;

	// ray-box intersection in box space
    vec3 m = 1.0/rdd;
    vec3 n = m*roo;
    vec3 k = abs(m)*boxSize.xyz;
	
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;

	float tN = max( max( t1.x, t1.y ), t1.z );
	float tF = min( min( t2.x, t2.y ), t2.z );
	
	if( tN > tF || tF < 0.0) return INVALID_HIT;

	vec3 norN = -sign(rdd)*step(t1.yzx,t1.xyz)*step(t1.zxy,t1.xyz);
	vec3 norF = -sign(rdd)*step(t2.yzx,t2.xyz)*step(t2.zxy,t2.xyz);

	vec3 nor;
	if (far) nor = norF;
	else nor = norN;

    // convert to ray space
	nor = (txi * vec4(nor,0.0)).xyz;

	if (far) tN = tF;

	return vec4(tN, nor);
}

////////////////////////////////////////////////////////////////////////////////
// HELPER FUNCTIONS
// stack push helpers
void pushState(int state) { stateStack[++stateHead] = state; }
void pushHit(vec4 isect)  { hitStack[++hitHead]     = isect; }
void pushHit2(vec4 isect) { hitStack2[++hitHead2] = isect; }
void pushTime(int t)    { timeStack[++timeHead]   = t;     }

// stack pop helpers
int   popState() { return stateStack[stateHead--]; }
vec4  popHit()   { return hitStack[hitHead--];     }
vec4  popHit2() { return hitStack2[hitHead2--]; }
int popTime()  { return timeStack[timeHead--];   }

// node access helpers
int left  (int node) { return 2*node + 1;     }
int right (int node) { return 2*node + 2;     }
int parent(int node) { return (node - 1) / 2; }

// node type helpers
bool operation(int node) { return texelFetch(u_csgtree, ivec2(node, 0), 0).x == uint(OP); }

////////////////////////////////////////////////////////////////////////////////
// CSG ALGORITHM FUNCTIONS
vec4 sceneNearestHit(vec3 ro, vec3 rd) {
	float tstart = 0.0;
	int node = 0;
	int state = DOBOTH;

	vec4 isectL, isectR;
	vec4 isectL_x, isectR_x;

	int i = 0; // for debugging
	for (bool toContinue = true; toContinue; i++) {
		if (state == DONE) {
			int op = int(texelFetch(u_csgtree, ivec2(node, 0), 0).y);

			if (op == UNION) {
				// merge results from left and right branch
				pushTime(popTime() + popTime());
			}
			else if (op == INTER) {
				// exit if there's not enough information in the stack
				if (timeHead+1 < 2 || timeHead+1 % 2 == 1) return INVALID_HIT;

				// get left and right branch results
				int hitNumRight = popTime(); // right was stored last in stack so pop that first
				int hitNumLeft = popTime();

				// exit if not even number of hits
				if (hitNumLeft % 2 == 1) return INVALID_HIT;
				if (hitNumRight % 2 == 1) return INVALID_HIT;

				if (hitNumLeft == 0 || hitNumRight == 0) {
					hitHead = hitHead - (hitNumLeft + hitNumRight); // move hit stack counter to "remove" both left and right hits
				}
				else {
					// enter hit is always followed by exit hit of the same object or same part of an object
					int storeCount = 0;
					hitHead2 = -1; // reset second stack

					for (int x = 0; x < hitNumLeft; x += 2) {
						isectL = hitStack[hitHead - hitNumRight - hitNumLeft + 1 + x];			// get enter from left branch
						isectL_x = hitStack[hitHead - hitNumRight - hitNumLeft + 1 + x + 1];	// get exit  from left branch

						for (int y = 0; y < hitNumRight; y += 2) {
							isectR = hitStack[hitHead - hitNumRight + 1 + y];	// get enter from right branch
							isectR_x = hitStack[hitHead - hitNumRight + 1 + y + 1]; // get exit  from right branch

							if (isectR.x > isectL.x && isectR.x < isectL_x.x) { // if right enter is inside left object
								// if right enter and exit are inside left object, then save both right points
								if (isectR_x.x > isectL.x && isectR_x.x < isectL_x.x)  pushHit2(isectR_x);
								else pushHit2(isectL_x); // save left exit

								pushHit2(isectR); // save right enter
								storeCount += 2;
							}
							else if (isectR_x.x > isectL.x && isectR_x.x < isectL_x.x) { // if right exit is inside left object							
								pushHit2(isectR_x); // save right exit
								pushHit2(isectL);	// save left enter
								storeCount += 2;
							}
							else if (isectL.x > isectR.x && isectL_x.x < isectR_x.x) { // if left object is completly inside right object							
								pushHit2(isectL_x);
								pushHit2(isectL); // save left enter and exit
								storeCount += 2;
							}
							else if ((isectL.x == isectR.x) && (isectL_x.x == isectR_x.x)) {// edge case - if both object same size and same position, then just grab left object							
								pushHit2(isectL_x);
								pushHit2(isectL); // save left enter and exit
								storeCount += 2;
							}
						}
					}// ALWAYS PUSH EXIT TO SECONDARY STACK FIRST, SO THAT ENTER COMES FIRST IN PRIMARY STACK

					hitHead = hitHead - (hitNumLeft + hitNumRight); // move hit stack counter to "remove" both left and right hits

					// transfer only stored hits back to hit stack
					for (int x = 0; x < storeCount; x++) pushHit(popHit2());
					pushTime(storeCount); // having no hits on branch is also an information we need, because operations always pop 2 'time' results
				}
			}
			else if (op == SUBTR) {
				// exit if there's not enough information in the stack
				if (timeHead + 1 < 2 || timeHead + 1 % 2 == 1) return INVALID_HIT;

				// get left and right branch results
				int hitNumRight = popTime(); // right was stored last in stack so pop that first
				int hitNumLeft = popTime();

				// exit if not even number of hits
				if (hitNumLeft % 2 == 1) return INVALID_HIT;
				if (hitNumRight % 2 == 1) return INVALID_HIT;

				if (hitNumLeft == 0) hitHead = hitHead - (hitNumLeft + hitNumRight); // move hit stack counter to "remove" both left and right hits
				else if (hitNumRight == 0) pushTime(hitNumLeft);
				else {
					// enter hit is always followed by exit hit of the same object or same part of an object
					int storeCount = 0;
					hitHead2 = -1; // reset second stack
					int extraOnSecond = 0;					

					for (int x = 0; x < hitNumLeft; x += 2) {
						isectL = hitStack[hitHead - hitNumRight - hitNumLeft + 1 + x];			// get enter from left branch
						isectL_x = hitStack[hitHead - hitNumRight - hitNumLeft + 1 + x + 1];	// get exit  from left branch

						// push both to second stack
						hitStack3[0] = isectL;
						hitStack3[1] = isectL_x;
						hitHead3 = 1;
						extraOnSecond = 0;
						
						for (int y = 0; y < hitNumRight; y += 2) {
							isectR = hitStack[hitHead - hitNumRight + 1 + y];	// get enter from right branch
							isectR_x = hitStack[hitHead - hitNumRight + 1 + y + 1]; // get exit from right branch

							for (int z = 0; z < hitHead3+1; z += 2) {
								isectL = hitStack3[z];
								isectL_x = hitStack3[z+1];

								if (isectR.x > isectL.x && isectR.x < isectL_x.x) { // if right enter is inside left object								
									if (isectR_x.x > isectL.x && isectR_x.x < isectL_x.x) { // if right enter and exit are inside left object									
										pushHit2(isectL_x); // save left exit as exit
										isectR_x.y *= -1.0;
										isectR_x.z *= -1.0;
										isectR_x.w *= -1.0;
										pushHit2(isectR_x); // save right exit as enter
										extraOnSecond += 2;
									}

									isectR.y *= -1.0;
									isectR.z *= -1.0;
									isectR.w *= -1.0;
									pushHit2(isectR); // save right enter as exit
									pushHit2(isectL); // save left enter as enter

									extraOnSecond += 2;
								}
								else if (isectR_x.x > isectL.x && isectR_x.x < isectL_x.x) { // if right exit is inside left object								
									pushHit2(isectL_x); // save left exit as exit
									isectR_x.y *= -1.0;
									isectR_x.z *= -1.0;
									isectR_x.w *= -1.0;
									pushHit2(isectR_x);// save right exit as enter

									extraOnSecond += 2;
								}
								else if ((isectL.x < isectR.x && isectL_x.x < isectR_x.x) || (isectL.x > isectR.x && isectL_x.x > isectR_x.x)) { // if right is nowhere near left								
									pushHit2(isectL_x); // save both left points as they were
									pushHit2(isectL);
									extraOnSecond += 2;
								}
								//else if left object is completly inside right object or if objects are the same size and on the same position, then save none
							}

							for (int z = 0; z < extraOnSecond; z++) hitStack3[z] = popHit2();
							hitHead3 = extraOnSecond - 1;
							extraOnSecond = 0;
						}

						hitHead2 -= extraOnSecond;
						for (int z = hitHead3; z >= 0; z--) pushHit2(hitStack3[z]);
						storeCount += hitHead3 + 1;
						hitHead3 = -1;
						extraOnSecond = 0;
					}// ALWAYS PUSH EXIT TO SECONDARY STACK FIRST, SO THAT ENTER COMES FIRST IN PRIMARY STACK

					hitHead = hitHead - (hitNumLeft + hitNumRight); // move hit stack counter to "remove" both left and right hits

					// transfer only stored hits back to hit stack
					for (int x = 0; x < storeCount; x++) pushHit(popHit2());
					pushTime(storeCount);	// having no hits on branch is also an information we need, because operations always pop 2 'time' results
				}
			}

			if (state == DONE && node == 0) toContinue = false;
			else {
				node = parent(node);
				state = popState();
			}
		}
		else { // not DONE
			if (operation(node)) {
				if (state == DOBOTH) {
					pushState(DORIGHT);
					node = left(node);
				}
				else if (state == DORIGHT) {
					pushState(DONE);
					node = right(node);
					state = DOBOTH;
				}
				else {
					return PURPLE; // exception
				}
			}
			else { // primitive
				if (state == DOBOTH || state == DOLEFT) {
					int c = 0;

					uvec4 geomNodeLoc = texelFetch(u_csgtree, ivec2(node, 0), 0);
					if (geomNodeLoc.x == uint(SPHERE)) {
						isectL = iSphere(ro, rd, geomNodeLoc.y, TMIN, TMAX);
						if (!invalidHit) {
							pushHit(isectL); 
							c++;
						}

						isectL_x = iSphere(ro, rd, geomNodeLoc.y, isectL.x, TMAX);
						if (!invalidHit) {
							pushHit(isectL_x);
							c++;
						}
					}
					else if (geomNodeLoc.x == uint(BOX)) {						
						isectL = iBox(ro, rd, geomNodeLoc.y, false);
						if (!invalidHit) {
							pushHit(isectL); 
							c++;
						}

						isectL_x = iBox(ro, rd, geomNodeLoc.y, true);
						if (!invalidHit) {
							pushHit(isectL_x);
							c++;
						}
					}

					pushTime(c);
				}
				else { // DORIGHT
					return PURPLE; // exception
				}
				node = parent(node);
				state = popState();
			}
		}

		if (i >= STACKOVERFLOW) return PURPLE; // prevent crashing of gl
	}

	int pointCount = -1;
	if (timeHead >= 0) {
		pointCount = popTime();
		if (pointCount > 0) {
			isectL = popHit();
			for (int i = 1; i < pointCount; i++) {
				isectR = popHit();
				if ((isectR.x < isectL.x && isectR.x >= 0.0) || isectL.x < 0.0)
					isectL = isectR;
			}
			return isectL;
		}
	}
	return INVALID_HIT;

	// return (isectL.x <= isectR.x) ? isectL : isectR;
}

////////////////////////////////////////////////////////////////////////////////
// MAIN
void main() {
	vec3 light = normalize(vec3(0.57703));
	// uv are pixel coordinates, from 0 to 1
	float aspect = u_res.y / u_res.x;
	vec2 uv = gl_FragCoord.xy / u_res.xy;

	// generate a ray with origin ro and direction rd
	vec3 ro = (u_cameraToWorld * vec4(vec3(0,0,3), 1)).xyz;
	vec3 rd = normalize((u_cameraToWorld * vec4(vec3((-1.0+2.0*uv)*vec2(1.0, aspect), -1), 1)).xyz);

#ifdef DEBUG
	vec3 col = vec3(boxRotation.x);
	vec4 isect = sceneNearestHit(ro, rd);
	col = isect.xyz;
#else
	// intersect ray with 3d scene
	vec4 isect = sceneNearestHit(ro, rd);

	vec3 col = vec3(0.0);
	if (isect.x > 0.0) {
#ifndef NORMALS
		vec3 nor = isect.yzw;
		float dif = clamp(dot(nor, light), 0.0, 1.0);
		float ao = 0.5 + 0.5*nor.y;
		col = vec3(1,0,0)*dif*ao + vec3(1,0,0)*ao;
		col = sqrt(col);
#else
		col = 0.5*vec3(isect.y+1.0, isect.z+1.0, isect.w+1.0);
#endif // /NORMALS
	} else {
		// nice blue gradient for background
		ro = vec3(0,0,3);
		rd = vec3((-1.0+2.0*uv)*vec2(1.0, aspect), -1);
	    float t = 0.5*(rd.y + 1.0);
    	col = (1.0-t)*vec3(1.0, 1.0, 1.0) + t*vec3(0.5, 0.7, 1.0);
	}
#endif // DEBUG
	o_fragColor = vec4(col,1);
}
`;