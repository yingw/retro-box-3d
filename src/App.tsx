import { Canvas, useThree } from '@react-three/fiber'
import { useTexture, OrbitControls, Environment } from '@react-three/drei'
import { useState, useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

function GameBox({ textureSet, groupRef, lang }: { textureSet: string, groupRef: React.RefObject<THREE.Group | null>, lang: 'jp' | 'cn' }) {
  const front = useTexture(lang === 'cn' ? `/${textureSet}_box-front(cn).png` : `/${textureSet}_box-front(jp).png`)
  const side = useTexture(`/${textureSet}_box-side.png`)
  const back = useTexture(`/${textureSet}_box-back.png`)
  
  const h = 2.9, w = 1.6, d = 0.35

  const topTexture = useMemo(() => {
    const frontImg = front.image as HTMLImageElement
    const canvas = document.createElement('canvas')
    canvas.width = frontImg.width
    canvas.height = Math.round(frontImg.height * 0.121)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(frontImg, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [front])

  const bottomTexture = useMemo(() => {
    const frontImg = front.image as HTMLImageElement
    const canvas = document.createElement('canvas')
    canvas.width = frontImg.width
    canvas.height = Math.round(frontImg.height * 0.121)
    const ctx = canvas.getContext('2d')!
    const srcY = frontImg.height - canvas.height
    ctx.drawImage(frontImg, 0, srcY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [front])
  
  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, d/2]} castShadow receiveShadow><planeGeometry args={[w, h]} /><meshStandardMaterial map={front} /></mesh>
      <mesh position={[0, 0, -d/2]} rotation={[0, Math.PI, 0]} castShadow receiveShadow><planeGeometry args={[w, h]} /><meshStandardMaterial map={back} /></mesh>
      <mesh position={[-w/2, 0, 0]} rotation={[0, -Math.PI/2, 0]} castShadow receiveShadow><planeGeometry args={[d, h]} /><meshStandardMaterial map={side} /></mesh>
      <mesh position={[w/2, 0, 0]} rotation={[0, Math.PI/2, 0]} castShadow receiveShadow><planeGeometry args={[d, h]} /><meshStandardMaterial map={side} /></mesh>
      <mesh position={[0, h/2, 0]} rotation={[-Math.PI/2, 0, 0]} castShadow receiveShadow><planeGeometry args={[w, d]} /><meshStandardMaterial map={topTexture} /></mesh>
      <mesh position={[0, -h/2, 0]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow><planeGeometry args={[w, d]} /><meshStandardMaterial map={bottomTexture} /></mesh>
    </group>
  )
}

function SuperMetroidBox({ groupRef, lang }: { groupRef: React.RefObject<THREE.Group | null>, lang: 'jp' | 'cn' }) {
  const front = useTexture(lang === 'cn' ? '/Super Metroid (moby)/4525515-super-metroid-snes-front-cover(cn).jpg' : '/Super Metroid (moby)/4525515-super-metroid-snes-front-cover.jpg')
  const back = useTexture('/Super Metroid (moby)/4525651-super-metroid-snes-back-cover.jpg')
  const top = useTexture('/Super Metroid (moby)/1373165-super-metroid-snes-spinesides-Top.jpg')
  const left = useTexture('/Super Metroid (moby)/1373657-super-metroid-snes-spinesides-Left.jpg')
  const right = useTexture('/Super Metroid (moby)/1372277-super-metroid-snes-spinesides-Right.jpg')

  const w = 2.9, h = 2.0, d = 0.49

  const processedTop = useMemo(() => {
    const topImg = top.image as HTMLImageElement
    const scale = 1158 / topImg.width
    const scaledHeight = topImg.height * scale
    const targetHeight = 195
    const cropY = (scaledHeight - targetHeight) / 2

    const canvas = document.createElement('canvas')
    canvas.width = 1158
    canvas.height = targetHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(topImg, 0, cropY, topImg.width, scaledHeight - cropY * 2, 0, 0, canvas.width, canvas.height)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [top])

  const processedRight = useMemo(() => {
    const rightImg = right.image as HTMLImageElement
    const canvas = document.createElement('canvas')
    canvas.width = 195
    canvas.height = rightImg.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(rightImg, 0, 0, canvas.width, canvas.height)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [right])

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, d/2]} castShadow receiveShadow><planeGeometry args={[w, h]} /><meshStandardMaterial map={front} /></mesh>
      <mesh position={[0, 0, -d/2]} rotation={[0, Math.PI, 0]} castShadow receiveShadow><planeGeometry args={[w, h]} /><meshStandardMaterial map={back} /></mesh>
      <mesh position={[-w/2, 0, 0]} rotation={[0, -Math.PI/2, 0]} castShadow receiveShadow><planeGeometry args={[d, h]} /><meshStandardMaterial map={left} /></mesh>
      <mesh position={[w/2, 0, 0]} rotation={[0, Math.PI/2, 0]} castShadow receiveShadow><planeGeometry args={[d, h]} /><meshStandardMaterial map={processedRight} /></mesh>
      <mesh position={[0, h/2, 0]} rotation={[-Math.PI/2, 0, 0]} castShadow receiveShadow><planeGeometry args={[w, d]} /><meshStandardMaterial map={processedTop} /></mesh>
      <mesh position={[0, -h/2, 0]} rotation={[Math.PI/2, 0, 0]} castShadow receiveShadow><planeGeometry args={[w, d]} /><meshStandardMaterial map={processedTop} /></mesh>
    </group>
  )
}

function Rotator({ group1, group2, group3 }: { group1: React.RefObject<THREE.Group | null>, group2: React.RefObject<THREE.Group | null>, group3: React.RefObject<THREE.Group | null> }) {
  const isDragging = useRef(false)
  const dragButton = useRef(0)
  const lastPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      isDragging.current = true
      dragButton.current = e.button
      lastPos.current = { x: e.clientX, y: e.clientY }
    }
    const onMove = (e: PointerEvent) => {
      if (!isDragging.current) return
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      if (dragButton.current === 0) {
        if (group1.current && group2.current && group3.current) {
          group1.current.rotation.y += dx * 0.01
          group1.current.rotation.x += dy * 0.01
          group2.current.rotation.y += dx * 0.01
          group2.current.rotation.x += dy * 0.01
          group3.current.rotation.y += dx * 0.01
          group3.current.rotation.x += dy * 0.01
        }
      } else if (dragButton.current === 2) {
        if (group1.current && group2.current && group3.current) {
          group1.current.position.x += dx * 0.01
          group1.current.position.y -= dy * 0.01
          group2.current.position.x += dx * 0.01
          group2.current.position.y -= dy * 0.01
          group3.current.position.x += dx * 0.01
          group3.current.position.y -= dy * 0.01
        }
      }
      lastPos.current = { x: e.clientX, y: e.clientY }
    }
    const onUp = () => {
      isDragging.current = false
    }
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('contextmenu', onContextMenu)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('contextmenu', onContextMenu)
    }
  }, [group1, group2, group3])

  return null
}

function CameraController({ zoomTrigger }: { zoomTrigger: { type: 'in' | 'out' | 'reset' } | null }) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const distance = camera.position.length()
      if (e.key === 'ArrowUp') {
        const newDist = Math.max(5, distance * 0.9)
        camera.position.normalize().multiplyScalar(newDist)
      } else if (e.key === 'ArrowDown') {
        const newDist = Math.min(20, distance * 1.1)
        camera.position.normalize().multiplyScalar(newDist)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [camera])

  useEffect(() => {
    if (!zoomTrigger || !controlsRef.current) return

    if (zoomTrigger.type === 'in') {
      const distance = camera.position.length()
      const newDist = Math.max(5, distance * 0.9)
      camera.position.normalize().multiplyScalar(newDist)
    } else if (zoomTrigger.type === 'out') {
      const distance = camera.position.length()
      const newDist = Math.min(20, distance * 1.1)
      camera.position.normalize().multiplyScalar(newDist)
    } else if (zoomTrigger.type === 'reset') {
      camera.position.set(0, 0, 12)
    }
    controlsRef.current.update()
  }, [zoomTrigger, camera])

  return <OrbitControls ref={controlsRef} enableRotate={false} enableZoom={true} enablePan={false} zoomSpeed={0.5} minDistance={5} maxDistance={20} />
}

export default function App() {
  const [lang, setLang] = useState<'jp' | 'cn'>('jp')
  const group1 = useRef<THREE.Group>(null)
  const group2 = useRef<THREE.Group>(null)
  const group3 = useRef<THREE.Group>(null)

  const [zoomTrigger, setZoomTrigger] = useState<{ type: 'in' | 'out' | 'reset' } | null>(null)

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222', touchAction: 'none' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <div style={{ color: 'white', fontSize: 24, marginBottom: 10 }}>3D 盒子</div>
        <div style={{ marginBottom: 10 }}>
          <span style={{ color: '#aaa', fontSize: 12, marginRight: 10 }}>语言:</span>
          <button onClick={() => setLang('jp')} style={{ background: lang==='jp'?'#e94560':'#333', padding:'5px 15px', border:'none', borderRadius:4, color:'white', cursor:'pointer', marginRight: 5 }}>日文</button>
          <button onClick={() => setLang('cn')} style={{ background: lang==='cn'?'#e94560':'#333', padding:'5px 15px', border:'none', borderRadius:4, color:'white', cursor:'pointer' }}>中文</button>
        </div>
        <div>
          <span style={{ color: '#aaa', fontSize: 12, marginRight: 10 }}>视距:</span>
          <button onClick={() => setZoomTrigger({ type: 'in' })} style={{ background: '#333', padding:'5px 15px', border:'none', borderRadius:4, color:'white', cursor:'pointer', marginRight: 5 }}>拉近</button>
          <button onClick={() => setZoomTrigger({ type: 'out' })} style={{ background: '#333', padding:'5px 15px', border:'none', borderRadius:4, color:'white', cursor:'pointer', marginRight: 5 }}>拉远</button>
          <button onClick={() => setZoomTrigger({ type: 'reset' })} style={{ background: '#333', padding:'5px 15px', border:'none', borderRadius:4, color:'white', cursor:'pointer' }}>重置</button>
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: '#666' }}>
          左键拖动旋转 | 右键拖动平移 | 滚轮缩放
        </div>
      </div>
      <Canvas shadows camera={{ position: [0, 0, 14], fov: 35 }} style={{ background: '#d2b48c' }}>
        <CameraController zoomTrigger={zoomTrigger} />
        <group position={[-2.4, 0.95, 0]}>
          <GameBox textureSet="game1" groupRef={group1} lang={lang} />
        </group>
        <group position={[0, 0.95, 0]}>
          <GameBox textureSet="game2" groupRef={group2} lang={lang} />
        </group>
        <group position={[2.6, 0.5, 0]}>
          <SuperMetroidBox groupRef={group3} lang={lang} />
        </group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#b8956e" />
        </mesh>
        <Rotator group1={group1} group2={group2} group3={group3} />
        <Environment files="/potsdamer_platz_1k.hdr" background={false} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={3} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-far={50} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} shadow-bias={-0.0001} />
      </Canvas>
    </div>
  )
}
