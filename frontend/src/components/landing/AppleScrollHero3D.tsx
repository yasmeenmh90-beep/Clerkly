"use client"

import { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Float, ContactShadows, RoundedBox, Environment, MeshTransmissionMaterial, Sparkles } from '@react-three/drei'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import * as THREE from 'three'
import { CheckCircle2, FileText, Upload, Brain, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// ─── 3D Document & Workspace Component ─────────────────────────────

function DocumentScene({ scrollYProgress }: { scrollYProgress: any }) {
  const docGroupRef = useRef<THREE.Group>(null)
  const scanLineRef = useRef<THREE.Mesh>(null)
  const fieldHighlightRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  useFrame((state, delta) => {
    const t = scrollYProgress.get()
    
    // CAMERA:
    // 0-0.15 (Intro): Camera dolly in
    // 0.88-1.0 (Complete): Camera pull back
    const targetZ = t < 0.15 ? 10 - t * 15 : (t > 0.88 ? 6 + (t - 0.88) * 15 : 7.75)
    const targetY = t < 0.15 ? 2 - t * 5 : (t > 0.88 ? 0.5 + (t - 0.88) * 10 : 1.25)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05)
    camera.lookAt(0, 0, 0)

    // DOCUMENT GROUP (Upload stage 0.15 - 0.3)
    if (docGroupRef.current) {
      if (t < 0.15) {
        docGroupRef.current.position.y = -5 // Hidden below
        docGroupRef.current.rotation.x = -Math.PI / 4
      } else if (t < 0.3) {
        // Sliding in
        const prog = (t - 0.15) / 0.15
        docGroupRef.current.position.y = THREE.MathUtils.lerp(docGroupRef.current.position.y, 0.1, 0.1)
        docGroupRef.current.rotation.x = THREE.MathUtils.lerp(docGroupRef.current.rotation.x, -Math.PI / 16, 0.1)
      } else {
        // Settled
        docGroupRef.current.position.y = THREE.MathUtils.lerp(docGroupRef.current.position.y, 0.1, 0.1)
        docGroupRef.current.rotation.x = THREE.MathUtils.lerp(docGroupRef.current.rotation.x, -Math.PI / 16, 0.1)
      }
    }

    // SCANNING BEAM (Understand stage 0.3 - 0.45)
    if (scanLineRef.current) {
      if (t >= 0.3 && t < 0.45) {
        const scanProgress = (t - 0.3) / 0.15
        scanLineRef.current.position.y = 1.6 - (scanProgress * 3.2) // Top to bottom
        ;(scanLineRef.current.material as any).opacity = 0.9
      } else {
        ;(scanLineRef.current.material as any).opacity = 0
      }
    }

    // FIELD HIGHLIGHT (Syncs with scan beam around 0.35 - 0.4)
    if (fieldHighlightRef.current) {
      if (t >= 0.35 && t < 0.42) {
        const highlightProgress = Math.sin(((t - 0.35) / 0.07) * Math.PI)
        ;(fieldHighlightRef.current.material as any).opacity = highlightProgress * 0.4
      } else {
        ;(fieldHighlightRef.current.material as any).opacity = 0
      }
    }
  })

  // HTML UI mapped to scroll stages
  
  // Stage 4 (0.45 - 0.6): Extract
  const extractOpacity = useTransform(scrollYProgress, [0.45, 0.5], [0, 1])
  const extractY = useTransform(scrollYProgress, [0.45, 0.5], [20, 0])

  // Stage 5 (0.6 - 0.75): AI Confidence
  const reviewOpacity = useTransform(scrollYProgress, [0.6, 0.65], [0, 1])
  const reviewProgress = useTransform(scrollYProgress, [0.65, 0.75], ["0%", "98.4%"])

  // Stage 6 (0.75 - 0.88): Approval
  const approvalOpacity = useTransform(scrollYProgress, [0.75, 0.8], [0, 1])

  // Stage 7 (0.88 - 1.0): Complete
  const completeOpacity = useTransform(scrollYProgress, [0.88, 0.92], [0, 1])
  const completeScale = useTransform(scrollYProgress, [0.88, 0.92], [0.8, 1])

  return (
    <group>
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.4} color="#ffffff" />
      <spotLight position={[8, 12, 8]} angle={0.3} penumbra={1} intensity={2.5} color="#ffffff" castShadow shadow-bias={-0.0001} />
      <spotLight position={[-8, 5, -5]} angle={0.5} penumbra={1} intensity={2} color="#0ea5e9" />
      <pointLight position={[0, 2, 2]} intensity={0.5} color="#4f46e5" />
      
      {/* Subtle Dust/Particles */}
      <Sparkles count={50} scale={10} size={2} speed={0.2} opacity={0.1} color="#0ea5e9" />

      {/* Desk Surface (Elegant, premium dark grey/blue metallic desk) */}
      <mesh position={[0, -0.1, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Laptop Silhouette (Background) */}
      <group position={[-3, 0, -2]} rotation={[0, 0.5, 0]}>
        <RoundedBox args={[3.2, 0.05, 2.2]} radius={0.02} position={[0, 0.025, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.8} />
        </RoundedBox>
        <RoundedBox args={[3.2, 2.1, 0.05]} radius={0.02} position={[0, 1.05, -1.1]} rotation={[-0.2, 0, 0]} castShadow>
          <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
        </RoundedBox>
        {/* Screen Glow */}
        <rectAreaLight width={3} height={2} color="#0ea5e9" intensity={0.5} position={[0, 1, -1]} rotation={[0.2, Math.PI, 0]} />
      </group>

      {/* Document Group */}
      <group ref={docGroupRef}>
        {/* Main Paper */}
        <RoundedBox args={[2.8, 3.8, 0.015]} radius={0.01} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#fafaf9" roughness={1} />
        </RoundedBox>
        {/* Underlay Pages */}
        <RoundedBox args={[2.75, 3.75, 0.01]} radius={0.01} position={[0.05, -0.02, -0.01]} castShadow>
          <meshStandardMaterial color="#f5f5f4" roughness={1} />
        </RoundedBox>
        <RoundedBox args={[2.7, 3.7, 0.01]} radius={0.01} position={[0.02, -0.04, -0.02]} castShadow>
          <meshStandardMaterial color="#e7e5e4" roughness={1} />
        </RoundedBox>

        {/* Scanner Line */}
        <mesh ref={scanLineRef} position={[0, 1.8, 0.03]}>
          <boxGeometry args={[2.9, 0.03, 0.05]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0} blending={THREE.AdditiveBlending} />
        </mesh>
        
        {/* Field Highlight Mesh */}
        <mesh ref={fieldHighlightRef} position={[0, 0.3, 0.01]}>
          <planeGeometry args={[2.4, 0.3]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Document Base Content (HTML) - Super Crisp */}
        <Html transform position={[0, 0, 0.02]} scale={0.25} distanceFactor={10} zIndexRange={[10, 0]}>
          <div className="w-[360px] p-8 bg-transparent pointer-events-none select-none text-slate-800">
            <div className="flex justify-between items-start border-b-2 border-slate-200 pb-4 mb-6">
              <div>
                <div className="text-[14px] font-black tracking-tight text-slate-900">ACME CORP</div>
                <div className="text-[9px] font-semibold text-slate-500 tracking-widest uppercase mt-1">Business Registration</div>
              </div>
              <div className="text-[10px] text-slate-400 font-medium text-right">
                Form: 1099-B<br/>Rev. 2026
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="text-[9px] uppercase font-bold text-slate-400 mb-1">Company Name</div>
                <div className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-1">Acme Solutions LLC</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400 mb-1">Entity Type</div>
                  <div className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-1">LLC</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400 mb-1">Registration Date</div>
                  <div className="text-sm font-semibold text-slate-800 border-b border-slate-200 pb-1">March 12, 2026</div>
                </div>
              </div>
              
              <div className="mt-8 pt-6">
                <div className="text-[9px] uppercase font-bold text-slate-400 mb-3">Authorized Signatures</div>
                <div className="flex gap-6">
                  <div className="flex-1">
                    <div className="h-8 border-b border-slate-800 flex items-end pb-1">
                      <span className="font-[signature] text-lg text-slate-700">Jane Doe</span>
                    </div>
                    <div className="text-[8px] mt-1 text-slate-500">Primary Officer</div>
                  </div>
                  <div className="w-24">
                    <div className="h-8 border-b border-slate-800 flex items-end pb-1">
                      <span className="text-xs text-slate-700">03/12/26</span>
                    </div>
                    <div className="text-[8px] mt-1 text-slate-500">Date</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Html>

        {/* Stage 4: Extraction Cards */}
        <Html transform position={[1.9, 0.8, 0.2]} scale={0.25} distanceFactor={10} zIndexRange={[20, 0]}>
          <motion.div style={{ opacity: extractOpacity, y: extractY }} className="w-[240px] bg-white/20 backdrop-blur-xl border border-white/30 p-4 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] flex flex-col gap-3">
            <div className="text-[9px] font-bold text-slate-200 tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] animate-pulse" />
              EXTRACTED DATA
            </div>
            <div className="bg-white/90 p-3 rounded-xl shadow-inner border border-white">
              <div className="text-[9px] font-bold text-slate-400 uppercase">Company</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">Acme Solutions LLC</div>
            </div>
            <div className="bg-white/90 p-3 rounded-xl shadow-inner border border-white">
              <div className="text-[9px] font-bold text-slate-400 uppercase">Type & Date</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5 flex justify-between">
                <span>LLC</span>
                <span className="text-[#0ea5e9]">Mar 12, 2026</span>
              </div>
            </div>
          </motion.div>
        </Html>

        {/* Stage 5: AI Confidence */}
        <Html transform position={[-1.9, -0.2, 0.2]} scale={0.25} distanceFactor={10} zIndexRange={[20, 0]}>
          <motion.div style={{ opacity: reviewOpacity }} className="w-[220px] bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0ea5e9] to-[#6366f1]" />
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#0ea5e9]" />
                <span className="text-[10px] font-bold text-white tracking-wide">CLERKLY AI</span>
              </div>
              <motion.div className="text-sm font-bold text-[#0ea5e9]">
                {reviewProgress}
              </motion.div>
            </div>
            <div className="text-[10px] font-semibold text-slate-300 mb-2 uppercase tracking-wide">Analysis Complete</div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] rounded-full"
                style={{ width: reviewProgress }}
              />
            </div>
          </motion.div>
        </Html>

        {/* Stage 6: Approval Panel */}
        <Html transform position={[0, -2.2, 0.3]} scale={0.25} distanceFactor={10} zIndexRange={[30, 0]}>
          <motion.div style={{ opacity: approvalOpacity }} className="w-[300px] bg-white/95 backdrop-blur-xl border border-white/50 p-4 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col gap-4 pointer-events-auto">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-bold text-slate-900">Review Document</div>
                <div className="text-[11px] font-medium text-slate-500 mt-1">Data extracted successfully.</div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-[9px] font-bold text-amber-700 uppercase">Needs Review</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer">
                Reject
              </button>
              <button className="flex-1 bg-[#0ea5e9] hover:bg-sky-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-md shadow-sky-500/20 cursor-pointer">
                Approve
              </button>
            </div>
          </motion.div>
        </Html>

        {/* Stage 7: Complete Overlay */}
        <Html transform position={[0, 0, 0.5]} scale={0.25} distanceFactor={10} zIndexRange={[100, 0]}>
          <motion.div 
            style={{ 
              opacity: completeOpacity,
              scale: completeScale
            }} 
            className="absolute inset-0 flex items-center justify-center -ml-[60px] -mt-[60px] pointer-events-none"
          >
            <div className="w-32 h-32 bg-white/95 backdrop-blur-md rounded-full shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
              <div className="text-[10px] font-bold text-emerald-600 tracking-wide uppercase">Processed</div>
            </div>
          </motion.div>
        </Html>
      </group>
      
      {/* Contact Shadows for realism */}
      <ContactShadows position={[0, 0, 0]} opacity={0.8} scale={20} blur={2} far={4} color="#000000" />
    </group>
  )
}

export default function AppleScrollHero3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Cinematic scroll smoothing
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 20 })

  // Hero Text fade
  const textOpacity = useTransform(smoothProgress, [0, 0.12], [1, 0])
  const textY = useTransform(smoothProgress, [0, 0.12], [0, -50])

  return (
    <div ref={containerRef} className="relative h-[600vh] bg-[#020617]"> {/* Deep navy/midnight background */}
      
      {/* Sticky container */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Atmospheric Background Glows */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Deep blue radial gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,58,138,0.3)_0%,transparent_70%)]" />
          {/* Cyan accent glow */}
          <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-[#0ea5e9]/10 rounded-full blur-[120px]" />
          {/* Indigo accent glow */}
          <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-indigo-500/10 rounded-full blur-[100px]" />
        </div>

        {/* HERO TEXT (Stage 1) */}
        <motion.div 
          style={{ opacity: textOpacity, y: textY }}
          className="absolute top-24 md:top-32 left-0 right-0 z-20 flex flex-col items-center text-center px-6 pointer-events-none"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-slate-300 text-[10px] font-bold tracking-widest uppercase mb-8 shadow-2xl shadow-sky-500/10">
            <Upload className="w-3.5 h-3.5 text-[#0ea5e9]" />
            <span>AI Paperwork Automation</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 max-w-5xl">
            Paperwork, <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]">handled.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mb-12 leading-relaxed font-medium">
            Clerkly turns time-consuming paperwork into intelligent, automated workflows — so you can focus on what matters.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto">
            <Link href="/signup">
              <button className="bg-white text-slate-900 px-10 py-4 rounded-full font-bold shadow-xl hover:scale-105 hover:bg-slate-50 transition-all flex items-center gap-2 text-lg">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <a href="#how-it-works">
              <button className="bg-white/5 backdrop-blur-md text-white px-10 py-4 rounded-full font-bold shadow-sm border border-white/10 hover:bg-white/10 hover:scale-105 transition-all text-lg">
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
