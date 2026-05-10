# AGENTS.md

本檔案定義 Codex 與所有子代理在本專案中的工作規範。所有代理必須以 `docs/spec.md` 作為最高層級的產品與架構契約；若本檔與 `docs/spec.md` 發生衝突，以 `docs/spec.md` 為準。

## 語言與溝通

- 所有說明、計畫、變更摘要、問題分析與風險回報一律使用繁體中文。
- 回報時必須具體說明：改了哪些檔案、為什麼這樣改、主要邏輯變更、可能風險或後續注意事項。
- 不可用模糊語句宣稱完成。只有在符合本檔 Definition of Done 時才可宣告完成。

## 規格契約優先順序

代理在做任何設計、修改或審查前，必須依下列順序判斷依據：

1. `docs/spec.md` 的明確規格、架構、API、型別、目錄結構與 roadmap。
2. 現有程式碼、檔案命名、型別定義、測試與註解。
3. 本 `AGENTS.md` 的工程流程與代理協作規範。
4. 一般 TypeScript、Canvas 2D、遊戲引擎與前端工程最佳實務。

若 `docs/spec.md` 文字因編碼或草稿狀態導致不可判讀，代理不得自行發明需求。必須先從可讀段落、範例程式碼、表格、目錄結構與 roadmap 推斷最小可行意圖；仍不確定時，應標示不確定點並請使用者確認。

## Harness Engineering 工作方式

本專案採用 Harness Engineering：先建立可驗證契約，再實作，並用最小範圍的測試或驗證 harness 防止行為飄移。

每次工作必須遵守：

1. Spec Harness：開始前先對照 `docs/spec.md`，列出本次任務涉及的規格條款或章節。
2. Architecture Harness：修改必須維持 Universe Engine 的核心邊界，不可破壞 big.LITTLE core 分層、Relay 解耦與 game layer 分離。
3. Type Harness：所有公開事件、狀態、座標、scene、system、renderer 介面都要以 TypeScript 型別約束，不可以 `any` 或鬆散物件繞過契約。
4. Behavior Harness：新增或修改核心行為時，必須提供可重複驗證方式，例如單元測試、範例場景、型別檢查、最小 demo 或明確手動驗證步驟。
5. Drift Harness：實作完成後必須回頭檢查是否偏離 `docs/spec.md`，尤其是 API 名稱、事件名稱、目錄位置、責任邊界與資料流。

若目前專案尚未建立測試框架，代理不得為單一小任務引入大型測試框架；應先使用最小可行驗證，例如 TypeScript 編譯、輕量測試檔、可執行範例或清楚的手動驗證流程。

## 專案架構契約

本專案是 Universe Engine，又稱 Universe Web Game Engine，目標是以 TypeScript 建立可維護、可擴展、可由遊戲驗證的網頁遊戲引擎。

必須維持下列架構方向：

- 語言：TypeScript。
- 主要渲染策略：Canvas 2D。
- 授權方向：MIT。
- Top-level 架構：`Singularity`、`LogicCore`、`RenderCore`、`Relay`。
- big.LITTLE 分層：`LogicCore` 與 `RenderCore` 是 big core；`LoopCore`、`SceneCore`、`EntityCore`、`PipelineCore`、`LayerCore`、`AssetCore` 等是 little core。
- 遊戲驗證專案：Match-3 Gem Game，行為應參考 `docs/spec.md` 的常見寶石消除玩法、方格棋盤、交換、三消、補落與計分約束。

### 核心責任邊界

- `Singularity`：引擎生命週期與總入口，包含 init、start、pause、stop 等控制；負責協調 core，不應承擔遊戲規則。
- `LogicCore`：遊戲邏輯核心入口，協調 loop、scene、entity 等邏輯子核心；不應直接處理 Canvas 繪圖。
- `RenderCore`：渲染核心入口，協調 pipeline、layer、asset 等渲染子核心；不應直接擁有遊戲規則狀態。
- `Relay`：跨 core 與 game layer 的型別安全事件橋接；core 之間不得用任意直接 import 製造耦合。
- Game Layer：scene、system、renderer、config、types 必須放在遊戲層，不能把具體遊戲規則塞回 engine core。

## 指定目錄契約

實作時應優先遵守 `docs/spec.md` 的目錄結構：

```text
src/
  engine/
    core/
      Singularity.ts
      LogicCore.ts
      RenderCore.ts
      Relay.ts
      logic/
        LoopCore.ts
        SceneCore.ts
        EntityCore.ts
      render/
        PipelineCore.ts
        LayerCore.ts
        AssetCore.ts
    interfaces/
      ISystem.ts
      IRenderer.ts
      IScene.ts
      IEntity.ts
    utils/
      EventBus.ts
      ObjectPool.ts
      MathUtils.ts
    Engine.ts
  game/
    systems/
      BoardSystem.ts
      ScoreSystem.ts
      SwapSystem.ts
      MatchSystem.ts
      GravitySystem.ts
    renderers/
      BoardRenderer.ts
      GemRenderer.ts
      EffectRenderer.ts
    scenes/
      GameScene.ts
      MenuScene.ts
      GameOverScene.ts
    config/
      gems.ts
      boardConfig.ts
      gameConfig.ts
    types/
      index.ts
  main.ts
```

若實際專案結構尚未建立，新增檔案時應靠近此結構；若現有結構已不同，必須先分析差異並選擇最小遷移或局部相容做法，不可任意大規模重排。

## TypeScript 與資料契約

- `GameState` 必須作為遊戲狀態來源，不可把分數、階段、棋盤、選取格、combo 等狀態分散藏在 renderer 或 UI 物件內。
- 方格座標應遵守 spec 中的 `GridCoord` 契約：`row`、`col`，並由集中座標轉換邏輯處理 Canvas 點擊與棋盤格的對應。
- Game phase 應遵守 `'idle' | 'swapping' | 'clearing' | 'refilling' | 'gameover'` 類型方向，除非 `docs/spec.md` 更新。
- GemType 應遵守 `'red' | 'blue' | 'green' | 'yellow' | 'purple'` 方向，並透過 config 或型別集中管理。
- 寶石種類、分數與出現權重應使用資料表、map 或 config 驅動，不可散落大量 if/else。
- 不可使用未受型別約束的事件名稱或 payload。Relay event 必須由泛型事件 map 約束。

Relay 事件契約應以 `docs/spec.md` 為準，包含但不限於：

```typescript
interface GemGameEvents {
  'gem:selected': { position: GridCoord }
  'gems:swapped': { from: GridCoord; to: GridCoord }
  'matches:cleared': { cells: GridCoord[]; combo: number }
  'board:refilled': { cells: GridCoord[] }
  'score:updated': { delta: number; total: number }
  'game:over': { finalScore: number }
}
```

事件名稱、payload 欄位與公開 API 不可任意改名。若發現 spec 中拼字與現有程式碼不一致，必須先指出差異並選擇一個相容策略。

## 實作規範

- 先理解現有架構與檔案關係，再開始修改。
- 優先修正根因，不做只處理表面症狀的補丁。
- 修改範圍必須與任務直接相關，不可順手重構大量無關檔案。
- 不可為了短期速度犧牲核心邊界，例如把 engine core、game rules、renderer、UI、config 混在同一層。
- 不可把 renderer 當成 state owner。renderer 只接收狀態或 render command。
- 不可讓 core 直接依賴具體遊戲模組。核心應提供抽象能力，game layer 透過 scene、system、renderer、Relay 使用。
- 不可因為方便而跳過 lifecycle、scene、system 或 Relay 設計。
- 不可硬編 API key、token、密碼、帳號資訊或敏感資料。
- 不可未經明確需求引入新的主要框架、套件管理方式或大型依賴。

## Codex 與子代理協作規範

Codex 主代理負責最終整合與契約把關。任何子代理都必須嚴格遵守本檔與 `docs/spec.md`。

指派子代理時，主代理必須在任務描述中明確提供：

- 本次任務涉及的 `docs/spec.md` 章節或契約。
- 子代理可修改的檔案或目錄範圍。
- 子代理不可修改的邊界，例如不得改動公開 API、Relay event、核心目錄結構或 unrelated files。
- 驗證方式，例如型別檢查、測試、範例執行或手動驗證清單。

子代理不得：

- 自行擴寫 spec 未要求的玩法、核心、API 或資料格式。
- 為了完成局部任務而重排整體架構。
- 繞過 Relay 直接建立 core 之間或 game-to-render 的強耦合。
- 使用與主代理任務衝突的檔案修改。
- 覆蓋其他代理或使用者已做的變更。

主代理在整合子代理結果後，必須檢查：

- 是否符合 `docs/spec.md`。
- 是否維持責任邊界。
- 是否有行為飄移。
- 是否有未說明的新增需求、依賴或架構變更。

## 行為飄移防護

以下情況視為行為飄移，必須避免或立即回報：

- API 名稱、事件名稱、payload 結構與 `docs/spec.md` 不一致。
- core 之間繞過 Relay 直接互相依賴。
- renderer 持有或修改遊戲邏輯狀態。
- system 同時承擔資料、渲染、輸入、音效或 UI 多種不相干責任。
- 新增 gameplay 規則但沒有對應 spec、config 或測試。
- 使用 magic string、magic number 取代集中 config。
- 因為 spec 草稿不完整而自行補出大型功能。
- 以註解、跳過檢查或吞掉錯誤的方式假裝流程成功。

若任務需要偏離 `docs/spec.md`，必須先明確說明偏離原因、影響範圍與替代方案，並取得使用者同意後才能實作。

## 驗證要求

完成修改前，代理必須盡力執行與任務相符的驗證：

- TypeScript 型別檢查。
- 單元測試或最小行為測試。
- 若涉及 Canvas 或 UI，執行本機頁面並檢查畫面是否非空白、無明顯重疊、互動符合預期。
- 若涉及方格棋盤，檢查 `GridCoord` 是否在棋盤範圍內，並確認 Canvas 點擊座標到棋盤格的轉換一致。
- 若涉及 Relay，檢查事件名稱與 payload 型別。
- 若涉及 config，檢查資料表是否集中且可擴充。

若驗證無法執行，回報時必須說明原因與殘留風險。

## Definition of Done

只有在以下條件都成立時，才能宣告完成：

- 任務要求的內容已完成。
- 修改符合 `docs/spec.md` 的明確規格契約。
- 沒有引入明顯結構錯誤。
- 沒有讓 core、game layer、renderer、config 或 Relay 的責任邊界更混亂。
- 沒有引入未經同意的新主要依賴或大型架構變更。
- 已執行可行的驗證，或清楚說明無法驗證的原因。
- 回報內容完整且可理解，包含修改檔案、修改原因、主要邏輯變更與風險。
