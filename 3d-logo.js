import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const gsap = window.gsap;

class Logo3D {
  constructor() {
    this.wrapper = document.getElementById('logo-3d-wrapper');
    if (!this.wrapper) return;

    this.canvasContainer = document.getElementById('logo-3d-canvas');
    if (!this.canvasContainer) {
      this.canvasContainer = document.createElement('div');
      this.canvasContainer.id = 'logo-3d-canvas';
      // Add this inline style so it takes full width/height of wrapper without pointer-events issue
      this.canvasContainer.style.width = '100%';
      this.canvasContainer.style.height = '100%';
      this.canvasContainer.style.position = 'absolute';
      this.canvasContainer.style.pointerEvents = 'none'; // The wrapper catches the hover
      this.wrapper.appendChild(this.canvasContainer);
    }

    this.width = this.wrapper.clientWidth || 500;
    this.height = this.wrapper.clientHeight || 160;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.camera.position.z = 180;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.canvasContainer.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.isHovered = false;
    this.targetRotation = new THREE.Vector2();

    this.badgeParams = { expand: 0 }; 

    this.initLights();
    this.initMaterials();
    this.initEnvironment();

    const fontLoader = new FontLoader();
    fontLoader.load('assets/helvetiker_bold.typeface.json', (font) => {
      this.font = font;
      this.buildScene();
      this.initEvents();
      this.animate();
    });

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  initLights() {
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(-50, 50, 50);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x4a90e2, 4.0);
    rimLight.position.set(50, -50, -50);
    this.scene.add(rimLight);

    const fillLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(fillLight);
  }

  initMaterials() {
    this.chromeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
      envMapIntensity: 1.5,
    });

    this.textFaceMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff0000,
      emissive: 0x550000,
      metalness: 0.6,
      roughness: 0.2,
      clearcoat: 1.0,
    });

    this.textSideMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x050505,
      emissive: 0x000000,
      metalness: 0.9,
      roughness: 0.2,
      envMapIntensity: 1.5,
    });
  }

  initEnvironment() {
    new RGBELoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/equirectangular/royal_esplanade_1k.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.environment = texture;
      this.chromeMaterial.needsUpdate = true;
      this.textFaceMaterial.needsUpdate = true;
      this.textSideMaterial.needsUpdate = true;
    });
  }

  buildScene() {
    this.logoGroup = new THREE.Group();
    this.scene.add(this.logoGroup);

    this.badgeGroup = new THREE.Group();
    this.logoGroup.add(this.badgeGroup);

    // Scaling up parameters for the large 500x160 absolute positioned container
    const radius = 35;
    const depth = 12;
    this.circleStartX = -160; 
    
    // Caps
    const capGeo = new THREE.CylinderGeometry(radius, radius, depth, 64);
    capGeo.rotateX(Math.PI / 2);
    
    this.leftCap = new THREE.Mesh(capGeo, this.chromeMaterial);
    this.leftCap.position.x = this.circleStartX;
    
    this.rightCap = new THREE.Mesh(capGeo, this.chromeMaterial);
    this.rightCap.position.x = this.circleStartX;
    
    // Center Box
    this.centerBoxGeo = new THREE.BoxGeometry(1, radius * 2, depth);
    this.centerBox = new THREE.Mesh(this.centerBoxGeo, this.chromeMaterial);
    this.centerBox.visible = false;
    this.centerBox.position.x = this.circleStartX;

    this.badgeGroup.add(this.leftCap);
    this.badgeGroup.add(this.rightCap);
    this.badgeGroup.add(this.centerBox);

    // Text "RA"
    this.raGroup = new THREE.Group();
    this.logoGroup.add(this.raGroup);

    const textOptions = {
      font: this.font,
      size: 26,
      height: 8,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 1.5,
      bevelSize: 0.5,
      bevelOffset: 0,
      bevelSegments: 4
    };

    const raGeo = new TextGeometry('RA', textOptions);
    raGeo.computeBoundingBox();
    const raWidth = raGeo.boundingBox.max.x - raGeo.boundingBox.min.x;
    const raHeight = raGeo.boundingBox.max.y - raGeo.boundingBox.min.y;
    raGeo.translate(-raWidth / 2, -raHeight / 2, 0);

    this.raMesh = new THREE.Mesh(raGeo, [this.textFaceMaterial, this.textSideMaterial]);
    this.raMesh.position.z = depth / 2 + 2;
    this.raGroup.add(this.raMesh);
    
    this.raGroup.position.x = this.circleStartX;

    // Full Text "HUL ACHARI"
    this.fullTextGroup = new THREE.Group();
    this.logoGroup.add(this.fullTextGroup);
    
    const letters = "HUL ACHARI".split("");
    this.letterMeshes = [];
    
    // Expand to fit all text nicely
    this.maxExpand = 300;
    
    const charSpacing = 2.5;
    let totalTextWidth = raWidth;
    const charGeos = [];
    
    letters.forEach(char => {
      if (char === " ") {
         totalTextWidth += 12;
         charGeos.push(null);
      } else {
         const geo = new TextGeometry(char, textOptions);
         geo.computeBoundingBox();
         const cw = geo.boundingBox.max.x - geo.boundingBox.min.x;
         totalTextWidth += cw + charSpacing;
         charGeos.push(geo);
      }
    });

    const expandedCenterX = this.circleStartX + (this.maxExpand / 2);
    this.raTargetX = expandedCenterX - (totalTextWidth / 2) + (raWidth / 2);
    
    let currentX = this.raTargetX + (raWidth / 2) + charSpacing + 4;
    
    letters.forEach((char, i) => {
      if (char === " ") {
        currentX += 12;
        return;
      }
      const charGeo = charGeos[i];
      const charWidth = charGeo.boundingBox.max.x - charGeo.boundingBox.min.x;
      const charHeight = charGeo.boundingBox.max.y - charGeo.boundingBox.min.y;
      charGeo.translate(-charWidth / 2, -charHeight / 2, 0);
      
      const mesh = new THREE.Mesh(charGeo, [this.textFaceMaterial, this.textSideMaterial]);
      mesh.position.set(currentX + charWidth / 2, 0, depth / 2 + 2);
      
      mesh.scale.set(0, 0, 0);
      mesh.visible = false;
      
      this.fullTextGroup.add(mesh);
      this.letterMeshes.push(mesh);
      
      currentX += charWidth + charSpacing;
    });
  }

  initEvents() {
    this.wrapper.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    this.wrapper.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    this.wrapper.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onMouseEnter() {
    this.isHovered = true;
    
    gsap.to(this.badgeParams, {
      expand: 1,
      duration: 0.6,
      ease: "back.out(1.2)",
      onUpdate: () => this.updateBadgeShape()
    });

    gsap.to(this.raMesh.rotation, {
      y: Math.PI * 2,
      duration: 0.7,
      ease: "power2.inOut"
    });
    
    gsap.to(this.raGroup.position, {
      x: this.raTargetX,
      duration: 0.6,
      ease: "back.out(1.2)"
    });

    this.letterMeshes.forEach((mesh, index) => {
      mesh.visible = true;
      gsap.to(mesh.scale, {
        x: 1, y: 1, z: 1,
        duration: 0.4,
        ease: "back.out(1.5)",
        delay: 0.1 + index * 0.02
      });
      gsap.fromTo(mesh.position, 
        { z: -10, y: -10 }, 
        { z: 12 / 2 + 2, y: 0, duration: 0.4, ease: "power2.out", delay: 0.1 + index * 0.02 }
      );
    });
  }

  onMouseLeave() {
    this.isHovered = false;

    gsap.to(this.badgeParams, {
      expand: 0,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => this.updateBadgeShape()
    });

    gsap.to(this.raMesh.rotation, {
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    });

    gsap.to(this.raGroup.position, {
      x: this.circleStartX,
      duration: 0.5,
      ease: "power2.out"
    });

    this.letterMeshes.forEach((mesh, index) => {
      gsap.to(mesh.scale, {
        x: 0, y: 0, z: 0,
        duration: 0.25,
        ease: "power2.in",
        delay: (this.letterMeshes.length - 1 - index) * 0.015,
        onComplete: () => { mesh.visible = false; }
      });
    });
    
    gsap.to(this.targetRotation, { x: 0, y: 0, duration: 0.5 });
  }

  onMouseMove(e) {
    if (!this.isHovered) return;
    const rect = this.wrapper.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.targetRotation.x = y * (Math.PI / 180) * 15;
    this.targetRotation.y = x * (Math.PI / 180) * 15;
  }

  updateBadgeShape() {
    if (!this.badgeGroup) return;
    const w = this.maxExpand * this.badgeParams.expand;
    
    if (w > 0) {
      this.centerBox.visible = true;
      this.centerBox.scale.x = w;
      this.centerBox.position.x = this.circleStartX + (w / 2);
      this.rightCap.position.x = this.circleStartX + w;
    } else {
      this.centerBox.visible = false;
      this.rightCap.position.x = this.circleStartX;
    }
  }

  onWindowResize() {
    if (!this.wrapper) return;
    this.width = this.wrapper.clientWidth;
    this.height = this.wrapper.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    const time = this.clock.getElapsedTime();

    if (this.logoGroup) {
      this.logoGroup.position.y = Math.sin(time * 2) * 2; // more bounce
      
      if (!this.isHovered) {
        this.logoGroup.rotation.y = Math.sin(time * 0.5) * (Math.PI / 180) * 8;
        this.logoGroup.rotation.x = 0;
        const scale = 1.0 + (Math.sin(time * 3) + 1) * 0.01;
        this.logoGroup.scale.set(scale, scale, scale);
      } else {
        this.logoGroup.rotation.x += (this.targetRotation.x - this.logoGroup.rotation.x) * 0.1;
        this.logoGroup.rotation.y += (this.targetRotation.y - this.logoGroup.rotation.y) * 0.1;
        this.logoGroup.scale.set(1, 1, 1);
      }
    }

    if (this.wrapper) {
       const currentWidth = this.wrapper.clientWidth;
       const currentHeight = this.wrapper.clientHeight;
       if (this.width !== currentWidth || this.height !== currentHeight) {
          this.width = currentWidth;
          this.height = currentHeight;
          this.camera.aspect = this.width / this.height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(this.width, this.height);
       }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Logo3D();
});
