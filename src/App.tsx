import { Canvas } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
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
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [group1, group2])
  
  return null
}

export default function App() {
  const [t, setT] = useState('game')
  const group1 = useRef<THREE.Group>(null)
  const group2 = useRef<THREE.Group>(null)

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#222', touchAction: 'none' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <div style={{ color: 'white', fontSize: 24, marginBottom: 10 }}>3D 盒子</div>
        <button onClick={() => setT('game')} style={{ background: t==='game'?'#e94560':'#333', padding:'10px 20px', border:'none', borderRadius:8, color:'white', cursor:'pointer' }}>🎮 游戏</button>
        <button onClick={() => setT('cd')} style={{ background: t==='cd'?'#0f3460':'#333', padding:'10px 20px', border:'none', borderRadius:8, color:'white', cursor:'pointer', marginLeft:10 }}>💿 CD</button>
      </div>
      <Canvas camera={{ position: [0, 0, 10], fov: 35 }} style={{ background: '#d2b48c' }}>
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
