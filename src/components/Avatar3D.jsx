import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Mood score 0–100 drives everything
// 80–100 = ecstatic, 60–79 = happy, 40–59 = neutral, 20–39 = sad, 0–19 = drained

function getMoodConfig(score) {
  if (score >= 80) return {
    label: 'Glowing ✨',
    bodyColor:  0xf472b6,   // hot pink
    faceColor:  0xfda4af,
    eyeColor:   0x9333ea,
    auraColor:  0xf0abfc,
    smileArc:   1.2,
    bounceAmp:  0.12,
    bounceSpeed: 2.5,
    auraOpacity: 0.35,
    auraScale:   1.6,
  }
  if (score >= 60) return {
    label: 'Happy 🌸',
    bodyColor:  0xfb7185,
    faceColor:  0xfecdd3,
    eyeColor:   0xa855f7,
    auraColor:  0xf9a8d4,
    smileArc:   0.9,
    bounceAmp:  0.07,
    bounceSpeed: 1.8,
    auraOpacity: 0.2,
    auraScale:   1.35,
  }
  if (score >= 40) return {
    label: 'Okay 🌿',
    bodyColor:  0xc084fc,
    faceColor:  0xe9d5ff,
    eyeColor:   0x7c3aed,
    auraColor:  0xddd6fe,
    smileArc:   0.2,
    bounceAmp:  0.025,
    bounceSpeed: 1.0,
    auraOpacity: 0.12,
    auraScale:   1.2,
  }
  if (score >= 20) return {
    label: 'Low 😔',
    bodyColor:  0x94a3b8,
    faceColor:  0xcbd5e1,
    eyeColor:   0x475569,
    auraColor:  0xe2e8f0,
    smileArc:   -0.5,
    bounceAmp:  0.01,
    bounceSpeed: 0.5,
    auraOpacity: 0.08,
    auraScale:   1.1,
  }
  return {
    label: 'Drained 😴',
    bodyColor:  0x64748b,
    faceColor:  0x94a3b8,
    eyeColor:   0x334155,
    auraColor:  0xcbd5e1,
    smileArc:   -0.9,
    bounceAmp:  0.005,
    bounceSpeed: 0.3,
    auraOpacity: 0.05,
    auraScale:   1.05,
  }
}

export default function Avatar3D({ score = 70, size = 200 }) {
  const mountRef = useRef(null)
  const sceneRef = useRef({})

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const W = size, H = size
    const cfg = getMoodConfig(score)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    // Scene + camera
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
    camera.position.set(0, 0.5, 5)

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(3, 5, 5)
    scene.add(dirLight)
    const rimLight = new THREE.DirectionalLight(0xf0abfc, 0.4)
    rimLight.position.set(-3, 2, -2)
    scene.add(rimLight)

    // ── Body ──────────────────────────────────────────────────────────────────
    const bodyMat  = new THREE.MeshToonMaterial({ color: cfg.bodyColor })
    const bodyGeo  = new THREE.CapsuleGeometry(0.45, 0.9, 8, 16)
    const body     = new THREE.Mesh(bodyGeo, bodyMat)
    body.position.y = -0.1
    scene.add(body)

    // ── Head ──────────────────────────────────────────────────────────────────
    const headMat  = new THREE.MeshToonMaterial({ color: cfg.faceColor })
    const headGeo  = new THREE.SphereGeometry(0.52, 32, 32)
    const head     = new THREE.Mesh(headGeo, headMat)
    head.position.y = 1.1
    scene.add(head)

    // Hair
    const hairMat = new THREE.MeshToonMaterial({ color: 0x1e1b4b })
    const hairGeo = new THREE.SphereGeometry(0.54, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.52)
    const hair    = new THREE.Mesh(hairGeo, hairMat)
    hair.position.y = 1.1
    hair.rotation.x = -0.1
    scene.add(hair)

    // Hair strands (two side pieces)
    const strandGeo = new THREE.CapsuleGeometry(0.07, 0.3, 4, 8)
    const strandMat = new THREE.MeshToonMaterial({ color: 0x1e1b4b })
    ;[-0.42, 0.42].forEach(x => {
      const strand = new THREE.Mesh(strandGeo, strandMat)
      strand.position.set(x, 0.82, 0)
      strand.rotation.z = x > 0 ? 0.3 : -0.3
      scene.add(strand)
    })

    // ── Eyes ──────────────────────────────────────────────────────────────────
    const eyeMat = new THREE.MeshToonMaterial({ color: cfg.eyeColor })
    const eyeGeo = new THREE.SphereGeometry(0.08, 16, 16)
    ;[-0.18, 0.18].forEach(x => {
      const eye = new THREE.Mesh(eyeGeo, eyeMat)
      eye.position.set(x, 1.15, 0.47)
      scene.add(eye)
    })

    // Eye shine
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const shineGeo = new THREE.SphereGeometry(0.03, 8, 8)
    ;[-0.17, 0.19].forEach(x => {
      const shine = new THREE.Mesh(shineGeo, shineMat)
      shine.position.set(x, 1.17, 0.54)
      scene.add(shine)
    })

    // ── Mouth / expression ────────────────────────────────────────────────────
    const mouthPoints = []
    const arc = cfg.smileArc
    for (let i = 0; i <= 20; i++) {
      const t = (i / 20) * Math.PI
      mouthPoints.push(new THREE.Vector3(
        Math.cos(t) * 0.18 - 0.18,
        Math.sin(t) * arc * 0.12,
        0
      ))
    }
    const mouthCurve  = new THREE.CatmullRomCurve3(mouthPoints)
    const mouthGeo    = new THREE.TubeGeometry(mouthCurve, 20, 0.025, 8, false)
    const mouthMat    = new THREE.MeshToonMaterial({ color: 0xbe185d })
    const mouth       = new THREE.Mesh(mouthGeo, mouthMat)
    mouth.position.set(0.18, 0.96, 0.49)
    scene.add(mouth)

    // ── Cheeks (blush) ────────────────────────────────────────────────────────
    if (score >= 40) {
      const blushMat = new THREE.MeshToonMaterial({ color: 0xfda4af, transparent: true, opacity: 0.5 })
      const blushGeo = new THREE.CircleGeometry(0.1, 16)
      ;[-0.3, 0.3].forEach(x => {
        const blush = new THREE.Mesh(blushGeo, blushMat)
        blush.position.set(x, 1.06, 0.49)
        scene.add(blush)
      })
    }

    // ── Arms ──────────────────────────────────────────────────────────────────
    const armMat = new THREE.MeshToonMaterial({ color: cfg.bodyColor })
    const armGeo = new THREE.CapsuleGeometry(0.12, 0.55, 4, 8)
    const armAngle = score >= 60 ? 0.7 : score >= 40 ? 0.3 : 0.1
    ;[-1, 1].forEach(side => {
      const arm = new THREE.Mesh(armGeo, armMat)
      arm.position.set(side * 0.65, 0.25, 0)
      arm.rotation.z = side * armAngle
      scene.add(arm)
    })

    // ── Sparkles (only when happy) ────────────────────────────────────────────
    const sparkles = []
    if (score >= 60) {
      const sparkMat = new THREE.MeshBasicMaterial({ color: 0xfde68a })
      const sparkGeo = new THREE.OctahedronGeometry(0.06)
      for (let i = 0; i < 5; i++) {
        const sp = new THREE.Mesh(sparkGeo, sparkMat)
        const angle  = (i / 5) * Math.PI * 2
        const radius = 0.9 + Math.random() * 0.4
        sp.position.set(Math.cos(angle) * radius, 1.1 + Math.random() * 0.8, Math.sin(angle) * radius * 0.3)
        sp.userData = { baseY: sp.position.y, phase: Math.random() * Math.PI * 2, angle, radius }
        scene.add(sp)
        sparkles.push(sp)
      }
    }

    // ── Aura glow ─────────────────────────────────────────────────────────────
    const auraMat = new THREE.MeshBasicMaterial({
      color: cfg.auraColor,
      transparent: true,
      opacity: cfg.auraOpacity,
      side: THREE.BackSide,
    })
    const auraGeo  = new THREE.SphereGeometry(1.6, 32, 32)
    const aura     = new THREE.Mesh(auraGeo, auraMat)
    aura.position.y = 0.4
    aura.scale.setScalar(cfg.auraScale)
    scene.add(aura)

    // ── Animation loop ────────────────────────────────────────────────────────
    let frameId
    const clock = new THREE.Clock()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Body + head bounce
      const bounce = Math.sin(t * cfg.bounceSpeed) * cfg.bounceAmp
      body.position.y = -0.1 + bounce
      head.position.y = 1.1 + bounce
      hair.position.y = 1.1 + bounce
      mouth.position.y = 0.96 + bounce

      // Slight head tilt when happy
      if (score >= 60) {
        head.rotation.z = Math.sin(t * 0.8) * 0.06
        hair.rotation.z = Math.sin(t * 0.8) * 0.06
      } else if (score < 40) {
        // Drooping head
        head.rotation.z = -0.15
        hair.rotation.z = -0.15
      }

      // Aura pulse
      const auraScale = cfg.auraScale + Math.sin(t * 1.2) * 0.04
      aura.scale.setScalar(auraScale)
      auraMat.opacity = cfg.auraOpacity + Math.sin(t * 1.2) * 0.04

      // Sparkles orbit
      sparkles.forEach(sp => {
        sp.userData.angle += 0.008
        const r = sp.userData.radius
        sp.position.x = Math.cos(sp.userData.angle) * r
        sp.position.z = Math.sin(sp.userData.angle) * r * 0.3
        sp.position.y = sp.userData.baseY + bounce + Math.sin(t + sp.userData.phase) * 0.08
        sp.rotation.y += 0.05
        sp.rotation.x += 0.03
      })

      // Gentle whole-scene sway
      scene.rotation.y = Math.sin(t * 0.4) * 0.08

      renderer.render(scene, camera)
    }

    animate()
    sceneRef.current = { renderer, frameId }

    return () => {
      cancelAnimationFrame(frameId)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [score, size])

  return <div ref={mountRef} style={{ width: size, height: size }} />
}
