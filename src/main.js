import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.querySelector('#scene-container').append(renderer.domElement);

// câmera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1f5f3a);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 5, 10);

// Controles orbitais
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 2, 0);

// ILUMINAÇÃO 
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
scene.add(dirLight);

const fillLight = new THREE.PointLight(0x4466ff, 1.5, 20);
fillLight.position.set(-5, 4, 3);
scene.add(fillLight);

// TEXTURA METÁLICA 
function criarTexturaAluminio() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0,   '#d8d8d8');
  grad.addColorStop(0.6, '#a0a0a0');
  grad.addColorStop(1,   '#686868');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 256; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
  }
  return new THREE.CanvasTexture(canvas);
}

const texRotulo = new THREE.TextureLoader().load(
  './textures/rotulo.jpg',
  undefined,
  undefined,
  (error) => console.error('Erro ao carregar textura do rotulo:', error)
);
texRotulo.encoding = THREE.sRGBEncoding;
texRotulo.wrapS = THREE.RepeatWrapping;
texRotulo.wrapT = THREE.RepeatWrapping;
texRotulo.repeat.set(1, 1);
texRotulo.flipY = true;
const texAlum   = criarTexturaAluminio();

// MESA
const mesaGroup = new THREE.Group();
const matMadeira = new THREE.MeshStandardMaterial({ color: 0x5a3620, roughness: 0.75 });
const matBorda = new THREE.MeshStandardMaterial({ color: 0x2b1b13, roughness: 0.55 });

const tampo = new THREE.Mesh(
  new THREE.CylinderGeometry(1.85, 1.85, 0.18, 64),
  matMadeira
);
tampo.position.y = 0.84;
tampo.receiveShadow = true;
tampo.castShadow = true;
mesaGroup.add(tampo);

const bordaTampo = new THREE.Mesh(
  new THREE.TorusGeometry(1.85, 0.06, 16, 64),
  matBorda
);
bordaTampo.rotation.x = Math.PI / 2;
bordaTampo.position.y = 0.94;
bordaTampo.castShadow = true;
mesaGroup.add(bordaTampo);

const coluna = new THREE.Mesh(
  new THREE.CylinderGeometry(0.22, 0.34, 0.7, 32),
  matBorda
);
coluna.position.y = 0.38;
coluna.castShadow = true;
mesaGroup.add(coluna);

const base = new THREE.Mesh(
  new THREE.CylinderGeometry(1.05, 1.2, 0.18, 64),
  matMadeira
);
base.position.y = -0.06;
base.castShadow = true;
base.receiveShadow = true;
mesaGroup.add(base);

const bordaBase = new THREE.Mesh(
  new THREE.TorusGeometry(1.08, 0.05, 16, 64),
  matBorda
);
bordaBase.rotation.x = Math.PI / 2;
bordaBase.position.y = 0.04;
bordaBase.castShadow = true;
mesaGroup.add(bordaBase);

mesaGroup.position.y = 0.15;
scene.add(mesaGroup);

// LATA DE MILHO
const lataGroup = new THREE.Group();

const matMetal = new THREE.MeshStandardMaterial({
  map: texAlum, metalness: 0.8, roughness: 0.2
});
const matRotulo = new THREE.MeshStandardMaterial({
  map: texRotulo,
  roughness: 0.38,
  side: THREE.DoubleSide
});
const matTampa = new THREE.MeshStandardMaterial({
  color: 0xd7d7d7,
  metalness: 0.8,
  roughness: 0.22
});

// 1. Corpo da lata com rótulo
const corpo = new THREE.Mesh(
  new THREE.CylinderGeometry(0.78, 0.78, 1.75, 72, 1, true),
  matRotulo
);
corpo.castShadow = true;
lataGroup.add(corpo);

// 2. Tampa superior
const tampaSup = new THREE.Mesh(
  new THREE.CylinderGeometry(0.78, 0.78, 0.08, 72),
  matTampa
);
tampaSup.position.y = 0.915;
tampaSup.castShadow = true;
lataGroup.add(tampaSup);

// 3. Fundo
const fundo = new THREE.Mesh(
  new THREE.CylinderGeometry(0.78, 0.78, 0.08, 72),
  matTampa
);
fundo.position.y = -0.915;
fundo.castShadow = true;
lataGroup.add(fundo);

// 4. Aros metálicos
[-0.9, 0.9].forEach((y) => {
  const aro = new THREE.Mesh(
    new THREE.TorusGeometry(0.78, 0.045, 16, 72),
    matMetal
  );
  aro.rotation.x = Math.PI / 2;
  aro.position.y = y;
  aro.castShadow = true;
  lataGroup.add(aro);
});

// 5. Rebaixo da tampa
const tampaRebaixo = new THREE.Mesh(
  new THREE.TorusGeometry(0.52, 0.018, 12, 64),
  matMetal
);
tampaRebaixo.rotation.x = Math.PI / 2;
tampaRebaixo.position.y = 0.96;
lataGroup.add(tampaRebaixo);

// POSICIONAMENTO
lataGroup.position.set(0, 2.04, 0);
scene.add(lataGroup);

// CHÃO 
const chao = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.9 })
);
chao.rotation.x = -Math.PI / 2;
chao.receiveShadow = true;
scene.add(chao);

// RESIZE 
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// LOOP 
function animate() {
  requestAnimationFrame(animate);
  lataGroup.rotation.y += 0.005;
  controls.update();
  renderer.render(scene, camera);
}
animate();
