/* ===============================
   PITOJO - NEBULA GALAXY SHADER
   =============================== */

const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(
  -1, 1, 1, -1, 0, 1
);

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "-1";
document.body.appendChild(renderer.domElement);

/* ===============================
   SHADER MATERIAL
   =============================== */

const uniforms = {
  u_time: { value: 0 },
  u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
};

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float u_time;
    uniform vec2 u_resolution;

    // Simple noise
    float random(vec2 st) {
        return fract(sin(dot(st.xy,
                     vec2(12.9898,78.233)))*
            43758.5453123);
    }

    float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);

        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));

        vec2 u = f*f*(3.0-2.0*f);

        return mix(a, b, u.x) +
                (c - a)* u.y * (1.0 - u.x) +
                (d - b) * u.x * u.y;
    }

    void main() {

        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = uv - 0.5;
        p.x *= u_resolution.x / u_resolution.y;

        float t = u_time * 0.03;

        float n = 0.0;
        n += noise(p * 3.0 + t);
        n += 0.5 * noise(p * 6.0 - t);
        n += 0.25 * noise(p * 12.0 + t * 0.5);

        float intensity = smoothstep(0.2, 0.8, n);

        vec3 deepBlue = vec3(0.02, 0.05, 0.12);
        vec3 cyan = vec3(0.0, 0.7, 1.0);
        vec3 indigo = vec3(0.3, 0.3, 0.8);

        vec3 color = mix(deepBlue, cyan, intensity * 0.6);
        color = mix(color, indigo, intensity * 0.3);

        // Subtle radial fade
        float dist = length(p);
        color *= smoothstep(0.8, 0.2, dist);

        gl_FragColor = vec4(color, 0.9);
    }
  `,
  transparent: true
});

const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

/* ===============================
   ANIMATION
   =============================== */

function animate() {
  requestAnimationFrame(animate);

  uniforms.u_time.value += 0.5;

  renderer.render(scene, camera);
}

animate();

/* ===============================
   RESIZE
   =============================== */

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});
});
