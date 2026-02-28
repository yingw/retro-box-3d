import { Canvas, useThree } from '@react-three/fiber'
import { useTexture, OrbitControls } from '@react-three/drei'
import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'

function GameBox({ textureSet, groupRef }: { textureSet: string, groupRef: React.RefObject<THREE.Group | null> }) {
  const front = useTexture(`/${textureSet}-front.png`)
  const side = useTexture(`/${textureSet}-side.png`)
  const back = useTexture(`/${textureSet}-back.png`)
  
  const h = 2.9, w = 1.6, d = 0.35
  
  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, d/2]}><planeGeometry args={[w, h]} /><meshStandardMaterial map={front} /></mesh>
      <mesh position={[0, 0, -d/2]} rotation={[0, Math.PI, 0]}><planeGeometry args={[w, h]} /><meshStandardMaterial map={back} /></mesh>
      <mesh position={[-w/2, 0, 0]} rotation={[0, -Math.PI/2, 0]}><planeGeometry args={[d, h]} /><meshStandardMaterial map={side} /></mesh>
      <mesh position={[w/2, 0, 0]} rotation={[0, Math.PI/2, 0]}><planeGeometry args={[d, h]} /><meshStandardMaterial color="white" /></mesh>
      <mesh position={[0, h/2, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[w, d]} /><meshStandardMaterial color="white" /></mesh>
      <mesh position={[0, -h/2, 0]} rotation={[Math.PI/2, 0, 0]}><planeGeometry args={[w, d]} /><meshStandardMaterial color="white" /></mesh>
    </group>
  )
}

function Rotator({ group1, group2 }: { group1: React.RefObject<THREE.Group | null>, group2: React.RefObject<THREE.Group | null> }) {
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      isDragging.current = true
      lastPos.current = { x: e.clientX, y: e.clientY }
    }
    const onMove = (e: PointerEvent) => {
      if (!isDragging.current) return
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      if (group1.current && group2.current) {
        group1.current.rotation.y += dx * 0.01
        group1.current.rotation.x += dy * 0.01
        group2.current.rotation.y += dx * 0.01
        group2.current.rotation.x += dy * 0.01
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
  }, [group1, group2])

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

  return <OrbitControls ref={controlsRef} enableRotate={false} enableZoom={true} enablePan={true} zoomSpeed={0.5} minDistance={5} maxDistance={20} />
}

export default function App() {
  const [t, setT] = useState('game')
  const group1 = useRef<THREE.Group>(null)
  const group2 = useRef<THREE.Group>(null)

  const [zoomTrigger, setZoomTrigger] = useState<{ type: 'in' | 'out' | 'reset' } | null>(null)

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222', touchAction: 'none' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <div style={{ color: 'white', fontSize: 24, marginBottom: 10 }}>3D 盒子</div>
        <div style={{ marginBottom: 10 }}>
          <button onClick={() => setT('game')} style={{ background: t==='game'?'#e94560':'#333', padding:'10px 20px', border:'none', borderRadius:8, color:'white', cursor:'pointer' }}>🎮 游戏</button>
          <button onClick={() => setT('cd')} style={{ background: t==='cd'?'#0f3460':'#333', padding:'10px 20px', border:'none', borderRadius:8, color:'white', cursor:'pointer', marginLeft:10 }}>💿 CD</button>
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
      <Canvas camera={{ position: [0, 0, 12], fov: 35 }} style={{ background: '#d2b48c' }}>
        <CameraController zoomTrigger={zoomTrigger} />
        {t==='game' ? (
          <>
            <group position={[-1.2, 0, 0]}>
              <GameBox textureSet="box" groupRef={group1} />
            </group>
            <group position={[1.2, 0, 0]}>
              <GameBox textureSet="game2" groupRef={group2} />
            </group>
            <Rotator group1={group1} group2={group2} />
          </>
        ) : (
          <mesh><boxGeometry args={[1.4,1.4,0.1]} /><meshStandardMaterial color="white" /></mesh>
        )}
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} />
      </Canvas>
    </div>
  )
}
