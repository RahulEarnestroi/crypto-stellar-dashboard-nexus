import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function AnimatedSphere() {
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1, 100, 200]} scale={2}>
      <MeshDistortMaterial
        color="#00FFFF"
        attach="material"
        distort={0.3}
        speed={1.5}
        roughness={0}
        transparent
        opacity={0.1}
      />
    </Sphere>
  );
}

function Particles() {
  const points = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.x = state.clock.elapsedTime * 0.05;
      points.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const particlesPosition = new Float32Array(5000 * 3);
  
  for (let i = 0; i < 5000; i++) {
    particlesPosition[i * 3] = (Math.random() - 0.5) * 20;
    particlesPosition[i * 3 + 1] = (Math.random() - 0.5) * 20;
    particlesPosition[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#00FFFF" transparent opacity={0.6} />
    </points>
  );
}

export function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00FFFF" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8A2BE2" />
        
        <AnimatedSphere />
        <Particles />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}