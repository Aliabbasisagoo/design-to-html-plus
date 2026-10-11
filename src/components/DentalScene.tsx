import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function Sculpture({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const time = useRef(0);
  const { size } = useThree();
  const narrow = size.width < 768;
  const geometry = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.95, 0.8);
    s.bezierCurveTo(-1.45, 1.65, -1.05, 2.3, -0.5, 2.22);
    s.bezierCurveTo(-0.1, 2.12, 0.08, 2.12, 0.5, 2.22);
    s.bezierCurveTo(1.15, 2.35, 1.42, 1.58, 0.95, 0.8);
    s.bezierCurveTo(0.76, 0.35, 0.72, -0.7, 0.5, -1.15);
    s.bezierCurveTo(0.22, -1.65, 0.15, -0.32, 0, -0.15);
    s.bezierCurveTo(-0.16, -0.25, -0.27, -1.6, -0.54, -1.15);
    s.bezierCurveTo(-0.8, -0.7, -0.75, 0.3, -0.95, 0.8);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.72, bevelEnabled: true, bevelSegments: 12, steps: 1, bevelSize: 0.26, bevelThickness: 0.3, curveSegments: 32 });
    g.center();
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ pointer }, rawDelta) => {
    if (!group.current) return;
    const dt = Math.min(rawDelta, 0.05);
    if (!reduced) time.current += dt;
    const t = time.current;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, reduced ? -0.35 : -0.35 + Math.sin(t * 0.35) * 0.3 + pointer.x * 0.24, 3, dt);
    group.current.rotation.z = reduced ? -0.12 : -0.12 + Math.sin(t * 0.55) * 0.05;
    group.current.position.y = reduced ? 0.15 : 0.15 + Math.sin(t * 0.85) * 0.12;
  });
  return <group position={[narrow ? 0 : 2.3, 0, 0]}>
    <group ref={group} rotation={[0.08, -0.35, -0.12]}>
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial color="var(--tooth)" roughness={0.22} metalness={0.04} clearcoat={1} clearcoatRoughness={0.12} />
      </mesh>
    </group>
    <ContactShadows position={[0, -2.15, 0]} opacity={0.25} scale={8} blur={2.8} far={5} resolution={256} />
  </group>;
}

export function DentalScene() {
  const [reduced, setReduced] = useState(false);
  const [colors, setColors] = useState({ tooth: "#f6f5ed", light: "#d6e7dd" });
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const css = getComputedStyle(document.documentElement);
    setColors({ tooth: css.getPropertyValue("--scene-tooth").trim(), light: css.getPropertyValue("--scene-light").trim() });
  }, []);
  return <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.6, 9], fov: 42 }} gl={{ antialias: true, alpha: true }} aria-label="Animated ceramic dental sculpture">
    <ambientLight intensity={0.65} />
    <directionalLight position={[4, 6, 5]} intensity={2.5} color={colors.tooth} />
    <Environment resolution={128}>
      <Lightformer intensity={3} position={[-4, 4, 5]} scale={[5, 7, 1]} color={colors.tooth} />
      <Lightformer intensity={2} position={[5, 1, -2]} rotation-y={-Math.PI / 2} scale={[5, 8, 1]} color={colors.light} />
    </Environment>
    <Sculpture reduced={reduced} />
  </Canvas>;
}