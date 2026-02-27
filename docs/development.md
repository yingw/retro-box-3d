# 3D 游戏盒子展示台开发文档

## 项目概述

这是一个使用 React + Three.js 实现的 3D 游戏盒子展示网页，可以展示 CD/DVD 或游戏卡带盒子的 3D 效果，支持多角度查看。

## 技术栈

- **React** - UI 框架
- **Three.js** - 3D 渲染引擎
- **@react-three/fiber** - React 的 Three.js 封装
- **@react-three/drei** - R3F 常用组件库
- **Vite** - 构建工具

## 环境配置

### 安装依赖

```bash
cd ~/Projects/box-3d
npm install
npm install three @types/three @react-three/fiber @react-three/drei
```

### 启动开发服务器

```bash
pnpm dev --host 0.0.0.0 --port 5174
```

访问：
- 本地：http://localhost:5174
- 局域网：http://192.168.31.183:5174

## 图片资源

项目使用三张图片来构建 3D 盒子：

| 图片 | 尺寸 | 用途 |
|------|------|------|
| `box-front.png` | 478x864 | 正面封面 |
| `box-back.png` | 476x864 | 背面 |
| `box-side.png` | 136x864 | 侧面 |

比例计算（按高度 2.9）：
- 宽度 = 2.9 × (478/864) ≈ 1.6
- 侧面宽度 = 2.9 × (136/864) ≈ 0.46

## 核心代码

### 1. 基础结构

```tsx
import { Canvas } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'
```

### 2. 游戏盒子组件

```tsx
function GameBox({ textureSet, groupRef }) {
  const front = useTexture(`/${textureSet}-front.png`)
  const side = useTexture(`/${textureSet}-side.png`)
  const back = useTexture(`/${textureSet}-back.png`)
  
  const h = 2.9, w = 1.6, d = 0.35
  
  return (
    <group ref={groupRef}>
      {/* 正面 */}
      <mesh position={[0, 0, d/2]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={front} />
      </mesh>
      {/* 背面 */}
      <mesh position={[0, 0, -d/2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={back} />
      </mesh>
      {/* 左侧 */}
      <mesh position={[-w/2, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial map={side} />
      </mesh>
      {/* 右侧、顶部、底部省略... */}
    </group>
  )
}
```

**说明**：
- 使用 6 个 `planeGeometry` 分别表示盒子的 6 个面
- 每个面用 `meshStandardMaterial` 贴图
- `rotation` 用于翻转背面的图片方向

### 3. 旋转控制（全局拖动）

```tsx
function Rotator({ group1, group2 }) {
  const isDragging = useRef(false)
  
  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      if (group1.current && group2.current) {
        group1.current.rotation.y += dx * 0.01
        group1.current.rotation.x += dy * 0.01
        group2.current.rotation.y += dx * 0.01
        group2.current.rotation.x += dy * 0.01
      }
    }
    // 绑定全局指针事件
    window.addEventListener('pointermove', onMove)
  }, [])
  
  return null
}
```

**说明**：
- 使用 `pointerdown/move/up` 事件监听拖动
- 拖动时两个盒子同时旋转，各自绕自己的中心
- 旋转角度通过修改 `group.rotation.x/y` 实现

### 4. 渲染配置

```tsx
<Canvas camera={{ position: [0, 0, 10], fov: 35 }}>
  {/* 灯光 */}
  <ambientLight intensity={1.2} />
  <pointLight position={[10, 10, 10]} intensity={1} />
  <pointLight position={[-10, -10, -10]} intensity={0.8} />
</Canvas>
```

**说明**：
- `fov: 35` - 视野角度，决定视距远近
- 多个 pointLight 从不同方向照亮盒子

## 不合适的尝试及问题

### 1. 圆角 (RoundedBox)

尝试用 `@react-three/drei` 的 `RoundedBox` 替代普通 box：

```tsx
<RoundedBox args={[2, 3, 0.4]} radius={0.05} smoothness={4}>
  <meshStandardMaterial color="#ffffff" />
</RoundedBox>
```

**问题**：图片是平面的，无法跟随圆角弯曲。图片会浮在盒子表面，边缘不协调。

**结论**：游戏盒子边缘本身就是锐利的，不需要圆角。

### 2. 放大缩小 (缩放)

尝试通过调整盒子几何体尺寸来适应图片：

```tsx
// 第一次尝试 - 盒子比图片大
<planeGeometry args={[1.9, 2.85]} />  // 盒子 2x3

// 问题：盒子边缘露出白色底色
```

**问题**：图片尺寸和盒子尺寸不匹配时，会露出盒子底色。

**解决**：根据图片实际比例计算盒子尺寸，使两者一致。

### 3. 视距 (Camera Distance)

初始设置：

```tsx
camera={{ position: [4, 2, 4] }}  // 太近
camera={{ position: [0, 0, 6] }}  // 稍微调整
camera={{ position: [0, 0, 10], fov: 35 }}  // 最终版本
```

**问题**：
- 位置 [4,2,4] 时，盒子看起来很拥挤
- 侧面容易被遮挡
- 需要根据盒子数量调整视距

**解决**：相机放远 + 小 fov（35），让盒子在视野中居中显示。

### 4. 侧面图片方向反转

初始代码：

```tsx
// 错误：只能从盒子内部看到图片
<mesh position={[-w/2, 0, 0]} rotation={[0, Math.PI/2, 0]}>
// 修正：旋转方向取反
<mesh position={[-w/2, 0, 0]} rotation={[0, -Math.PI/2, 0]}>
```

**问题**：侧面图片在某些角度看起来是反的，或者只能从内部看到。

**原因**：Three.js 中 plane 的法线方向和旋转角度计算有关。

**解决**：调整 rotation 方向为 `-Math.PI/2`。

### 5. 多个光源导致的背面不亮

尝试添加更多灯光来照亮所有面：

```tsx
<ambientLight intensity={1} />
<directionalLight position={[5, 5, 5]} intensity={1} />
<directionalLight position={[-5, 3, -5]} intensity={0.8} />  // 背面光
```

**问题**：
- 背面仍然较暗
- 过多的光源增加复杂度

**解决**：使用简单的环境光 + 两个 pointLight，配合白色材质即可。

### 6. 独立旋转 vs 整体旋转

尝试用 `PresentationControls` 实现每个盒子独立旋转：

```tsx
<PresentationControls>
  <GameBox1 />
</PresentationControls>
<PresentationControls>
  <GameBox2 />
</PresentationControls>
```

**问题**：
- 两个盒子仍然一起旋转（整体视角）
- 不是"拖哪个转哪个"的效果

**解决**：改用全局指针事件监听，手动控制每个 group 的 rotation，实现：
- 鼠标在任意位置拖动都有效
- 两个盒子同时旋转
- 各自绕自己的中心旋转

## 后续优化方向

1. **图片拉伸**：正面和背面像素略有不同（478 vs 476），可以考虑拉伸对齐
2. **拖动反馈**：添加旋转方向的视觉提示
3. **移动端支持**：触摸事件适配
4. **更多盒子**：动态添加更多游戏盒子
