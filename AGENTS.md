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
**问题**: RoundedBox 的 UV 映射顺序未知，难以正确对应每个面。

**方案 C (成功)**: 原 6 面 plane + 半透明倒角层

```tsx
<group>
  {/* 6 个独立平面贴图 */}
  <mesh position={[0, 0, d/2]}><planeGeometry /><meshStandardMaterial map={front} /></mesh>
  ...
  {/* 半透明倒角层 */}
  <mesh>
    <boxGeometry args={[w + 0.04, h + 0.04, d + 0.04]} />
    <meshStandardMaterial color="#d2b48c" transparent opacity={0.3} />
  </mesh>
</group>
```
**效果**: 内部保持清晰贴图，外部包裹半透明层模拟倒角。

### 3. 交互控制

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

### 5. 视距范围

- 初始距离: 12
- 最小距离: 5
- 最大距离: 20

### 6. 已知问题

**弃用警告**: `THREE.THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.`

**说明**: 此警告来自 drei 库的 OrbitControls 内部实现，不影响功能。three.js r173+ 将 Clock 改为 Timer，但当前版本的 drei 仍在使用旧 API。

**状态**: 已知问题，等待 drei 库更新修复。如需消除警告，可降级 three.js 至 r172 或等待新版 drei。

### 7. 当前文件结构

```
src/
  App.tsx          # 主组件，包含 Canvas、GameBox、Rotator、CameraController
  main.tsx         # 入口文件
  index.css        # 全局样式
  App.css          # 组件样式
public/
  box-front.png    # 游戏盒正面图
  box-side.png     # 游戏盒侧面图
  box-back.png     # 游戏盒背面图
  game2-front.png  # 游戏2正面图
  game2-side.png   # 游戏2侧面图
  game2-back.png   # 游戏2背面图
```

### 8. 主要组件

| 组件 | 作用 |
|------|------|
| `App` | 主入口，管理主题切换和视距状态 |
| `GameBox` | 渲染单个 3D 盒子，6 面平面 + 半透明倒角层 |
| `Rotator` | 处理左键拖动旋转盒子 |
| `CameraController` | 管理相机和 OrbitControls，处理缩放/平移 |
