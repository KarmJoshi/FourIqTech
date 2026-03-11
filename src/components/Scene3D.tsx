import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function CyberAvatar() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

      // Mouse look-at effect
      const { x, y } = state.mouse;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.5, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * 0.5, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Head */}
        <mesh position={[0, 0.5, 0]} scale={1.2}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial
            color="#f4e4bc"
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0}
            metalness={1}
            roughness={0.05}
            distort={0.4}
            speed={3}
          />
        </mesh>

        {/* Neck */}
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[0.3, 0.5, 1, 32]} />
          <meshStandardMaterial
            color="#b8860b"
            roughness={0.1}
            metalness={1}
          />
        </mesh>

        {/* Torso/Shoulders - Abstract geometric shape */}
        <mesh position={[0, -2, 0]}>
          <coneGeometry args={[2.5, 2.5, 6, 1]} />
          <meshStandardMaterial
            color="#b8860b"
            roughness={0.2}
            metalness={1}
            flatShading
          />
        </mesh>

        {/* Halo / Rings */}
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.02, 16, 64]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
        </mesh>
      </Float>
    </group>
  );
}

function FloatingParticles() {
  const count = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
      ref.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#daa520"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Rig() {
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.5, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 0.5, 0.03);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Scene3D() {
  return (
    <div className="absolute inset-0 -z-0">
      <Canvas
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 1.5]} // Cap DPI to save GPU
        style={{ background: 'transparent' }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />

        {/* Realistic Studio Lighting Environment - Cleaner, no city reflections */}
        <Environment preset="studio" />

        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#daa520" />

        <CyberAvatar />
        <FloatingParticles />
        <Rig />

        <ContactShadows
          position={[0, -3, 0]}
          opacity={0.4}
          scale={20}
          blur={2.5}
          far={4.5}
          color="#000000"
          frames={1} // Bake shadows once
        />
      </Canvas>
    </div>
  );
}
