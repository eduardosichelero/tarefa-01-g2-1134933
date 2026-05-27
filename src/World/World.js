import * as THREE from "three";

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GuiControls } from './systems/GuiControls.js';

import { Camera } from './components/Camera.js';
import { Cube } from './components/Cube.js';
import { Sphere } from './components/Sphere.js';
import { Scene } from './components/Scene.js';

import { Floor } from './components/Floor.js';
import { Light } from './components/Light.js';

import { Renderer } from './systems/Renderer.js';
import { Resizer } from './systems/Resizer.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// These variables are module-scoped: we cannot access them
// from outside the module
let camera;
let renderer;
let scene;
let controls;
let cube;
let sphere;
let resizer;

class World {
  constructor(container) {
    camera = Camera.create();
    renderer = Renderer.create();
    container.append(renderer.domElement);
    resizer = new Resizer(container, camera, renderer);

    // Permite controle da camera com mouse e teclado  
    controls = new OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents(window);
    //controls.enableDamping = true; // suaviza o movimento

    // Mostra controle de propriedades na tela (dat.GUI)
    const guiControls = new GuiControls();

    // cube = Cube.create();
    // cube.material.color.set(0x0000ff);
    // cube.position.x = 0;
    // cube.position.y = 2;
    // cube.position.z = 0;

    // sphere = Sphere.create();
    // sphere.position.x = 0;
    // sphere.position.y = 1;
    // sphere.position.z = 4;

    scene = Scene.create();

    let pollBalls;
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('src/World/assets/textures/billiard_balls/scene.gltf', (gltfScene) => {      
      pollBalls = gltfScene.scene;
      pollBalls.position.y = 0.9;
      pollBalls.position.x = 0;
      pollBalls.position.z = -4;
      pollBalls.scale.set(0.02, 0.02, 0.02);        

      let bola_branca = pollBalls.getObjectByName('Ball_Clube');
      bola_branca.position.z = 200;
      scene.add(pollBalls); 
      guiControls.addSceneFolder(scene);
    });  
    

    // Carregar imagem de fundo da cena    
    //Scene.setBackgroundTexture(scene, 'src/World/assets/textures/backgrounds/space.jpg');

    // Setar cor de fundo da cena
    Scene.setBackgroundColor(scene, 0x21272e);

    // Agrupar elementos da cena para iluminação e sombras
    const mainGroup = new THREE.Group();

    scene.add(mainGroup);

    // adiciona grid de referência
    Scene.addGridHelper(scene, 10, 10).helper.visible = false;

    // adiciona eixos de referência
    Scene.addAxesHelper(scene, 8).helper.visible = false;

    // adiciona helper da câmera
    Scene.addCameraHelper(scene, camera).helper.visible = false;

    // adiciona piso (floor) com altura
    const floor = Floor.createBoxFloor(10, 20, 1);
    floor.material.color.set('lightgreen');
    mainGroup.add(floor);

    // iluminação
    const ambientLight = Light.createAmbientLight(0xffffff, 0.5);
    mainGroup.add(ambientLight);

    const directionalLight = Light.createDirectionalLight(0, 5, 0, 0xffffff, 0.5);

    // adiciona helper da iluminação
    const dlHelper = Light.createDirectionalLightHelper(directionalLight, 3);
    dlHelper.visible = true;

    // iluminar um objeto específico
    //directionalLight.target = sphere;

    mainGroup.add(directionalLight, dlHelper);

    //mainGroup.add(cube);
    //mainGroup.add(sphere);

    //guiControls.addCameraFolder(camera, controls);
    guiControls.addLightFolder(ambientLight);
    guiControls.addLightFolder(directionalLight, dlHelper);
  }

  render() {
    renderer.setAnimationLoop(() => {      
      //controls.update();
      renderer.render(scene, camera);
    });
  }

}

export { World };
