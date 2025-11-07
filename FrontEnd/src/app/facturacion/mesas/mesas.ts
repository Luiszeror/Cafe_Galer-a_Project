import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-mesas3d',
  standalone: true,
  template: `
    <div #canvasContainer class="escena3d"></div>
  `,
  styles: [`
    :host {
      display: block;
      margin: 0;
      padding: 0;
    }

    .escena3d {
      width: 100vw;
      height: 100vh;
      background-color: #F9F6F1;
      overflow: hidden;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 0;
    }
  `]
})
export class Mesas3DComponent implements AfterViewInit {
  @ViewChild('canvasContainer', { static: true }) container!: ElementRef;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;

  ngAfterViewInit() {
    // --- 🎬 Escena ---
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#F9F6F1');

    // --- 📷 Cámara ---
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(4, 7, 9);
    this.camera.lookAt(0, 2, 0);

    // --- 🧭 Renderizador ---
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.container.nativeElement.appendChild(this.renderer.domElement);

    // --- 💡 Iluminación ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(10, 15, 10);
    this.scene.add(directionalLight);

    // --- 🟦 Plataformas ---
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0xE4F777,
      transparent: true,
      opacity: 0.6
    });

    const niveles = [
      { y: 4, mesas: 2 },
      { y: 2, mesas: 1 },
      { y: 0, mesas: 3 } // el nivel más bajo con la mesa rectangular central + 2 redondas
    ];

    niveles.forEach((nivel, i) => {
      // Crear plataforma
      const planeGeometry = new THREE.BoxGeometry(6, 0.1, 4.5);
      const plane = new THREE.Mesh(planeGeometry, platformMaterial);
      plane.position.set(i * 4 - 4, nivel.y, 0);
      this.scene.add(plane);

      // --- ⚪ Mesas ---
       const tableMaterial = new THREE.MeshStandardMaterial({
        color: 0x825804,
        roughness: 0.3,
        metalness: 0.1
      });

      // --- 🔶 Nivel inferior con mesa alargada + 2 redondas ---
      if (nivel.y === 0) {
        // Mesa alargada principal
        const mainTableGeometry = new THREE.BoxGeometry(2.8, 0.15, 1.2); // más larga y delgada
const mesaPrincipal = new THREE.Mesh(mainTableGeometry, tableMaterial);
mesaPrincipal.position.set(plane.position.x + 1, nivel.y + 0.25, 0.4);
mesaPrincipal.userData = { id: `Mesa Principal (Nivel Inferior)` };
this.scene.add(mesaPrincipal);

// --- 🦵 Cuatro patas bien alineadas ---
// Usamos offsets distintos en X y Z para ajustarlas a la forma rectangular
const legOffsetX = 1.2; // separación horizontal
const legOffsetZ = 0.5; // separación en profundidad
const legHeight = 0.6;

const legPositions = [
  [-legOffsetX, nivel.y - 0.05, -legOffsetZ],
  [ legOffsetX, nivel.y - 0.05, -legOffsetZ],
  [-legOffsetX, nivel.y - 0.05,  legOffsetZ],
  [ legOffsetX, nivel.y - 0.05,  legOffsetZ]
];

legPositions.forEach(([x, y, z]) => {
  const pata = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, legHeight, 16),
    tableMaterial
  );

  // Alinear con la posición de la mesa
  pata.position.set(
    mesaPrincipal.position.x + x,
    y,
    mesaPrincipal.position.z + z
  );

  this.scene.add(pata);
});

        // 🟠 Dos mesas redondas a los lados
        const roundTableGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.15, 32);
        const roundLegGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16);

        const roundPositions = [
          new THREE.Vector3(plane.position.x - 2.2, nivel.y + 0.25, 0.7),
          new THREE.Vector3(plane.position.x + 0.3, nivel.y + 0.30, -1.3)
        ];

        roundPositions.forEach((pos, j) => {
          const mesa = new THREE.Mesh(roundTableGeometry, tableMaterial);
          mesa.position.copy(pos);
          mesa.userData = { id: `Mesa Redonda Inferior ${j + 1}` };
          this.scene.add(mesa);

          const pata = new THREE.Mesh(roundLegGeometry, tableMaterial);
          pata.position.set(mesa.position.x, nivel.y - 0.05, mesa.position.z);
          this.scene.add(pata);
        });

      } else {
        // 🔘 Mesas redondas normales para los niveles superiores
        const tableTopGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.15, 32);
        const tableLegGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16);

        const posiciones: THREE.Vector3[] = [];
        if (nivel.mesas === 1) {
          posiciones.push(new THREE.Vector3(0, nivel.y + 0.25, 0));
        } else if (nivel.mesas === 2) {
          posiciones.push(new THREE.Vector3(-1.2, nivel.y + 0.25, 0.5));
          posiciones.push(new THREE.Vector3(1.2, nivel.y + 0.25, -0.5));
        }

        posiciones.forEach((pos, j) => {
          const mesa = new THREE.Mesh(tableTopGeometry, tableMaterial);
          mesa.position.set(plane.position.x + pos.x, pos.y, pos.z);
          mesa.userData = { id: `Mesa Nivel ${i + 1}-${j + 1}` };
          this.scene.add(mesa);

          const pata = new THREE.Mesh(tableLegGeometry, tableMaterial);
          pata.position.set(mesa.position.x, nivel.y - 0.05, mesa.position.z);
          this.scene.add(pata);
        });
      }
    });

    // --- 🎥 Render loop ---
    const animate = () => {
      requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
    };
    animate();

    // --- 🖱️ Interacción con clic ---
    this.container.nativeElement.addEventListener('click', (event: MouseEvent) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children);

      if (intersects.length > 0) {
        const objeto = intersects[0].object;
        console.log('🪑 Has hecho clic en:', objeto.userData);
      }
    });

    // --- 🔄 Ajustar en redimensionar ---
    window.addEventListener('resize', () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      this.camera.aspect = newWidth / newHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(newWidth, newHeight);
    });
  }
}
