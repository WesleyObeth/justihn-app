// aurora.ts — fondo aurora fullscreen (shader FBM, orthographic quad).
// Replicado verbatim del proyecto de origen (regla: no reinterpretar el
// shader); ÚNICO cambio permitido: los vec3 de color, adaptados a la marca
// Justihn (navy #0a1830 · celeste #1584c7 · celeste claro #7cc7f0).
import * as THREE from "three";

function W() {
  return window.innerWidth;
}
function H() {
  return window.innerHeight;
}

export interface AuroraOpts {
  lowPerf?: boolean;
  light?: boolean;
}

export function initAurora(canvas: HTMLCanvasElement, opts?: AuroraOpts) {
  opts = opts || {};
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.lowPerf ? 1.5 : 2));
  renderer.setSize(W(), H());
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(W(), H()) },
      uLight: { value: opts.light ? 1.0 : 0.0 },
    },
    vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.0); }",
    fragmentShader:
      "precision highp float; varying vec2 vUv; uniform float uTime; uniform vec2 uRes; uniform float uLight;" +
      "float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }" +
      "float n(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); float a=h(i),b=h(i+vec2(1,0)),c=h(i+vec2(0,1)),d=h(i+vec2(1,1)); return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);} " +
      "float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*n(p); p*=2.0; a*=0.5;} return v;} " +
      "void main(){ vec2 uv=vUv; vec2 p=uv*vec2(uRes.x/uRes.y,1.0)*2.0;" +
      " float t=uTime*0.06;" +
      " float f=fbm(p*1.2+vec2(t, t*0.5)); float g=fbm(p*2.0+vec2(-t*0.7, f*1.5));" +
      " float band=smoothstep(0.2,0.9,f)*smoothstep(0.9,0.3,uv.y+0.2*sin(uv.x*3.0+t*4.0));" +
      " float glow=pow(band,1.6)*0.9 + g*0.12;" +
      " vec3 col;" +
      " if(uLight>0.5){" +
      "   vec3 paper=vec3(0.957,0.945,0.925); vec3 tealT=vec3(0.082,0.518,0.780), mintT=vec3(0.486,0.780,0.941);" +
      "   vec3 tint=mix(tealT,mintT,band);" +
      "   col=mix(paper, tint, clamp((pow(band,1.3)*0.60 + g*0.12),0.0,0.85));" +
      " } else {" +
      "   vec3 teal=vec3(0.082,0.518,0.780), mint=vec3(0.486,0.780,0.941), navy=vec3(0.039,0.094,0.188);" +
      "   col=navy + mix(teal,mint,band)*glow;" +
      " }" +
      " gl_FragColor=vec4(col, 1.0); }",
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  scene.add(quad);
  const clock = new THREE.Clock();
  let raf = 0;
  let vis = true;
  const onVis = function () {
    vis = !document.hidden;
  };
  document.addEventListener("visibilitychange", onVis);
  function frame() {
    raf = requestAnimationFrame(frame);
    if (!vis) return;
    mat.uniforms.uTime!.value = clock.getElapsedTime();
    renderer.render(scene, camera);
  }
  frame();
  function rz() {
    renderer.setSize(W(), H());
    mat.uniforms.uRes!.value.set(W(), H());
  }
  window.addEventListener("resize", rz);
  return {
    dispose: function () {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", rz);
      document.removeEventListener("visibilitychange", onVis);
      renderer.dispose();
    },
  };
}
