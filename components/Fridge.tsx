"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export default function Fridge() {
  const mountRef = useRef<HTMLDivElement>(null);

  const getSafeSize = (el: HTMLDivElement) => {
    const w = Math.max(el.clientWidth, 320);
    const h = Math.max(el.clientHeight, 420);
    return { w, h };
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── SCENE ──────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#fffdf7"); // warm cream

    // ── CAMERA ─────────────────────────────────────────────
    const { w: width, h: height } = getSafeSize(mount);
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 6);

    // ── RENDERER ───────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // ── ORBIT CONTROLS ─────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.maxPolarAngle = Math.PI / 1.8;

    // ── LIGHTS ─────────────────────────────────────────────
    // Warm golden lighting — cozy kitchen feel
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 0.9);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffcba4, 1.0);
    mainLight.position.set(3, 5, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffd6e0, 0.4);
    fillLight.position.set(-3, -2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffecd2, 0.4);
    rimLight.position.set(0, 3, -5);
    scene.add(rimLight);

    // ── FRIDGE BODY ────────────────────────────────────────
    // RoundedBoxGeometry(w, h, d, segments, cornerRadius)
    // segments: how smooth the rounding is (4 = enough)
    // cornerRadius: 0.12 = subtle cute rounding
    const fridgeBody = new THREE.Mesh(
      new RoundedBoxGeometry(2, 3, 1.5, 4, 0.12),
      new THREE.MeshStandardMaterial({
        color: "#fce4ec", // soft pink — playful and cute
        roughness: 0.85,
        metalness: 0.0,
      }),
    );
    scene.add(fridgeBody);

    // ── FREEZER DOOR ───────────────────────────────────────
    const freezerDoor = new THREE.Mesh(
      new RoundedBoxGeometry(2.05, 0.85, 0.12, 4, 0.1),
      new THREE.MeshStandardMaterial({
        color: "#f8bbd0", // slightly deeper pink
        roughness: 0.8,
        metalness: 0.0,
      }),
    );
    freezerDoor.position.set(0, 1.08, 0.76);
    scene.add(freezerDoor);

    // ── DOOR GROUP ─────────────────────────────────────────
    const doorGroup = new THREE.Group();
    doorGroup.position.set(-1.025, -0.45, 0.76);

    const fridgeDoor = new THREE.Mesh(
      new RoundedBoxGeometry(2.05, 2.1, 0.12, 4, 0.1),
      new THREE.MeshStandardMaterial({
        color: "#f8bbd0",
        roughness: 0.8,
        metalness: 0.0,
      }),
    );
    fridgeDoor.position.set(1.025, 0, 0);
    doorGroup.add(fridgeDoor);

    // ── HANDLE ─────────────────────────────────────────────
    const handle = new THREE.Mesh(
      new RoundedBoxGeometry(0.08, 0.7, 0.08, 4, 0.04),
      new THREE.MeshStandardMaterial({
        color: "#ff6b6b", // coral handle — pops nicely
        roughness: 0.5,
        metalness: 0.1,
      }),
    );
    handle.position.set(1.8, 0, 0.1);
    doorGroup.add(handle);

    scene.add(doorGroup);

    // ── STICKERS ON DOOR ───────────────────────────────────
    // TextureLoader: loads image files as Three.js textures
    // We load real PNG sticker images from /public/stickers/
    const textureLoader = new THREE.TextureLoader();

    // Helper: creates one sticker plane with a loaded texture
    function createSticker(
      imagePath: string,
      size: number,
      x: number,
      y: number,
      rotZ: number,
    ) {
      const texture = textureLoader.load(imagePath);
      // load() is async — Three.js shows it when ready
      // No need to await — renderer keeps running and shows
      // sticker as soon as texture finishes loading

      const sticker = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true, // PNG transparency works
          depthWrite: false,
          polygonOffset: true, // enable the offset
          polygonOffsetFactor: -1, // push toward camera slightly
          polygonOffsetUnits: -1, // GPU-level — not world units
          // This is how decals work in real games
          // Sticker tells GPU: "I'm on a surface, don't fight me" // prevents z-fighting flicker
          // z-fighting: two surfaces at same depth fighting
          // to be "in front" — causes ugly flickering
        }),
      );

      // z: 0.83 = just in front of door face (door is at z=0.76)
      // Small gap prevents z-fighting with door surface
      sticker.position.set(x, y, 0.06);
      sticker.rotation.z = rotZ; // slight tilt = natural sticker feel
      return sticker;
    }

    // All stickers go on doorGroup so they move with the door
    // [imagePath, size, x, y, rotationZ]
    // x and y are relative to doorGroup origin (left hinge edge)
    // so x=1.0 = center of door, x=1.7 = right side of door
    const stickerData: [string, number, number, number, number][] = [
      // [path, size, x, y, rotZ]
      // x must be between 0.25 and 1.8  (inside door width)
      // y must be between -0.85 and 0.85 (inside door height)
      ["/stickers/strawberry.png", 0.32, 0.4, 0.6, 0.2],
      ["/stickers/avocado.png", 0.3, 1.4, 0.5, -0.15],
      ["/stickers/lemon.png", 0.28, 0.7, -0.2, 0.1],
      ["/stickers/flower.png", 0.34, 1.5, -0.4, -0.2],
      ["/stickers/cherry.png", 0.28, 0.5, -0.7, 0.15],
      ["/stickers/peach.png", 0.3, 1.2, 0.1, 0.1],
      ["/stickers/leaf.png", 0.26, 0.9, 0.3, -0.1],
    ];

    stickerData.forEach(([path, size, x, y, rot]) => {
      const sticker = createSticker(path, size, x, y, rot);
      doorGroup.add(sticker);
      // Added to doorGroup — moves with door when it opens
    });

    // ── DOOR STATE ─────────────────────────────────────────
    let isDoorOpen = false;

    function handleClick() {
      isDoorOpen = !isDoorOpen;

      if (isDoorOpen) {
        gsap.to(doorGroup.rotation, {
          y: -Math.PI / 2,
          duration: 0.8,
          ease: "power2.out",
        });
      } else {
        gsap.to(doorGroup.rotation, {
          y: 0,
          duration: 0.6,
          ease: "power2.inOut",
        });
      }
    }

    mount.addEventListener("click", handleClick);

    // ── INGREDIENT SPHERES ─────────────────────────────────
    const categoryColors: Record<string, string> = {
      protein: "#ff6b6b",
      vegetable: "#6bcb77",
      dairy: "#fff8ee",
      spice: "#ffd93d",
      grain: "#ffb347",
    };

    const ingredientSpheres = new Map<string, THREE.Mesh>();

    function addIngredientSphere(id: string, category: string) {
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        new THREE.MeshStandardMaterial({
          color: categoryColors[category] || "#ffffff",
          emissive: categoryColors[category] || "#ffffff",
          emissiveIntensity: 0.2,
          roughness: 0.4,
          metalness: 0.0,
        }),
      );

      sphere.position.set(
        (Math.random() - 0.5) * 1.4,
        (Math.random() - 0.5) * 2.2,
        (Math.random() - 0.5) * 0.8,
      );

      scene.add(sphere);
      ingredientSpheres.set(id, sphere);

      sphere.scale.set(0, 0, 0);
      gsap.to(sphere.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
      });

      gsap.to(sphere.position, {
        y: sphere.position.y + 0.12,
        duration: 1.5 + Math.random(),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    function removeIngredientSphere(id: string) {
      const sphere = ingredientSpheres.get(id);
      if (!sphere) return;

      gsap.to(sphere.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => {
          scene.remove(sphere);
          sphere.geometry.dispose();
          if (sphere.material instanceof THREE.Material) {
            sphere.material.dispose();
          }
          ingredientSpheres.delete(id);
        },
      });
    }

    // ── RESIZE ─────────────────────────────────────────────
    function handleResize() {
      if (!mount) return;
      const { w, h } = getSafeSize(mount);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(window.devicePixelRatio);
    }

    window.addEventListener("resize", handleResize);

    // ── ANIMATION LOOP ─────────────────────────────────────
    let animationId: number;

    function animate() {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // ── CLEANUP ────────────────────────────────────────────
    return () => {
      window.removeEventListener("resize", handleResize);
      mount.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationId);
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-[min(92vw,560px)] h-[min(75vh,700px)] min-h-[500px]"
    />
  );
}
