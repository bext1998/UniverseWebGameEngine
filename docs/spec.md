# Universe Engine — Specification Document

> **Version**: 0.1 (Draft)
> **Status**: In Discussion
> **Last Updated**: 2026-04-15
> **License**: MIT

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Philosophy](#2-architecture-philosophy)
3. [Top-Level Architecture](#3-top-level-architecture)
4. [Core Components](#4-core-components)
5. [Developer Interface](#5-developer-interface)
6. [Directory Structure](#6-directory-structure)
7. [Type System & Relay Event Design](#7-type-system--relay-event-design)
8. [Rendering Strategy](#8-rendering-strategy)
9. [Future Expansion](#9-future-expansion)
10. [Security Scope](#10-security-scope)
11. [Validation Project — Match-3 Gem Game](#11-validation-project--match-3-gem-game)
12. [Open Items](#12-open-items)
13. [Roadmap](#13-roadmap)

---

## 1. Project Overview

**Universe Engine**（正式名稱：Universe Web Game Engine）是一個以 TypeScript 建構的模組化網頁遊戲引擎。

命名來自 **Universal**（通用），代表它不綁定任何特定遊戲類型。引擎內部所有元件採用**太空主題命名**，與 Universe 這個名字呼應。

### 起源

Universe Engine 並非「為了做引擎而做引擎」，而是在開發一款簡單寶石消除小遊戲的過程中，為了建立好維護、不容易產生惡性 bug 的架構，自然推導出來的產物。

引擎的第一個驗證案例就是那款寶石消除遊戲本身，理論與實踐從一開始就是綁在一起的。

### 核心定位

引擎內部完全不認識任何特定遊戲的概念——它不知道「寶石」是什麼、不知道「三消規則」是什麼。

> **引擎只提供機制，不提供內容。**
> 遊戲邏輯全部由開發者在引擎之上自行建立。

### 技術選型

| 項目 | 選擇 | 理由 |
|------|------|------|
| 語言 | TypeScript | 型別保護、編譯期抓錯、AI coding 品質更穩定 |
| 渲染 | Canvas 2D | 效能好、控制精細，適合益智遊戲 |
| 授權 | MIT License | 低門檻、利於普及、遊戲引擎業界主流選擇 |

---

## 2. Architecture Philosophy

### big.LITTLE 架構靈感

Universe Engine 的架構靈感來自 ARM 的 **big.LITTLE 處理器設計**。

- **big（大核心）**：對外提供統一介面，承接重責大任
- **LITTLE（小核心）**：內部各自處理單一職責的輕量任務

```
對外（big）          對內（LITTLE）
LogicCore     →     LoopCore / SceneCore / EntityCore / ...
RenderCore    →     PipelineCore / LayerCore / AssetCore / ...
```

對外看起來簡潔，對內維護起來紮實。

### 核心設計原則

**① 下層不能知道上層的存在**

Core Layer 裡面絕對不能出現任何跟畫面、跟遊戲邏輯有關的 code。

**② 狀態要集中，不能散落各處**

```typescript
// ❌ 狀態散落在各模組
class Board {
  score: number // 分數不應該在 Board 裡
}

// ✅ 有一個單一的 GameState
interface GameState {
  board: BoardState
  selectedCell: GridCoord | null
  score: number
  phase: 'idle' | 'swapping' | 'clearing' | 'refilling' | 'gameover'
}
```

**③ 遊戲邏輯盡量用純函式**

```typescript
// ❌ 直接改狀態，難以 debug
function swapGems(board: Board, from: GridCoord, to: GridCoord) {
  const temp = board.cells[from.row][from.col]
  board.cells[from.row][from.col] = board.cells[to.row][to.col]
  board.cells[to.row][to.col] = temp
}

// ✅ 輸入舊狀態，輸出新狀態
function swapGems(state: GameState, from: GridCoord, to: GridCoord): GameState {
  return { ...state, board: updatedBoard }
}
```

**④ 所有核心透過 Relay 溝通，禁止直接 import 彼此**

```
LogicCore  ──→ Relay ←── RenderCore
                ↕
           Game Layer
```

**⑤ Renderer 只讀狀態，不改狀態**

任何使用者輸入（點擊、拖曳）都要先送回對應的 System 處理，不能在 Renderer 裡直接改資料。

**⑥ 資料驅動，不寫死 if/else**

```typescript
// ❌ 寫死邏輯，日後擴充困難
if (gem.type === 'red') { ... }

// ✅ 用 Map 或設定檔管理
const GEM_SCORE_TABLE: Record<GemType, number> = {
  red: 10,
  blue: 10,
  green: 10,
}
```

---

## 3. Top-Level Architecture

Universe Engine 的最頂層由四個元件組成：

```
Universe Engine
  ├── Singularity   ← 引擎核心調度者
  ├── LogicCore     ← 邏輯大核心
  ├── RenderCore    ← 渲染大核心
  └── Relay         ← 所有溝通的唯一管道
```

### 元件關係圖

```
                  ┌─────────────────────────────┐
                  │        Universe Engine       │
                  │                             │
                  │  Singularity                │
                  │      ↓ 調度                  │
                  │  LogicCore   RenderCore      │
                  │      ↓            ↓          │
                  │         Relay                │
                  └────────↕────────────────────┘
                           ↕
                      Game Layer
                  (Scene / System / Config)
```

所有核心只跟 Relay 說話，Relay 是引擎與遊戲的唯一邊界。

---

## 4. Core Components

### 4.1 Singularity（奇點）

**角色**：引擎核心調度者

**職責**：
- 協調 LogicCore 與 RenderCore 的運作順序
- 管理引擎生命週期（init / start / pause / stop）
- 對外暴露唯一的引擎啟動入口

**命名來源**：宇宙奇點，所有事物的起源點。

---

### 4.2 LogicCore（邏輯大核心）

**角色**：所有遊戲邏輯相關基礎建設的大核心

**對外職責**：提供遊戲邏輯運行所需的所有基礎機制

**內部小核心**（命名待定，採太空主題）：

| 小核心 | 職責 |
|--------|------|
| LoopCore | 遊戲主迴圈、tick 管理、deltaTime 計算 |
| SceneCore | 場景切換、場景生命週期管理 |
| EntityCore | 實體管理、Component 掛載 |

> ⚠️ 各小核心的太空命名尚待確認。

---

### 4.3 RenderCore（渲染大核心）

**角色**：所有畫面輸出相關管線的大核心

**對外職責**：提供畫面繪製所需的所有基礎機制

**內部小核心**（命名待定，採太空主題）：

| 小核心 | 職責 |
|--------|------|
| PipelineCore | 渲染管線管理 |
| LayerCore | 圖層管理（分層繪製） |
| AssetCore | 資源載入與快取管理 |

**圖層分層設計**：

```
Layer 2  →  特效與 UI（動畫、分數彈出）← 最頻繁更新
Layer 1  →  遊戲主體（盤面、方塊）
Layer 0  →  背景（靜態，不常更新）     ← 最少更新
```

圖層分開，特效播放時不需要重繪整個盤面，效能差異顯著。

> ⚠️ 各小核心的太空命名尚待確認。

---

### 4.4 Relay（中繼站）

**角色**：所有溝通的唯一管道

**職責**：
- 作為所有核心之間的事件總線
- 作為引擎與遊戲層之間的唯一通訊邊界
- 提供型別化的事件發送與訂閱介面

**設計原則**：
- Relay 只轉發訊號，不干涉內容
- 沒有任何 Core 直接 `import` 另一個 Core
- 所有事件都必須有明確的 TypeScript 型別定義

**命名來源**：太空通訊中繼衛星，負責連結兩個無法直接溝通的點。

---

## 5. Developer Interface

開發者不需要知道 Singularity 怎麼調度、LogicCore 內部有哪些小核心。對外暴露的 API 只有三個：

| API | 說明 |
|-----|------|
| `Scene` | 建立遊戲場景的基礎介面，繼承後定義自己的場景 |
| `System` | 建立遊戲邏輯的基礎介面，繼承後定義自己的系統 |
| `Relay` | 與引擎溝通的唯一窗口，發送與接收事件 |

### 啟動範例

```typescript
import { UniverseEngine } from '@universe/core'

const engine = new UniverseEngine({
  canvas: '#game-canvas',
  width: 800,
  height: 600
})

engine.use(new MyGameScene())
engine.start()
```

Singularity、LogicCore、RenderCore、Relay 全部在引擎內部自動組裝，開發者不需要接觸。

### 錯誤訊息規範

所有引擎錯誤採用統一格式：

```
[Universe:Relay] 未知的事件類型 'gems:swappped'，是否拼錯？
[Universe:Scene] GameScene 尚未實作 onInit()，場景無法啟動。
[Universe:Render] Canvas element '#game-canvas' 找不到，請確認 HTML 設定。
```

### 易用性策略

目前採用「**C 方案**」：

- ✅ 架構從一開始就要乾淨
- ✅ API 設計要合理
- ✅ 錯誤訊息要清楚
- 🔜 完整文件，之後再補
- 🔜 npm 套件（`@universe/core`），之後再補

---

## 6. Directory Structure

```
/src
  /engine                        ← 引擎層（完全通用）
    /core
      Singularity.ts             ← 引擎調度者
      LogicCore.ts               ← 邏輯大核心入口
      RenderCore.ts              ← 渲染大核心入口
      Relay.ts                   ← 事件總線
      logic/
        LoopCore.ts              ← 主迴圈（命名待定）
        SceneCore.ts             ← 場景管理（命名待定）
        EntityCore.ts            ← 實體管理（命名待定）
      render/
        PipelineCore.ts          ← 渲染管線（命名待定）
        LayerCore.ts             ← 圖層管理（命名待定）
        AssetCore.ts             ← 資源管理（命名待定）
    /interfaces
      ISystem.ts
      IRenderer.ts
      IScene.ts
      IEntity.ts
    /utils
      EventBus.ts
      ObjectPool.ts              ← 效能優化用
      MathUtils.ts
    Engine.ts                    ← 引擎主入口

  /game                          ← 遊戲層（寶石消除遊戲專屬）
    /systems
      BoardSystem.ts
      ScoreSystem.ts
      SwapSystem.ts
      MatchSystem.ts
      GravitySystem.ts
    /renderers
      BoardRenderer.ts
      GemRenderer.ts
      EffectRenderer.ts
    /scenes
      GameScene.ts
      MenuScene.ts
      GameOverScene.ts
    /config
      gems.ts                    ← 寶石種類與分數設定
      boardConfig.ts             ← 棋盤尺寸與消除規則設定
      gameConfig.ts              ← 遊戲常數
    /types
      index.ts                   ← 所有型別定義集中於此

  main.ts                        ← 遊戲啟動點
```

---

## 7. Type System & Relay Event Design

### 核心型別範例

```typescript
// 寶石型別鎖死，不接受任意字串
type GemType = 'red' | 'blue' | 'green' | 'yellow' | 'purple'

// 遊戲狀態集中定義
interface GameState {
  board: BoardState
  selectedCell: GridCoord | null
  score: number
  combo: number
  phase: 'idle' | 'swapping' | 'clearing' | 'refilling' | 'gameover'
}

// 方格棋盤座標
interface GridCoord {
  row: number
  col: number
}
```

### Relay 型別化事件

```typescript
// 遊戲層定義自己的事件型別
interface GemGameEvents {
  'gem:selected': { position: GridCoord }
  'gems:swapped': { from: GridCoord; to: GridCoord }
  'matches:cleared': { cells: GridCoord[]; combo: number }
  'board:refilled': { cells: GridCoord[] }
  'score:updated': { delta: number; total: number }
  'game:over': { finalScore: number }
}

// Relay 帶入型別，全程有型別保護
const relay = engine.getRelay<GemGameEvents>()

relay.on('gems:swapped', ({ from, to }) => {
  // from 與 to 都有完整型別提示
})

relay.emit('gems:swapped', { from, to })
// 打錯事件名稱或傳錯參數，編譯期就報錯
```

---

## 8. Rendering Strategy

| 方案 | 優點 | 缺點 | 結論 |
|------|------|------|------|
| Canvas 2D | 效能好、控制精細 | 需自己處理所有事件 | ✅ 主要渲染方案 |
| SVG | 互動事件方便 | 元素多時效能差 | 適合 UI 層輔助 |
| DOM + CSS | 最快上手 | 動畫特效難做 | ❌ 不適合此遊戲 |
| WebGL / Three.js | 特效強大 | 複雜度過高 | 除非需要 3D 特效 |

---

## 9. Future Expansion

> Relay 的設計讓整個引擎天然具備可擴充性。新增任何一個 Core，只要接上 Relay，就能跟整個引擎溝通，不需要動到現有架構。

### 短期（第一款遊戲開發過程中）

| Core | 功能 | 優先度 |
|------|------|--------|
| AnimationCore | Tween 插值、關鍵影格、Timeline、緩動函式 | 🔴 高 |
| ParticleCore | 粒子發射器、物件池、行為定義 | 🔴 高 |
| StorageCore | 存檔、玩家設定、本地排行榜 | 🟡 中 |
| DevTools | Inspector、Profiler、EventLogger | 🟡 中 |

### 中期（引擎通用化）

| Core | 功能 |
|------|------|
| UICore | Widget、Layout、Modal、i18n |
| AudioCore（進化） | 音效池、BGM 淡入淡出、空間音效 |
| TransitionCore | 場景轉場動畫、轉場期間預載 |

### 長期（對外開放）

| Core / 功能 | 說明 |
|-------------|------|
| PhysicsCore | 整合 Matter.js 或 Rapier（WebAssembly） |
| 多平台輸出 | Electron / Tauri（桌面）、Capacitor / PWA（行動裝置） |
| ScriptCore | 簡易腳本系統，讓非工程師也能定義遊戲行為 |

---

## 10. Security Scope

網頁遊戲的 client 端邏輯在瀏覽器裡是公開的，這是網頁平台的本質限制。

### 現階段（單機網頁遊戲）

資安壓力低，只需要做好：

- **外部輸入驗證**：所有來自 localStorage 或外部的資料都要經過驗證，不能直接使用
- **CSP Header**：防範惡意腳本注入

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'">
```

- **不在 client 端放敏感資料**：API key、secret 等只能存在伺服器端
- **定期執行 `npm audit`**：確保依賴套件沒有已知漏洞

### 未來（加入後端 / 對外開放引擎）

待屆時再針對性設計：伺服器端分數驗證、Rate Limiting、Token 機制、供應鏈安全等。

> 不為現在不存在的風險過度設計。

---

## 11. Validation Project — Match-3 Gem Game

### 專案定位

這款寶石消除小遊戲是 Universe Engine 的**第一個驗證案例**，同時也是對外開放時最自然的範例專案。它的目標不是做出完整商業遊戲，而是用常見、容易理解的玩法驗證引擎能正常運作。

驗證重點包含：

- Singularity 能正確啟動、暫停與停止引擎
- LoopCore 能穩定推進 update / render
- SceneCore 能載入並切換遊戲場景
- LogicCore 能執行棋盤、交換、消除、補落與計分邏輯
- RenderCore 能透過 Canvas 2D 繪製棋盤、寶石與簡單消除效果
- Relay 能以型別安全事件串接輸入、邏輯與渲染

### 基礎機制

以常見 **Match-3** 寶石消除為基礎玩法：

- 棋盤使用固定大小方格，建議從 8 × 8 開始
- 每格放置一顆寶石
- 玩家選取相鄰兩顆寶石並交換位置
- 若交換後形成水平或垂直 3 顆以上同色連線，即觸發消除
- 消除後上方寶石向下補落，空格由新寶石補滿
- 補落後若形成新的連線，可繼續連鎖消除
- 若交換沒有形成消除，寶石交換回原位
- 遊戲結束條件可先採用時間、步數或手動結束；最小驗證版不要求完整關卡設計

### 寶石系統

寶石本身只需要常見顏色或形狀即可，不要求精緻美術：

| 寶石 | 建議表現 |
|------|------|
| red | 紅色圓形或菱形 |
| blue | 藍色圓形或菱形 |
| green | 綠色圓形或菱形 |
| yellow | 黃色圓形或菱形 |
| purple | 紫色圓形或菱形 |

寶石種類、顏色、基礎分數與出現權重應集中放在 config，不應散落在 BoardSystem、Renderer 或輸入處理中。

### 核心流程

| 步驟 | 責任模組 | 說明 |
|------|------|----------|
| 選取 | Input / Scene | 將點擊座標轉成 GridCoord，透過 Relay 通知 game system |
| 交換 | SwapSystem | 檢查兩格是否相鄰，產生新 GameState |
| 消除判定 | MatchSystem | 掃描水平與垂直 3 顆以上同色連線 |
| 補落 | GravitySystem | 讓上方寶石下落並補滿空格 |
| 計分 | ScoreSystem | 依消除數量與 combo 計算分數 |
| 渲染 | BoardRenderer / GemRenderer | 根據 GameState 繪製棋盤，不持有邏輯狀態 |

### 驗證範圍

最小驗證版只要求能證明 Universe Engine 的架構可運作，不要求複雜玩法：

- 不需要關卡、道具、特殊寶石、音效或精緻動畫
- 不需要伺服器、帳號、排行榜或付費流程
- 不需要複雜 AI 提示或自動洗牌
- 可以使用純色幾何圖形代表寶石
- 需要有可觀察的狀態變化：選取、交換、消除、補落、計分

### 技術約束

- GameState 必須是遊戲狀態來源，renderer 只讀取狀態
- GridCoord 使用 row / col，座標轉換集中管理
- MatchSystem 應以資料與純函式為主，避免直接操作 Canvas 或 DOM
- Relay event 必須由 GemGameEvents 類型約束
- 寶石設定應集中於 `game/config/gems.ts` 或同等 config 檔案
- BoardSystem、SwapSystem、MatchSystem、GravitySystem、ScoreSystem 應維持單一責任

### 技術參考

Match-3 規則本身應保持簡單，實作重點放在引擎資料流與責任邊界。消除判定可先採用水平與垂直掃描：從每個格子出發計算同色連續長度，長度達 3 以上即加入待清除集合。

---

## 12. Open Items

以下為目前明確的設計空白，需要在開始實作前補完：

- [ ] LogicCore 內部小核心的完整清單與太空命名
- [ ] RenderCore 內部小核心的完整清單與太空命名
- [ ] 各核心詳細介面定義（`ISystem`、`IScene`、`IRenderer` 等）
- [ ] Relay 型別化事件的完整設計細節
- [ ] 寶石消除驗證遊戲的棋盤尺寸、寶石種類與分數規則確認
- [ ] Entity-Component System（ECS）是否採用（目前傾向不做完整 ECS，用輕量 System 架構）

---

## 13. Roadmap

### Phase 0｜設計收斂（現在）
- [ ] 確認 LogicCore 與 RenderCore 內部小核心清單與命名
- [ ] 確認所有核心介面定義（ISystem / IScene / IRenderer）
- [ ] 確認 Relay 型別化事件設計
- [ ] 確認寶石消除驗證遊戲的最小規則

### Phase 1｜引擎最小可跑版本
- [ ] 實作 Singularity 調度機制
- [ ] 實作 LoopCore（主迴圈）
- [ ] 實作 Relay 事件系統
- [ ] 實作 RenderCore 基礎（Canvas 輸出 + 圖層）
- [ ] 實作 SceneCore（場景切換）

### Phase 2｜寶石消除驗證遊戲
- [ ] 實作 GridCoord 與棋盤座標轉換
- [ ] 實作 BoardSystem（盤面邏輯）
- [ ] 實作 SwapSystem（相鄰交換與無效交換回復）
- [ ] 實作 MatchSystem（水平 / 垂直三消判定）
- [ ] 實作 GravitySystem（補落與補滿）
- [ ] 實作 ScoreSystem（計分）
- [ ] 實作 BoardRenderer / GemRenderer
- [ ] 接上 AnimationCore 與 ParticleCore

### Phase 3｜引擎完善
- [ ] 補充 StorageCore（存檔、排行榜）
- [ ] 補充 DevTools（EventLogger、Inspector）
- [ ] 整理 API 文件
- [ ] 發布 npm 套件（`@universe/core`）

---

*Universe Engine — Built for games. Proven by games.*
