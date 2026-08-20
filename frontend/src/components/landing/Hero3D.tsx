"use client"

import { useRef, useMemo, Component, ReactNode, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, RoundedBox, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useReducedMotion } from 'framer-motion'

// ─── Error boundary so a WebGL error never shows a white box ──────────────────
interface ErrorBoundaryState { hasError: boolean }
class CanvasErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() { return this.state.hasError ? this.props.fallback : this.props.children }
}

// ─── Floating document card ───────────────────────────────────────────────────
function DocumentCard({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (reducedMotion || !groupRef.current) return
    const t = state.clock.getElapsedTime()
    // Idle float
    groupRef.current.position.y = Math.sin(t / 2) * 0.12
    // Mouse parallax rotation (damped)
    groupRef.current.rotation.x += (state.pointer.y * 0.12 - groupRef.current.rotation.x) * 0.05
    groupRef.current.rotation.y += (state.pointer.x * 0.12 - groupRef.current.rotation.y) * 0.05
  })

  return (
    <group ref={groupRef}>
      <Float speed={reducedMotion ? 0 : 1.8} rotationIntensity={0.08} floatIntensity={0.18}>
        {/* Paper surface */}
        <mesh castShadow receiveShadow>
          <planeGeometry args={[2.8, 3.8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.15} metalness={0.05} side={THREE.DoubleSide} />
        </mesh>

        {/* Header accent bar */}
        <mesh position={[0, 1.55, 0.01]}>
          <planeGeometry args={[2.8, 0.28]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>

        {/* Title skeleton lines */}
        <mesh position={[-0.4, 1.15, 0.01]}>
          <planeGeometry args={[1.4, 0.10]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[-0.6, 0.95, 0.01]}>
          <planeGeometry args={[1.0, 0.07]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>

        {/* Body lines */}
        <mesh position={[0, 0.65, 0.01]}><planeGeometry args={[2.2, 0.07]} /><meshBasicMaterial color="#e2e8f0" /></mesh>
        <mesh position={[0, 0.50, 0.01]}><planeGeometry args={[2.0, 0.07]} /><meshBasicMaterial color="#e2e8f0" /></mesh>
        <mesh position={[0, 0.35, 0.01]}><planeGeometry args={[2.2, 0.07]} /><meshBasicMaterial color="#e2e8f0" /></mesh>

        {/* AI highlight region */}
        <mesh position={[0, -0.10, 0.015]}>
          <planeGeometry args={[2.4, 1.0]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.12} />
        </mesh>
        <mesh position={[-0.1, 0.05, 0.02]}><planeGeometry args={[1.8, 0.08]} /><meshBasicMaterial color="#0284c7" /></mesh>
        <mesh position={[-0.4, -0.12, 0.02]}><planeGeometry args={[1.2, 0.08]} /><meshBasicMaterial color="#0284c7" /></mesh>
        <mesh position={[0.1, -0.28, 0.02]}><planeGeometry args={[1.6, 0.08]} /><meshBasicMaterial color="#0284c7" /></mesh>

        {/* Footer lines */}
        <mesh position={[0, -0.75, 0.01]}><planeGeometry args={[2.2, 0.07]} /><meshBasicMaterial color="#e2e8f0" /></mesh>
        <mesh position={[-0.2, -0.90, 0.01]}><planeGeometry args={[1.8, 0.07]} /><meshBasicMaterial color="#e2e8f0" /></mesh>
        <mesh position={[0, -1.05, 0.01]}><planeGeometry args={[2.0, 0.07]} /><meshBasicMaterial color="#e2e8f0" /></mesh>
      </Float>
    </group>
  )
}

// ─── Decorative glass panels behind / beside the doc ─────────────────────────
function GlassPanels({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      {/* Back large panel */}
      <Float speed={reducedMotion ? 0 : 0.8} rotationIntensity={0.06} floatIntensity={0.15} position={[-0.5, 0.2, -1.8]}>
        <RoundedBox args={[4.2, 5.2, 0.05]} radius={0.2}>
          <MeshTransmissionMaterial
            backside
            samples={3}
            thickness={0.15}
            roughness={0.35}
            clearcoat={0.4}
            transmission={0.82}
            ior={1.2}
            color="#e0f2fe"
          />
        </RoundedBox>
      </Float>

      {/* Small AI-status glass card */}
      <Float speed={reducedMotion ? 0 : 1.4} rotationIntensity={0.18} floatIntensity={0.45} position={[2.0, -0.8, 0.4]}>
        <RoundedBox args={[1.9, 1.4, 0.05]} radius={0.12} castShadow>
          <MeshTransmissionMaterial
            backside
            samples={3}
            thickness={0.4}
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.08}
            transmission={0.88}
            ior={1.5}
            chromaticAberration={0.025}
            color="#ffffff"
          />
        </RoundedBox>
      </Float>

      {/* Small top-left accent card */}
      <Float speed={reducedMotion ? 0 : 1.1} rotationIntensity={0.12} floatIntensity={0.3} position={[-2.5, 1.2, -0.5]}>
        <RoundedBox args={[1.4, 0.9, 0.04]} radius={0.1}>
          <MeshTransmissionMaterial
            backside
            samples={2}
            thickness={0.1}
            roughness={0.4}
            transmission={0.75}
            ior={1.15}
            color="#bae6fd"
          />
        </RoundedBox>
      </Float>
    </>
  )
}

// ─── Subtle floating particles ────────────────────────────────────────────────
function FloatingParticles({ count = 24, reducedMotion }: { count?: number; reducedMotion: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      t: Math.random() * 100,
      factor: 15 + Math.random() * 60,
      speed: 0.006 + Math.random() / 250,
      xFactor: -4 + Math.random() * 8,
      yFactor: -4 + Math.random() * 8,
      zFactor: -1.5 + Math.random() * 3,
    }))
  }, [count])

  useFrame(() => {
    if (reducedMotion || !mesh.current) return
    particles.forEach((p, i) => {
      p.t += p.speed
      const { t, factor, xFactor, yFactor, zFactor } = p
      dummy.position.set(
        xFactor + Math.cos((t / 10) * factor) + Math.sin(t) * factor * 0.08,
        yFactor + Math.sin((t / 10) * factor) + Math.cos(t * 1.5) * factor * 0.08,
        zFactor + Math.cos((t / 8) * factor)
      )
      const s = 0.4 + Math.abs(Math.cos(t)) * 0.6
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.025, 6, 6]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
    </instancedMesh>
  )
}

// ─── Scene content (runs inside Canvas) ───────────────────────────────────────
function SceneContent({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      {/* Lighting — all local, no remote HDR fetch */}
      <ambientLight intensity={0.75} />
      <hemisphereLight args={['#e0f2fe', '#1e3a5f', 0.9]} />
      <directionalLight position={[8, 10, 8]} intensity={1.4} color="#ffffff" castShadow />
      <directionalLight position={[-8, -6, -4]} intensity={0.5} color="#7dd3fc" />
      <pointLight position={[0, 0, 5]} intensity={0.6} color="#38bdf8" />

      <group position={[0, -0.3, 0]}>
        <DocumentCard reducedMotion={reducedMotion} />
        <GlassPanels reducedMotion={reducedMotion} />
        <FloatingParticles count={24} reducedMotion={reducedMotion} />
      </group>
    </>
  )
}

// ─── CSS-only fallback rendered when WebGL is unavailable ────────────────────
function CSSFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="glass-hero-panel rounded-[28px] p-10 max-w-md w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] to-cyan-500/[0.03] rounded-[28px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
              <div className="w-3 h-3 rounded-full bg-green-400/60" />
            </div>
            <span className="text-xs font-medium text-muted-foreground/60">Clerkly AI Workspace</span>
          </div>
          <div className="paper-surface rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary/40" />
              <div className="h-2 w-32 rounded bg-slate-200" />
            </div>
            <div className="h-1.5 w-full rounded bg-slate-100" />
            <div className="h-1.5 w-4/5 rounded bg-slate-100" />
            <div className="h-8 w-full rounded-lg bg-primary/[0.08] border border-primary/10" />
            <div className="h-1.5 w-3/5 rounded bg-slate-100" />
          </div>
          <div className="glass-surface rounded-xl p-4 text-xs font-medium text-primary">
            ✦ Clerkly AI — Analyzing document…
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function Hero3D() {
  const shouldReduceMotion = useReducedMotion() ?? false

  return (
    <CanvasErrorBoundary fallback={<CSSFallback />}>
      <div className="w-full h-full">
        <Canvas
          camera={{ position: [0, 0, 7.5], fov: 44 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <SceneContent reducedMotion={shouldReduceMotion} />
          </Suspense>
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  )
}
