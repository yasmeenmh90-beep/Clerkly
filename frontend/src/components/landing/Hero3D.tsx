"use client"

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, ContactShadows, RoundedBox, MeshTransmissionMaterial, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useReducedMotion } from 'framer-motion'

function DocumentCard({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (reducedMotion) return
    const t = state.clock.getElapsedTime()
    if (groupRef.current) {
      // Subtle floating and rotation
      groupRef.current.position.y = Math.sin(t / 2) * 0.1
      groupRef.current.rotation.x = Math.sin(t / 3) * 0.05
      groupRef.current.rotation.y = Math.cos(t / 4) * 0.05
      
      // Mouse parallax
      groupRef.current.rotation.x += (state.pointer.y * 0.1 - groupRef.current.rotation.x) * 0.1
      groupRef.current.rotation.y += (state.pointer.x * 0.1 - groupRef.current.rotation.y) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <Float speed={reducedMotion ? 0 : 2} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* Main Paper Surface */}
        <mesh castShadow receiveShadow>
          <planeGeometry args={[2.8, 3.8]} />
          <meshStandardMaterial 
            color="#ffffff" 
            roughness={0.1}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Header line */}
        <mesh position={[0, 1.4, 0.01]}>
          <planeGeometry args={[2.2, 0.15]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>

        {/* Content lines */}
        <mesh position={[-0.4, 0.9, 0.01]}>
          <planeGeometry args={[1.4, 0.1]} />
          <meshBasicMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[-0.2, 0.6, 0.01]}>
          <planeGeometry args={[1.8, 0.1]} />
          <meshBasicMaterial color="#cbd5e1" />
        </mesh>

        {/* AI Highlight area */}
        <mesh position={[0, -0.2, 0.015]}>
          <planeGeometry args={[2.4, 1.2]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.15} />
        </mesh>
        
        {/* Highlighted text line 1 */}
        <mesh position={[-0.2, -0.1, 0.02]}>
          <planeGeometry args={[1.6, 0.1]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
        {/* Highlighted text line 2 */}
        <mesh position={[-0.5, -0.4, 0.02]}>
          <planeGeometry args={[1.0, 0.1]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>

        {/* Bottom lines */}
        <mesh position={[-0.4, -1.2, 0.01]}>
          <planeGeometry args={[1.4, 0.1]} />
          <meshBasicMaterial color="#cbd5e1" />
        </mesh>
      </Float>
    </group>
  )
}

function GlassPanels({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      {/* Front small glass panel (AI indicator) */}
      <Float speed={reducedMotion ? 0 : 1.5} rotationIntensity={0.2} floatIntensity={0.5} position={[1.5, -1, 0.5]}>
        <RoundedBox args={[1.8, 1.2, 0.05]} radius={0.1} castShadow>
          <MeshTransmissionMaterial 
            backside
            samples={4}
            thickness={0.5}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transmission={0.9}
            ior={1.5}
            chromaticAberration={0.03}
            color="#ffffff"
          />
        </RoundedBox>
        {/* Text on glass */}
        <Text
          position={[-0.6, 0.3, 0.03]}
          fontSize={0.12}
          color="#0f172a"
          anchorX="left"
          anchorY="middle"
          fontWeight="bold"
        >
          ✦ Clerkly AI
        </Text>
        <Text
          position={[-0.6, 0.05, 0.03]}
          fontSize={0.08}
          color="#0ea5e9"
          anchorX="left"
          anchorY="middle"
        >
          Analyzing document...
        </Text>
        
        <Text position={[-0.6, -0.2, 0.03]} fontSize={0.07} color="#10b981" anchorX="left">
          ✓ Document verified
        </Text>
        <Text position={[-0.6, -0.35, 0.03]} fontSize={0.07} color="#10b981" anchorX="left">
          ✓ Information extracted
        </Text>
      </Float>

      {/* Back large glass panel */}
      <Float speed={reducedMotion ? 0 : 1} rotationIntensity={0.1} floatIntensity={0.2} position={[-0.5, 0.2, -1.5]}>
        <RoundedBox args={[4, 5, 0.05]} radius={0.2} receiveShadow>
          <MeshTransmissionMaterial 
            backside
            samples={4}
            thickness={0.2}
            roughness={0.3}
            clearcoat={0.5}
            transmission={0.8}
            ior={1.2}
            color="#e0f2fe"
          />
        </RoundedBox>
      </Float>
    </>
  )
}

function FloatingParticles({ count = 30, reducedMotion }: { count?: number, reducedMotion: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100
      const factor = 20 + Math.random() * 100
      const speed = 0.01 + Math.random() / 200
      const xFactor = -5 + Math.random() * 10
      const yFactor = -5 + Math.random() * 10
      const zFactor = -2 + Math.random() * 4
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 })
    }
    return temp
  }, [count])

  useFrame((state) => {
    if (reducedMotion || !mesh.current) return
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle
      t = particle.t += speed / 2
      const a = Math.cos(t) + Math.sin(t * 1) / 10
      const b = Math.sin(t) + Math.cos(t * 2) / 10
      const s = Math.cos(t)
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      )
      dummy.scale.set(s, s, s)
      dummy.rotation.set(s * 5, s * 5, s * 5)
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshBasicMaterial color="#0ea5e9" transparent opacity={0.4} />
    </instancedMesh>
  )
}

export default function Hero3D() {
  const shouldReduceMotion = useReducedMotion() ?? false

  return (
    <div className="w-full h-full relative z-10 pointer-events-auto">
      <Canvas 
        camera={{ position: [0, 0, 7], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#0ea5e9" />
        <pointLight position={[0, 0, 5]} intensity={0.5} color="#38bdf8" />
        
        <group position={[0, -0.5, 0]}>
          <DocumentCard reducedMotion={shouldReduceMotion} />
          <GlassPanels reducedMotion={shouldReduceMotion} />
          <FloatingParticles count={30} reducedMotion={shouldReduceMotion} />
        </group>
        
        <Environment preset="city" />
        <ContactShadows 
          position={[0, -3.5, 0]} 
          opacity={0.3} 
          scale={15} 
          blur={2.5} 
          far={5} 
          color="#0f172a"
        />
      </Canvas>
    </div>
  )
}
