import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const LiquidPortalCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 180;
    const height = container.clientHeight || 180;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Torus Knot for fluid 3D glass shape
    const geometry = new THREE.TorusKnotGeometry(0.85, 0.28, 128, 32);
    
    // Liquid Glass Material with Physical Specularity
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.15,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      thickness: 1.2,
      ior: 1.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      wireframe: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Inner Glowing Core Sphere
    const coreGeo = new THREE.SphereGeometry(0.45, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0xec4899,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 3, 10);
    pointLight1.position.set(3, 3, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xec4899, 2.5, 10);
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      mesh.rotation.x = elapsedTime * 0.35;
      mesh.rotation.y = elapsedTime * 0.45;

      coreMesh.position.y = Math.sin(elapsedTime * 1.8) * 0.08;
      coreMesh.scale.setScalar(1 + Math.sin(elapsedTime * 2.5) * 0.05);

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full min-w-[170px] min-h-[170px] flex items-center justify-center" />;
};
