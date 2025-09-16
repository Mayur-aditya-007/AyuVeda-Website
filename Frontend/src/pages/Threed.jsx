// src/pages/Threed.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Robust Threed.jsx debugger-friendly version
 * - modelPath default: /models/tree.gltf (public/models/tree.gltf)
 * - black background
 * - does quick fetch check before loader to produce clear 404/CORS messages
 * - shows fallback rotating sphere if model fails
 * - stronger lights + helpers for visibility
 */

export default function Threed({ modelPath = "/models/tree.gltf", className = "" }) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const [loadingProgress, setLoadingProgress] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Quick network check for the model file to give immediate, clear errors
    let aborted = false;
    (async () => {
      try {
        setErrorMsg(null);
        setLoadingProgress(0);
        const res = await fetch(modelPath, { method: "HEAD" });
        if (!res.ok) {
          setErrorMsg(`Model not found: ${modelPath} (HTTP ${res.status})`);
          console.error("Model HEAD failed:", res);
        } else {
          // OK
        }
      } catch (err) {
        console.error("Network error checking model:", err);
        setErrorMsg(`Model network error: ${err.message}`);
      }
    })();

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 1); // black
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.05, 2000);
    camera.position.set(0, 1.2, 2.8);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.autoRotate = false;
    controls.target.set(0, 0.8, 0);

    // Lights — stronger so things are visible
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.8);
    hemi.position.set(0, 1, 0);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(3, 6, 2);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    const d = 6;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 50;
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    // Fill light
    const fill = new THREE.DirectionalLight(0xffffff, 0.2);
    fill.position.set(-3, -1, -2);
    scene.add(fill);

    // Helpers (visible for debugging)
    const dirLightHelper = new THREE.DirectionalLightHelper(sun, 1, 0xffaa00);
    dirLightHelper.visible = true;
    scene.add(dirLightHelper);

    const axes = new THREE.AxesHelper(1.4);
    axes.visible = false; // set true if you need axes
    scene.add(axes);

    // Ground receiving shadows (subtle)
    const groundGeo = new THREE.PlaneGeometry(40, 40);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Fallback test object (rotating sphere) — shown until model successfully loads
    const fallbackGroup = new THREE.Group();
    const fallbackGeo = new THREE.SphereGeometry(0.45, 32, 32);
    const fallbackMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.6, metalness: 0.05 });
    const fallbackMesh = new THREE.Mesh(fallbackGeo, fallbackMat);
    fallbackMesh.castShadow = true;
    fallbackMesh.receiveShadow = true;
    fallbackGroup.add(fallbackMesh);
    fallbackGroup.position.y = 0.45;
    scene.add(fallbackGroup);

    // GLTF Loader
    const loader = new GLTFLoader();
    setLoadingProgress(0);

    loader.load(
      modelPath,
      (gltf) => {
        if (aborted) return;
        const model = gltf.scene || gltf.scenes?.[0];
        if (!model) {
          setErrorMsg("GLTF loaded but contains no scene.");
          setLoadingProgress(null);
          return;
        }

        // center + scale
        const bbox = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = (1.0 / maxDim) * 1.6;
        model.scale.setScalar(scale);

        const bbox2 = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        bbox2.getCenter(center);
        model.position.x -= center.x;
        model.position.z -= center.z;
        const minY = bbox2.min.y;
        model.position.y -= minY;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material && child.material.side === undefined) child.material.side = THREE.FrontSide;
          }
        });

        scene.add(model);
        setModelLoaded(true);
        setLoadingProgress(100);
        setErrorMsg(null);

        // remove fallback
        scene.remove(fallbackGroup);

        // optionally fit camera to object (simple approach)
        const newBbox = new THREE.Box3().setFromObject(model);
        const newSize = new THREE.Vector3();
        newBbox.getSize(newSize);
        const maxSize = Math.max(newSize.x, newSize.y, newSize.z);
        const fitDistance = maxSize / (2 * Math.tan((Math.PI * camera.fov) / 360));
        const direction = new THREE.Vector3(0, 0, 1);
        camera.position.copy(direction.multiplyScalar(fitDistance * 1.2).add(new THREE.Vector3(0, newSize.y * 0.6, 0)));
        controls.update();
      },
      (xhr) => {
        if (xhr && xhr.loaded && xhr.total) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadingProgress(pct === 100 ? 99 : pct);
        }
      },
      (err) => {
        console.error("GLTFLoader error:", err);
        setErrorMsg(`Failed to load model: ${err.message || err}`);
        setLoadingProgress(null);
      }
    );

    // Resize handling
    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", onResize);

    // Animation loop
    let rafId = null;
    const tick = (t) => {
      // rotate fallback slowly if model not loaded
      if (!modelLoaded) {
        fallbackGroup.rotation.y += 0.006;
        fallbackGroup.rotation.x = Math.sin(t / 3000) * 0.02;
      }
      controls.update();
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    tick();

    // Expose for debugging
    // window.__three_scene = scene; window.__three_camera = camera;

    // cleanup
    return () => {
      aborted = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      // dispose scene objects
      scene.traverse((obj) => {
        try {
          if (obj.geometry) obj.geometry.dispose && obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose && m.dispose());
            else obj.material.dispose && obj.material.dispose();
          }
        } catch (e) {
          // ignore disposal errors
        }
      });
      renderer.dispose();
      if (renderer.domElement && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [modelPath, modelLoaded]);

  return (
    <div className={`w-full h-screen relative ${className}`}>
      <div ref={mountRef} className="w-full h-full" style={{ minHeight: 400 }} />

      {/* Loading/progress UI */}
      {loadingProgress !== null && loadingProgress < 100 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            fontWeight: 600,
            zIndex: 60
          }}
        >
          Loading model... {loadingProgress}%
        </div>
      )}

      {/* Error UI */}
      {errorMsg && (
        <div
          role="alert"
          style={{
            position: "absolute",
            left: 12,
            top: 12,
            padding: "10px 12px",
            borderRadius: 8,
            background: "rgba(255,80,80,0.12)",
            color: "#ffb3b3",
            border: "1px solid rgba(255,80,80,0.18)",
            zIndex: 70,
            maxWidth: "min(80%, 520px)"
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Model load error</div>
          <div style={{ fontSize: 13, lineHeight: 1.25 }}>{errorMsg}</div>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>
            Check that <code>{modelPath}</code> exists in <code>public/models</code> and that the dev server was restarted after adding it.
            Open DevTools → Network to inspect the request.
          </div>
        </div>
      )}
    </div>
  );
}
