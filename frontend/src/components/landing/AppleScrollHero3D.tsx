"use client"

import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Float, ContactShadows, RoundedBox } from '@react-three/drei'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import * as THREE from 'three'
import { CheckCircle2, FileText, Upload, Brain, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// ─── 3D Document & Workspace Component ─────────────────────────────

function DocumentScene({ scrollYProgress }: { scrollYProgress: any }) {
  const docRef = useRef<THREE.Group>(null)
  const scanLineRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  useFrame((state) => {
    const t = scrollYProgress.get()
    
    // Smooth camera movement based on scroll
    // Stage 1 (Intro): z=8
    // Stage 7 (Done): z=5, slightly lower y
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 8 - t * 3, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1 - t * 0.5, 0.05)
    camera.lookAt(0, 0, 0)

    if (docRef.current) {
      // Intro: Tilted, off-screen bottom
      // Stage 2 (Upload): Slides up, levels out
      // Stage 7: Settles
      const targetY = t < 0.1 ? -5 : (t < 0.8 ? 0 : -0.2)
      const targetRotX = t < 0.1 ? -Math.PI / 4 : (t < 0.8 ? 0 : -Math.PI / 12)
      const targetRotZ = t < 0.1 ? 0.2 : 0

      docRef.current.position.y = THREE.MathUtils.lerp(docRef.current.position.y, targetY, 0.05)
      docRef.current.rotation.x = THREE.MathUtils.lerp(docRef.current.rotation.x, targetRotX, 0.05)
      docRef.current.rotation.z = THREE.MathUtils.lerp(docRef.current.rotation.z, targetRotZ, 0.05)
    }

    if (scanLineRef.current) {
      // Stage 3 (Analysis): Scan line sweeps
      if (t > 0.2 && t < 0.4) {
        const scanProgress = (t - 0.2) / 0.2
        // Map 0->1 to document top->bottom (y: 1.5 to -1.5)
        scanLineRef.current.position.y = 1.5 - (scanProgress * 3);
        (scanLineRef.current.material as any).opacity = 0.8;
      } else {
        (scanLineRef.current.material as any).opacity = 0;
      }
    }
  })

  // HTML UI mapped to scroll stages via Framer Motion useTransform
  
  // Staggered Opacities
  const extractOpacity = useTransform(scrollYProgress, [0.35, 0.4], [0, 1])
  const reviewOpacity = useTransform(scrollYProgress, [0.45, 0.5], [0, 1])
  const approvalOpacity = useTransform(scrollYProgress, [0.6, 0.65], [0, 1])
  const completeOpacity = useTransform(scrollYProgress, [0.75, 0.8], [0, 1])

  return (
    <group>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <spotLight position={[5, 10, 5]} angle={0.25} penumbra={1} intensity={2} color="#ffffff" castShadow />
      <spotLight position={[-5, 5, -5]} angle={0.5} penumbra={1} intensity={1} color="#0ea5e9" />

      {/* Workspace Base (Glass Desk) */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <RoundedBox args={[6, 0.1, 4]} radius={0.1} position={[0, -0.5, 0]} receiveShadow>
          <meshPhysicalMaterial 
            color="#f8fafc" 
            transmission={0.9} 
            opacity={1} 
            metalness={0.1} 
            roughness={0.2} 
            ior={1.5} 
            thickness={0.5} 
          />
        </RoundedBox>

        {/* Document Group */}
        <group ref={docRef}>
          {/* Main Paper */}
          <RoundedBox args={[2.5, 3.5, 0.02]} radius={0.02} position={[0, 0, 0.1]} castShadow receiveShadow>
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
          </RoundedBox>
          {/* Underlay Pages */}
          <RoundedBox args={[2.45, 3.45, 0.01]} radius={0.02} position={[0.05, -0.05, 0.05]} castShadow>
            <meshStandardMaterial color="#f1f5f9" roughness={1} />
          </RoundedBox>

          {/* Scanner Line */}
          <mesh ref={scanLineRef} position={[0, 1.5, 0.12]}>
            <boxGeometry args={[2.6, 0.02, 0.02]} />
            <meshBasicMaterial color="#0ea5e9" transparent opacity={0} />
          </mesh>

          {/* HTML Overlays bound to the document */}
          
          {/* Document Base Content (Always visible once loaded) */}
          <Html transform position={[0, 0, 0.12]} scale={0.25}>
            <div className="w-[320px] p-6 pointer-events-none select-none">
              <div className="text-[10px] font-bold text-slate-400 mb-6 tracking-wider">BUSINESS REGISTRATION</div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-[8px] uppercase text-slate-400 mb-1">Company Name</div>
                  <div className="h-6 w-3/4 bg-slate-100 rounded" />
                </div>
                <div>
                  <div className="text-[8px] uppercase text-slate-400 mb-1">Entity Type</div>
                  <div className="h-6 w-1/2 bg-slate-100 rounded" />
                </div>
                <div>
                  <div className="text-[8px] uppercase text-slate-400 mb-1">Registration Date</div>
                  <div className="h-6 w-2/3 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          </Html>

          {/* Stage 4: Extraction Cards */}
          <Html transform position={[1.8, 1, 0.2]} scale={0.25}>
            <motion.div style={{ opacity: extractOpacity }} className="w-[220px] bg-white/80 backdrop-blur-md border border-white p-4 rounded-2xl shadow-xl flex flex-col gap-3">
              <div className="text-[8px] font-bold text-slate-400 tracking-wider">EXTRACTED</div>
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl">
                <FileText className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="text-[9px] text-slate-500">Company</div>
                  <div className="text-xs font-semibold text-slate-900">Acme Solutions LLC</div>
                </div>
              </div>
            </motion.div>
          </Html>

          {/* Stage 5: Review / AI Analysis */}
          <Html transform position={[-1.8, -0.5, 0.2]} scale={0.25}>
            <motion.div style={{ opacity: reviewOpacity }} className="w-[200px] bg-white/90 backdrop-blur-xl border border-white p-4 rounded-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-[#0ea5e9]" />
                  <span className="text-[9px] font-bold text-slate-500">CLERKLY AI</span>
                </div>
                <div className="text-xs font-bold text-[#0ea5e9]">98.4%</div>
              </div>
              <div className="text-xs font-semibold text-slate-800 mb-2">Confidence</div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#0ea5e9] rounded-full"
                  style={{ 
                    width: useTransform(scrollYProgress, [0.45, 0.55], ["0%", "98%"]) 
                  }}
                />
              </div>
            </motion.div>
          </Html>

          {/* Stage 6: Approval Panel */}
          <Html transform position={[0, -2, 0.3]} scale={0.25}>
            <motion.div style={{ opacity: approvalOpacity }} className="w-[260px] bg-white border border-slate-200 p-3 rounded-2xl shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-xs font-medium text-slate-700">Needs Review</span>
              </div>
              <button className="bg-slate-900 text-white text-[11px] font-semibold px-4 py-2 rounded-xl hover:bg-slate-800 pointer-events-auto cursor-pointer">
                Approve Now
              </button>
            </motion.div>
          </Html>

          {/* Stage 7: Complete Overlay */}
          <Html transform position={[0, 0, 0.4]} scale={0.25}>
            <motion.div 
              style={{ 
                opacity: completeOpacity,
                scale: useTransform(scrollYProgress, [0.75, 0.8], [0.8, 1])
              }} 
              className="absolute inset-0 flex items-center justify-center -ml-[40px] -mt-[40px]"
            >
              <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full shadow-2xl flex items-center justify-center border border-slate-100">
                <CheckCircle2 className="w-10 h-10 text-[#0ea5e9]" />
              </div>
            </motion.div>
          </Html>

        </group>
      </Float>

      <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} far={4} />
    </group>
  )
}

export default function AppleScrollHero3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Smooth scroll
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 15 })

  // Hero Text fade
  const textOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0])
  const textY = useTransform(smoothProgress, [0, 0.1], [0, -40])

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-[#f8fafc]">
      
      {/* Sticky container */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Subtle Ambient Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-[#0ea5e9]/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-sky-200/10 rounded-full blur-[80px]" />
        </div>

        {/* HERO TEXT (Stage 1) */}
        <motion.div 
          style={{ opacity: textOpacity, y: textY }}
          className="absolute top-24 md:top-32 left-0 right-0 z-20 flex flex-col items-center text-center px-6 pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[10px] font-bold tracking-widest uppercase mb-8 shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>AI Paperwork Automation</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-slate-900 mb-6 max-w-5xl">
            Paperwork, <span className="text-[#0ea5e9] bg-clip-text">handled.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mb-12 leading-relaxed font-medium">
            Clerkly turns time-consuming paperwork into intelligent, automated workflows — so you can focus on what matters.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto">
            <Link href="/signup">
              <button className="bg-slate-900 text-white px-10 py-4 rounded-full font-semibold shadow-xl shadow-slate-900/10 hover:scale-105 transition-transform flex items-center gap-2 text-lg">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <a href="#how-it-works">
              <button className="bg-white/80 backdrop-blur-md text-slate-700 px-10 py-4 rounded-full font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 hover:scale-105 transition-all text-lg">
                See how it works
              </button>
            </a>
          </div>
        </motion.div>

        {/* 3D CANVAS */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="w-full h-full pointer-events-auto">
            <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
              <DocumentScene scrollYProgress={smoothProgress} />
            </Canvas>
          </div>
        </div>

      </div>
    </div>
  )
}
