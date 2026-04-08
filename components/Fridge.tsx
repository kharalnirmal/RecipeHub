"use client";

import { useEffect, useRef, useState, forwardRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { getIngredientById, INGREDIENTS } from "@/lib/ingredients";

type FridgeProps = {
  selectedIds: string[];
};

export type FridgeHandle = {
  openDoor: () => void;
};

const Fridge = forwardRef<FridgeHandle, FridgeProps>(({ selectedIds }, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const addSphereRef = useRef<((id: string, category: string) => void) | null>(
    null,
  );
  const removeSphereRef = useRef<((id: string) => void) | null>(null);
  const openDoorRef = useRef<(() => void) | null>(null);
  const selectedPrevRef = useRef<string[]>([]);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const hasSeenHint =
      window.sessionStorage.getItem("fridgeai-fridge-click-hint-seen") === "1";
    setShowHint(!hasSeenHint);
  }, []);

  // Expose the openDoor method via ref
  useEffect(() => {
    if (!openDoorRef.current || !ref) return;
    if (typeof ref === "function") {
      ref({ openDoor: openDoorRef.current });
    } else {
      ref.current = { openDoor: openDoorRef.current };
    }
  }, [ref]);

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
    const bgFromTheme = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-background")
      .trim();
    scene.background = new THREE.Color(bgFromTheme || "#fffdf7");

    // ── CAMERA ─────────────────────────────────────────────
    const { w: width, h: height } = getSafeSize(mount);
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5.2);

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
        transparent: true,
        opacity: 0.42,
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

    function openDoor() {
      if (isDoorOpen) return;
      window.sessionStorage.setItem("fridgeai-fridge-click-hint-seen", "1");
      setShowHint(false);
      isDoorOpen = true;

      ingredientItems.forEach((item) => {
        const baseZ =
          typeof item.userData.baseZ === "number" ? item.userData.baseZ : 0.2;
        gsap.to(item.position, {
          z: isDoorOpen ? baseZ + 0.42 : baseZ,
          duration: isDoorOpen ? 0.55 : 0.45,
          ease: isDoorOpen ? "power2.out" : "power2.inOut",
          overwrite: true,
        });
      });

      gsap.to(doorGroup.rotation, {
        y: -Math.PI / 2,
        duration: 0.8,
        ease: "power2.out",
      });
    }

    function toggleDoor() {
      window.sessionStorage.setItem("fridgeai-fridge-click-hint-seen", "1");
      setShowHint(false);
      isDoorOpen = !isDoorOpen;

      ingredientItems.forEach((item) => {
        const baseZ =
          typeof item.userData.baseZ === "number" ? item.userData.baseZ : 0.2;
        gsap.to(item.position, {
          z: isDoorOpen ? baseZ + 0.42 : baseZ,
          duration: isDoorOpen ? 0.55 : 0.45,
          ease: isDoorOpen ? "power2.out" : "power2.inOut",
          overwrite: true,
        });
      });

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

    function handleClick() {
      toggleDoor();
    }

    mount.addEventListener("click", handleClick);
    openDoorRef.current = openDoor;

    // ── INGREDIENT ITEMS ───────────────────────────────────
    const categoryColors: Record<string, string> = {
      protein: "#ff6b6b",
      vegetable: "#6bcb77",
      dairy: "#fff8ee",
      spice: "#ffd93d",
      grain: "#ffb347",
    };

    const ingredientItems = new Map<string, THREE.Group>();
    const slotById = new Map<string, number>();
    const shelfSlots: Array<[number, number, number]> = [
      [-0.62, 0.45, 0.22],
      [0, 0.45, 0.22],
      [0.62, 0.45, 0.22],
      [-0.62, -0.05, 0.2],
      [0, -0.05, 0.2],
      [0.62, -0.05, 0.2],
      [-0.62, -0.58, 0.18],
      [0, -0.58, 0.18],
      [0.62, -0.58, 0.18],
      [-0.35, -0.95, 0.16],
      [0.35, -0.95, 0.16],
      [0, -1.2, 0.14],
    ];

    const getStableIndex = (id: string) => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
      }
      return hash % shelfSlots.length;
    };

    const pickSlotIndex = (id: string) => {
      if (slotById.has(id)) {
        return slotById.get(id)!;
      }

      const preferred = getStableIndex(id);
      const used = new Set(slotById.values());

      if (!used.has(preferred)) {
        slotById.set(id, preferred);
        return preferred;
      }

      for (let i = 0; i < shelfSlots.length; i++) {
        if (!used.has(i)) {
          slotById.set(id, i);
          return i;
        }
      }

      slotById.set(id, preferred);
      return preferred;
    };

    function createEmojiSprite(emoji: string) {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font =
          '84px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(emoji, canvas.width / 2, canvas.height / 2 + 2);
      }

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(0.34, 0.34, 0.34);
      sprite.position.set(0, 0.2, 0.09);
      return sprite;
    }

    function addIngredientSphere(id: string, category: string) {
      const item = new THREE.Group();
      const body = new THREE.Mesh(
        new RoundedBoxGeometry(0.28, 0.2, 0.2, 3, 0.05),
        new THREE.MeshStandardMaterial({
          color: categoryColors[category] || "#ffffff",
          emissive: categoryColors[category] || "#ffffff",
          emissiveIntensity: 0.12,
          roughness: 0.55,
          metalness: 0.0,
        }),
      );

      const ingredient = getIngredientById(id);
      const emojiSprite = createEmojiSprite(ingredient?.emoji ?? "🍽️");
      item.add(body);
      item.add(emojiSprite);

      const slotIndex = pickSlotIndex(id);
      const [x, y, z] = shelfSlots[slotIndex];
      item.position.set(x, y, z);
      item.userData.baseZ = z;

      scene.add(item);
      ingredientItems.set(id, item);

      item.scale.set(0, 0, 0);
      gsap.to(item.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
      });

      gsap.to(item.position, {
        y: item.position.y + 0.06,
        duration: 1.2 + Math.random() * 0.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    function removeIngredientSphere(id: string) {
      const item = ingredientItems.get(id);
      if (!item) return;

      gsap.to(item.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => {
          scene.remove(item);
          item.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
              obj.geometry.dispose();
              if (Array.isArray(obj.material)) {
                obj.material.forEach((mat) => mat.dispose());
              } else {
                obj.material.dispose();
              }
            }

            if (obj instanceof THREE.Sprite) {
              obj.material.map?.dispose();
              obj.material.dispose();
            }
          });
          ingredientItems.delete(id);
          slotById.delete(id);
        },
      });
    }

    addSphereRef.current = addIngredientSphere;
    removeSphereRef.current = removeIngredientSphere;

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
      addSphereRef.current = null;
      removeSphereRef.current = null;
      openDoorRef.current = null;
      selectedPrevRef.current = [];
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

  useEffect(() => {
    if (!addSphereRef.current || !removeSphereRef.current) return;

    const prevSet = new Set(selectedPrevRef.current);
    const nextSet = new Set(selectedIds);

    // Items that were just selected (newly added to selectedIds)
    const newlySelected = selectedIds.filter((id) => !prevSet.has(id));

    // Items that were just deselected (removed from selectedIds)
    const newlyDeselected = selectedPrevRef.current.filter(
      (id) => !nextSet.has(id),
    );

    // Remove newly selected items from fridge
    for (const id of newlySelected) {
      removeSphereRef.current(id);
    }

    // Add back newly deselected items to fridge
    for (const id of newlyDeselected) {
      const ingredient = getIngredientById(id);
      if (ingredient) {
        addSphereRef.current(id, ingredient.category);
      }
    }

    // If any items were newly selected, open the door
    if (newlySelected.length > 0 && openDoorRef.current) {
      openDoorRef.current();
    }

    selectedPrevRef.current = [...selectedIds];
  }, [selectedIds]);

  // Initialize fridge with all ingredients on mount
  useEffect(() => {
    if (!addSphereRef.current) return;

    // Wait one frame to ensure mounted
    const timer = setTimeout(() => {
      for (const ingredient of INGREDIENTS) {
        addSphereRef.current?.(ingredient.id, ingredient.category);
      }
      selectedPrevRef.current = [];
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-[440px] md:h-[520px]">
      {showHint && (
        <div className="top-3 left-3 z-10 absolute bg-surface/95 px-3 py-2 border border-border rounded-lg pointer-events-none">
          <p className="font-medium text-text-secondary text-xs">
            Tip: click the fridge to open the door
          </p>
        </div>
      )}
      <div
        ref={mountRef}
        className="rounded-lg w-full h-full overflow-hidden"
      />
    </div>
  );
});

Fridge.displayName = "Fridge";

export default Fridge;
