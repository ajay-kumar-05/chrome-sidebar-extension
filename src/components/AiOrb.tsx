import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import type { Mesh } from 'three';

interface Props {
  /** When true (model is streaming), the orb spins faster and distorts more. */
  active?: boolean;
  className?: string;
}

/** The animated blob mesh. Speeds up and morphs harder while `active`. */
function OrbMesh({ active }: { active: boolean }) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * (active ? 0.9 : 0.25);
    ref.current.rotation.x += delta * (active ? 0.35 : 0.1);
  });
  return (
    <mesh ref={ref} scale={1.7}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        color={active ? '#a78bfa' : '#8b5cf6'}
        distort={active ? 0.6 : 0.38}
        speed={active ? 4.5 : 1.6}
        roughness={0.15}
        metalness={0.45}
      />
    </mesh>
  );
}

/**
 * A small WebGL "AI orb" rendered with react-three-fiber. Transparent canvas,
 * so it sits over any background. Used as the brand mark and welcome hero.
 */
export default function AiOrb({ active = false, className }: Props) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 3.4], fov: 45 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[3, 3, 4]} intensity={2.4} color="#c4b5fd" />
        <pointLight position={[-3, -2, -2]} intensity={2.2} color="#6366f1" />
        <OrbMesh active={active} />
      </Canvas>
    </div>
  );
}
