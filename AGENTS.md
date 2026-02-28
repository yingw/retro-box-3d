# AGENTS.md

## 项目概述

3D 盒子展示应用，使用 React + TypeScript + Vite + React Three Fiber。

## 命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # TypeScript 编译 + Vite 构建
pnpm lint         # ESLint 检查
pnpm preview      # 预览构建产物
```

## 代码风格

- **Imports**: `react`, `three`, `@react-three/fiber`, `@react-three/drei`
- **TypeScript**: 严格模式，显式类型声明
- **命名**: 组件 PascalCase，变量/函数 camelCase
- **React Hooks**: useRef 用于 THREE 对象引用，useEffect 用于事件监听清理

## 近期更新与实现方案

### 1. 背景色与光照

**变更**: 添加棕褐色背景 `#d2b48c`，优化光照设置

**实现**: Canvas 添加 `style={{ background: '#d2b48c' }}`

```tsx
<Canvas style={{ background: '#d2b48c' }}>
  <ambientLight intensity={1} />
  <directionalLight position={[5, 5, 5]} intensity={1} />
  <pointLight position={[10, 10, 10]} intensity={1} />
  <pointLight position={[-10, -10, -10]} intensity={0.8} />
</Canvas>
```

### 2. 边缘圆角效果

**方案 A (失败)**: 使用 `RoundedBox` + 多材质

```tsx
<RoundedBox args={[w, h, d]} radius={0.03}>
  <meshStandardMaterial attach="material-0" map={side} />
  ...
</RoundedBox>
```
**问题**: RoundedBox 的 UV 映射将整个纹理拉伸到单一几何体，无法像原方案那样每个面单独贴图。

**方案 B (失败)**: Sprite Atlas 拼图

将 6 个面的图片拼成一张大图，用作 RoundedBox 的纹理。
**尝试**: 创建 2行3列的 atlas，top/bottom 从正面图裁剪（不是缩放）。
**问题**: RoundedBox 的 UV 映射顺序未公开文档，难以正确对应每个面。多次尝试排列顺序均失败。

**方案 C (放弃)**: 原 6 面 plane + 半透明倒角层

半透明层视觉效果不自然，已放弃。

**最终方案 (当前)**: 6 面独立 planeGeometry

```tsx
<group>
  <mesh position={[0, 0, d/2]}><planeGeometry args={[w, h]} /><meshStandardMaterial map={front} /></mesh>
  <mesh position={[0, 0, -d/2]} rotation={[0, Math.PI, 0]}><planeGeometry args={[w, h]} /><meshStandardMaterial map={back} /></mesh>
  <mesh position={[-w/2, 0, 0]} rotation={[0, -Math.PI/2, 0]}><planeGeometry args={[d, h]} /><meshStandardMaterial map={side} /></mesh>
  <mesh position={[w/2, 0, 0]} rotation={[0, Math.PI/2, 0]}><planeGeometry args={[d, h]} /><meshStandardMaterial map={side} /></mesh>
  <mesh position={[0, h/2, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[w, d]} /><meshStandardMaterial map={topTexture} /></mesh>
  <mesh position={[0, -h/2, 0]} rotation={[Math.PI/2, 0, 0]}><planeGeometry args={[w, d]} /><meshStandardMaterial map={bottomTexture} /></mesh>
</group>
```
**规则**:
- front/back: 正面/背面图
- left/right: 复制侧面图
- top: 从正面图顶部裁剪 (约 12.1%)
- bottom: 从正面图底部裁剪 (约 12.1%)

**效果**: 贴图位置正确，边缘保持锐利。适合简单长方体，复杂模型建议用 Blender 建模导出 GLTF。

### 3. 双语言封面

**文件命名规则**: `{game}_box-front(jp).png` / `{game}_box-front(cn).png`

**UI**: 切换按钮 "日文" / "中文" 切换封面贴图

```tsx
const [lang, setLang] = useState<'jp' | 'cn'>('jp')

<GameBox textureSet="game1" lang={lang} />
```

### 4. 光照增强

**功能**: 添加环境光、定向光、点光源和 HDRI 环境贴图，提升物体表面光泽感

**实现**:
```tsx
<ambientLight intensity={0.8} />
<directionalLight position={[5, 5, 5]} intensity={1.2} />
<pointLight position={[10, 10, 10]} intensity={1} />
<pointLight position={[-10, -10, -10]} intensity={0.5} />
<Environment preset="city" background={false} />
```

### 5. 视距控制 UI

**功能**:
- 左键拖动旋转盒子
- 右键拖动平移视角
- 滚轮缩放 (zoomSpeed=0.5)
- 键盘上下缩放

**实现**:

```tsx
// 左键旋转 (Rotator 组件)
window.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return // 只响应左键
  isDragging.current = true
})
window.addEventListener('contextmenu', (e) => e.preventDefault()) // 阻止右键菜单

// OrbitControls 处理平移和缩放
<OrbitControls
  enableRotate={false} // 禁用自带旋转，使用自定义
  enableZoom={true}
  enablePan={true}
  zoomSpeed={0.5}
  minDistance={5}
  maxDistance={20}
/>
```

### 4. 视距控制 UI

**实现**: 按钮组 + 状态提升

```tsx
// App 组件外层
const [zoomTrigger, setZoomTrigger] = useState<{ type: 'in' | 'out' | 'reset' } | null>(null)

const zoomIn = () => setZoomTrigger({ type: 'in' })
const zoomOut = () => setZoomTrigger({ type: 'out' })
const resetView = () => setZoomTrigger({ type: 'reset' })

// Canvas 内部 CameraController 监听
function CameraController({ zoomTrigger }: { zoomTrigger: ... }) {
  const { camera } = useThree()
  const controlsRef = useRef(null)

  useEffect(() => {
    if (!zoomTrigger) return
    // 根据 zoomTrigger 类型执行缩放
    if (zoomTrigger.type === 'in') { ... }
    if (zoomTrigger.type === 'out') { ... }
    if (zoomTrigger.type === 'reset') { camera.position.set(0, 0, 12) }
    controlsRef.current?.update()
  }, [zoomTrigger, camera])

  return <OrbitControls ref={controlsRef} ... />
}
```

**注意**: React Three Fiber 的 hooks (`useThree`, `useRef`) 只能在 Canvas 内部使用。

### 6. 视距范围

- 初始距离: 12
- 最小距离: 5
- 最大距离: 20

### 7. 已知问题

**弃用警告**: `THREE.THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.`

**说明**: 此警告来自 drei 库的 OrbitControls 内部实现，不影响功能。three.js r173+ 将 Clock 改为 Timer，但当前版本的 drei 仍在使用旧 API。

**状态**: 已知问题，等待 drei 库更新修复。如需消除警告，可降级 three.js 至 r172 或等待新版 drei。

### 8. 当前文件结构

```
public/
  game1_box-front(jp).png   # 游戏1日文封面
  game1_box-front(cn).png   # 游戏1中文封面
  game1_box-side.png        # 游戏1侧面图
  game1_box-back.png        # 游戏1背面图
  game2_box-front(jp).png   # 游戏2日文封面
  game2_box-front(cn).png   # 游戏2中文封面
  game2_box-side.png        # 游戏2侧面图
  game2_box-back.png        # 游戏2背面图
```

### 9. 主要组件

| 组件 | 作用 |
|------|------|
| `App` | 主入口，管理主题切换和视距状态 |
| `GameBox` | 渲染单个 3D 盒子，6 个独立平面分别贴图 |
| `Rotator` | 处理左键拖动旋转盒子 |
| `CameraController` | 管理相机和 OrbitControls，处理缩放/平移 |
