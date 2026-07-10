# 05 · PRD 建设规格（可执行）

> 广西台风救援平台 — 核心模块建设规格。技术负责人交付，供前端/后端直接落地。
> 现有栈：Vite + React 18 + TS + TailwindCSS + react-router-dom v6 + `@supabase/supabase-js`（移动端优先，`max-w-app` 容器）。
> 现有页面：首页 `/`、台风预报 `/forecast`、救援电话 `/phones`、求助互助 `/aid`、灾后指南 `/guide`。
> 现有约定：`VerifyLevel = verified | structural | media | unverified`；`VerifyBadge` / `CallRow` / `Disclaimer` 组件；`isSupabaseConfigured` 降级（后端未配置时进入本地演示/只读，静态部分不受影响）。
> 关联调研：`04-罕见病与灾害医疗.md` · `06-中国地图集成方案.md` · `07-AI拍照求助设计.md` · `08-物资与安置点.md`。

---

## 0. 总体结论与信息架构决策

### 0.1 底部导航取舍（关键）
底部 5 个 Tab 已满（首页 / 台风预报 / 救援电话 / 求助互助 / 灾后指南），移动端不宜再加第 6 个（挤压 + 误触）。**决策：不新增底部 Tab，把新模块全部收进「求助互助」页（`/aid`）内的二级 Tab。**

`MutualAid.tsx` 已经使用 in-page 二级 Tab（`help / volunteer / donate`），把它扩为 6 个二级 Tab：

| 二级 Tab | key | 内容 | 来源 |
|---|---|---|---|
| 求助墙 | `help` | 现有求助墙（保留） | 现有 |
| 拍照求助 | `sos` | **新增** AI 拍照/一句话求助 → 结构化 → 入求助墙分派 | 模块 A |
| 物资/安置 | `stations` | **新增** 物资站点/安置点/医疗点/取水点 + 导航前往 | 模块 D |
| 罕见病 | `rare` | **新增** 罕见病/慢病灾时用药·透析·供氧应急 + 基金会热线 | 模块 E |
| 我要报名 | `volunteer` | 现有志愿者/救援队报名（保留） | 现有 |
| 物资捐赠 | `donate` | 现有合规捐赠（保留） | 现有 |

> 二级 Tab 变多 → 顶部 Tab 条改为**横向可滚动**（`overflow-x-auto flex-nowrap`，`whitespace-nowrap`），避免换行。「拍照求助」给红点/高亮，作为主推入口。
> 「拍照求助」同时在**首页放一个醒目大按钮**（`/aid?tab=sos`），因为它是灾时最高频入口，藏在二级 Tab 里不够快。

### 0.2 路由方案（不新增底部 Tab，但需可深链）
保持 5 条底部路由不变。为让首页大按钮 / 分享链接能直达某个二级 Tab，`/aid` 支持 `?tab=` 查询参数，也支持子路径深链：

```
/aid              → 默认 help
/aid?tab=sos      → 拍照求助（首页大按钮指向这里）
/aid?tab=stations → 物资/安置
/aid?tab=rare     → 罕见病
```

实现：`MutualAid` 用 `useSearchParams()` 读 `tab`，无值回退 `help`；切 Tab 时 `setSearchParams({tab}, {replace:true})`。物资站点详情用 `?tab=stations&station=<id>`（弹层/展开），避免引入新顶层路由。

### 0.3 模块总清单
| 模块 | 代号 | 状态 | 底部 Tab | 位置 |
|---|---|---|---|---|
| A 拍照 AI 求助 | `sos` | 新增 | 不加 | `/aid` 二级 Tab + 首页大按钮 |
| B 地图/导航能力 | `map` | 新增（能力层，非独立页） | 不加 | 被 D/求助墙复用 |
| C 实时救援队位置 | `teams` | 新增（数据+降级） | 不加 | 物资/安置 Tab 内的地图图层 |
| D 物资站点/安置点 | `stations` | 新增 | 不加 | `/aid` 二级 Tab |
| E 罕见病与灾害医疗 | `rare` | 新增 | 不加 | `/aid` 二级 Tab（并在救援电话页加一组热线） |

---

## 1. 要新增/改造的模块清单

### 模块 A — 拍照 AI 求助（`sos`）
**目标**：让不便打字、说方言、描述零散的受灾群众，用「拍一张照 + 说一句话」产出一条严格结构化、可直接分派的求助记录；AI 不可用时用同字段引导式表单兜底，永不失效。

- **页面/组件**（新建目录 `src/pages/sos/` 或 `src/components/sos/`）
  - `SosEntry.tsx`：拍照求助主入口（拍照/相册 + 语音转文字或文本框 + 「一键求助」）。
  - `SosReview.tsx`：AI 预填后的**确认页**——高亮 `confidence.low_fields` 与 `_uncertain`，用户只改高亮项即可提交（最省力路径）。
  - `SosWizard.tsx`：降级引导式分步表单（一屏一问、大按钮少打字），字段与 AI 版**完全一致**，产出同一份 JSON、进同一分派流。
  - `sos/schema.ts`：need schema 的 TS 类型 + Zod 校验 + `urgency` 就高规则（前端与云函数共享）。
  - 复用 `Disclaimer` / `VerifyBadge`。
- **数据模型**：产出 `HelpRecord`（见 §2 need schema），写入 `help_requests` 表（现有表已含 `urgency / needs(jsonb) / rare_disease(jsonb) / lat / lng` 列，无需改表结构，只需扩展写入字段）。
- **集成点**：
  - 提交后进入现有**求助墙**（`help` Tab）分派；罕见病分支额外抄送罕见病社区（后端/人工）。
  - 复用 `lib/aid.ts` 的 `addHelpRequest()` 降级逻辑：Supabase 未配置 → 本地内存/`localStorage` 暂存。
  - 首页新增大按钮 → `/aid?tab=sos`。
  - 照片存 Supabase Storage 私有桶，`mediaRefs` 存引用 key。

### 模块 B — 地图/导航能力层（`map`，非独立页）
**目标**：给「物资站点」「求助墙」提供零 key、零备案、大陆免翻墙的「导航前往」按钮，以及（阶段 2）内嵌交互多点地图。

- **组件/工具**（新建 `src/lib/map.ts`）
  - `amapNav()` / `qqNav()`：高德/腾讯导航 URI 生成（双唤起备份）。
  - `amapMarker()` / `qqMarker()`：单点标注 URI。
  - `toGCJ02()`：坐标系统一工具（全站统一 GCJ-02，标注每条数据是 WGS-84 还是 GCJ-02）。
  - `NavButtons.tsx`：物资站点/求助卡片右下角的「高德导航 / 腾讯导航」双按钮组件。
  - （阶段 2）`AMapCanvas.tsx`：高德 JS API 2.0 内嵌多点地图，无 key 时降级为列表 + 导航按钮。
- **数据模型**：消费 `ReliefStation`（模块 D）与救援队位置（模块 C）的 `{lat,lng,name}`。
- **集成点**：被模块 D、求助墙、罕见病医院卡片复用；不占底部 Tab。

### 模块 C — 实时救援队位置（`teams`）
**目标**：在物资/安置 Tab 的地图上叠加救援队实时/近实时位置；无数据源时优雅降级为「官方力量电话卡片」，绝不虚构定位。

- **组件**：`RescueTeamLayer.tsx`（地图图层）+ 列表降级视图。
- **数据模型**：`RescueTeam`（见 §3.3），`geoStatus` 同 `ReliefStation`（`official / name_only / unknown`）。
- **集成点**：数据源见 §3.3（无公开实时 API → 默认走「电话 + 官方通报」降级）；与救援电话页的省级/民间力量电话打通。

### 模块 D — 物资站点/安置点（`stations`）
**目标**：呈现安置点/物资发放点/医疗点/取水点，每张卡片带可信度徽标 + 「拨打确认是否开诊/是否开放」+「导航前往」，官方未给的地址/坐标/容量/电话一律留空、绝不杜撰。

- **页面/组件**：`StationList.tsx`（卡片列表 + 城市/类型筛选）、`StationCard.tsx`、`StationMap.tsx`（阶段 2 内嵌）、官方查询入口外链区。
- **数据模型**：`ReliefStation`（见 §4.1），写入/读取 `supply_stations` 表（已存在，需按 §4.1 补充 `geo_status / capacity / occupancy / service_scope / access_note / source / updated_at` 列）。
- **集成点**：复用模块 B 导航按钮；`verify` 分级决定是否允许一键导航（`unverified` 只给官方外链，不给导航到具体坐标）；聚合入口优先外链应急管理部「全国应急避难场所查询系统」。

### 模块 E — 罕见病与灾害医疗（`rare`）
**目标**：给罕见病/慢病患者家庭一个灾时「找钱/找药/找资源 + 用药/透析/供氧应急自救」出口，热线严格按 verify 分级渲染。

- **页面/组件**：`RareHome.tsx`（分病种应急要点 folder + 基金会/热线卡片 + 「我的应急包」清单模板）、复用 `CallRow` + `VerifyBadge`。
- **数据模型**：静态 `rareOrgs / rareHotlines / emergencyMeds`（见 §5），无用户输入即可用；用户若从拍照求助勾选「涉罕见病」则触发 `rareDisease` 附加字段（§2）。
- **集成点**：救援电话页 `/phones` 增加「罕见病/慢病援助」分组（12320 / 12345 / 120 + 病痛挑战 400）。拍照求助的罕见病分支结果抄送对应病友社区。

---

## 2. 拍照 AI 求助：前端流程 + need schema + 降级表单 + 代理部署

### 2.1 前端流程（渐进增强：AI 与表单不是二选一，而是同一表单 + AI 预填）
```
[首页大按钮 / 二级Tab sos]
      │
      ▼
① 采集：拍照(可多张,长边压~1280px) + 一句话(文本框/语音转写)   ← 语音先转文字再喂入
      │
      ▼
② 上传照片 → Supabase Storage 私有桶，拿到 mediaRefs(引用key)   ← 不经 AI
      │
      ├─(AI 可用)→ POST {mediaRefs 或临时签名URL, userText} 到「AI代理云函数」(前端不带任何AI密钥)
      │                └→ 代理注入 promptTemplate 调国产多模态API → JSON mode → Zod+语义校验+就高兜底
      │                └→ 返回结构化 HelpRecord（预填）
      │            ▼
      │      ③ SosReview 确认页：整表预填，只高亮 confidence.low_fields / _uncertain，
      │            用户改高亮项 → 电话缺失强制补录 → 提交
      │
      └─(AI 不可用/超时/限流)→ 自动回退 SosWizard 引导式分步表单（空白起步，逐步填）
                         ▼
                   同一份 HelpRecord（confidence.overall=1, _uncertain=[]）
      │
      ▼
④ 提交 addHelpRequest()：写 help_requests（urgency/needs/rare_disease/lat/lng）
   └ Supabase 未配置或云函数不可达 → localStorage 暂存，提示「网络恢复自动提交」(同现有互助本地降级)
      │
      ▼
⑤ 进求助墙分派；rareDisease 非空 → 抄送罕见病社区（后端/人工）
   照片始终上传存证；AI 恢复后可对纯手动记录异步补跑回填结构化字段
```
**工程加固**：开启 JSON mode / structured outputs；服务端 Zod + 语义校验（防 `confidence` 全填 0.99 的幻觉、纠正枚举越界）；温度 0~0.3；图片长边压至 ~1280px；语音先转写为文字再喂入。

### 2.2 need schema（`sos/schema.ts` 的 TS 结构；写入 `help_requests`）
主记录字段（AI 只上调不下调 `urgency`；看不到/听不清一律 `null`，数组 `[]`，绝不编造）：

| key | 类型 | 说明 |
|---|---|---|
| `urgency` | `"critical"\|"high"\|"medium"\|"low"` | 涉生命/被困/断药/婴幼儿默认就高 |
| `needTypes` | `enum[]` | `trapped/medical/supplies/medication/evacuation/missing/rescue_water/shelter/psychological/other` |
| `locationText` | `string` | 原文位置，保留原样，不补全未提及行政区/门牌 |
| `locationDetail` | `string\|null` | 照片/文字辅助定位线索（门牌、店招、地标、楼层） |
| `peopleCount` | `int\|null` | 未明确则 null 不猜 |
| `hasElderly` / `hasChildren` / `hasPregnant` / `hasInjuredSick` | `bool\|null` | 三态；未提及=null |
| `injuryNote` | `string\|null` | 伤病简述，只描述可见事实不臆断诊断 |
| `vulnerableNote` | `string\|null` | 残障/失能/精神障碍/独居 |
| `suppliesNeeded` | `{item,quantity,unit,note}[]` | 数量不明填 null |
| `canMove` | `"yes"\|"partial"\|"no"\|"unknown"` | 影响转移方案 |
| `waterLevel` | `"none"\|"ankle"\|"knee"\|"waist"\|"chest_above"\|"unknown"` | 台风洪涝专用 |
| `powerComm` | `enum[]` | `power_out/no_signal/phone_low_battery/water_cut/normal/unknown`，影响回访方式 |
| `isRareDisease` | `bool\|null` | true 触发 `rareDisease` 分支 |
| `contact` | `{name,phone,altContact,canCallBack}` | 电话缺失前端强制补录 |
| `rareDisease` | `object\|null` | 见下表；未涉及填 null |
| `confidence` | `{overall:0~1, low_fields:[]}` | overall<0.6 前端标「需人工确认」 |
| `_uncertain` | `string[]` | 推测/不确定字段名与原因（如方言音译不确定） |
| `rawText` | `string` | **必填**，用户原话/转写全文，方言不改写 |
| `mediaRefs` | `string[]` | 照片/语音在 Storage 的引用 key，供人工复核 |

`rareDisease` 附加字段（`isRareDisease=true` 时）：
`diseaseName`（只登记明确文字，不由症状反推，未知 null） · `diseaseCategory`（`rare_metabolic/blood_coagulation/neuromuscular/immune/renal_dialysis/respiratory_oxygen/endocrine/other/unknown`） · `currentVitals`（意识/进食/抽搐/出血/呼吸/体温/血糖，只记事实） · `medicationsNeeded[]`（`{drugName,dose,remainingAmount,runOutDate,source}`，**剩余量与还能撑几天最关键**） · `needsDialysis`+`dialysisNote`（末次透析/频率/原点是否停摆，中断=生命威胁） · `needsOxygen`+`oxygenNote`（制氧机是否依赖电力/氧瓶剩余/流量） · `coldChainMeds`+`coldChainNote`（需冷藏药名/是否断冷/可维持时长） · `deviceDependent[]`（`{device,powerDependent,consumableNote}`） · `medicalDocs`（`{hasDocs,docRefs}`） · `foundationLinked`（已联系的基金会/病友组织） · `allergyContra`（过敏/禁忌）。

**urgency 分诊（就高不就低，前端 util 与云函数共享同一份规则）**
- `critical 危急(红)` 首响立即/<30min：水位齐胸以上被困、无法呼吸、大出血/昏迷、透析/供氧/冷链药中断危及生命、临产、多名婴幼儿被困、结构坍塌困人。
- `high 紧急(橙)` 首响<2h：被困待转移(膝~腰)、急病伤员需就医、断药 24h 内耗尽、老人/婴幼儿/孕产妇处恶劣环境、慢病体征恶化。
- `medium 一般(黄)` 首响当日：基本物资数日内耗尽、需转移但环境安全、失联寻人无伤情线索。
- `low 普通(绿)` 首响 24–48h：生活物资补充、信息咨询、情绪支援、灾后重建协助。

**prompt 模板**：完整 system prompt（最高原则/枚举约定/输出 JSON 结构/用户输入占位符）见 `07-AI拍照求助设计.md`。要点：只写能确证信息、严禁臆造门牌/病名/人数、方言稳健归纳并在 `_uncertain` 标「音译不确定」、就高判定、`rawText` 原样、只输出 JSON 无 markdown。

### 2.3 降级引导式表单（`SosWizard.tsx`，字段与 AI 版一致，产出同一 JSON）
交互形态：一屏一问、大按钮少打字、图标+文案双标、高对比大字号、支持语音输入到文本框、每步可跳过（跳过=该字段 null，只填一步也能提交）。

| 步 | 问题 | 映射字段 |
|---|---|---|
| ① | 你最需要什么（图标多选卡片；选被困/涉水追加水位图示） | `needTypes`（→追加 `waterLevel`） |
| ② | 有多危险（三档大按钮，前端执行就高逻辑） | `urgency` |
| ③ | 你在哪里（文本框 + 拍周围照片/门牌，可选浏览器定位） | `locationText` / `mediaRefs` / `lat,lng` |
| ④ | 都有谁（人数步进器 + 老人/小孩/孕妇/伤病/残障勾选） | `peopleCount` / `hasElderly...` / `vulnerableNote` |
| ⑤ | 能不能动 + 断电断网 | `canMove` / `powerComm` |
| ⑥ | 需要哪些东西（常用物资快捷标签 + 数量步进） | `suppliesNeeded` |
| ⑦ | 罕见病分支（勾选展开：病名可拍药盒替代打字、当前状态、所需药物+剩余量+还能撑几天、是否需透析/供氧/冷藏药） | `rareDisease.*` |
| ⑧ | 联系方式（**必填电话缺失强提示**） | `contact` |

对齐要点：每步直接映射字段名；提交对象与 AI 版结构一致；表单版 `confidence.overall=1`、`_uncertain=[]`、`rawText` 存自由文本 + 手动填写标记；`urgency` 就高规则由共享 util 保证分诊一致；拍照仍上传存证，AI 恢复后可异步补跑回填。

### 2.4 AI 代理部署（免翻墙、不暴露密钥）
**威胁模型**：前端是 Vite 静态站，任何写进前端的 AI 密钥都会被浏览器看到 → **AI 调用绝不能前端直连，必须经服务端代理**，密钥只存服务端环境变量。

**推荐架构（BFF 代理）**：
```
手机浏览器静态站
  → 上传照片到 Storage/COS 拿签名URL
  → POST {mediaRefs,userText} 到代理函数（前端零密钥）
  → 代理层注入 promptTemplate 调国产多模态API + schema校验/纠错/就高兜底 + 限流风控
  → 结构化JSON写入数据库（help_requests）
  → 分派 + 抄送罕见病社区
```

**代理选型**：
- **面向大陆首选：腾讯云 SCF / 阿里云 FC**（国内可用区、免翻墙、低延迟、便于备案；密钥存函数环境变量/KMS；前端只调 HTTP 网关；与国产多模态 API 同厂商内网更快）。结果回写 Supabase 复用现有互助表结构。
- 备选 Supabase Edge Function：改动最小（密钥 `supabase functions secrets set` 存、`Deno.env.get` 读、绝不进浏览器），但托管境外、大陆直连稳定性/合规需实测；建议仅做调度写库，把对外多模态推理放国内云函数。
- **折中落地路径**：`前端 → 国内云函数(SCF/FC) 做 AI 推理代理 → 国产多模态API`，结构化结果再写回 Supabase 复用现有数据层。既不暴露密钥、大陆免翻墙、又复用现有数据层。

**可选多模态模型（国内免翻墙，2026 现价参考，以官网为准）**：
- 首选 **阿里通义千问 Qwen-VL / Qwen2.5-VL**（OCR 强，适合读药盒/病历/门牌，生态最稳，约 ¥0.008/千 token 起）。
- 备选 智谱 GLM-4V/4.6V（原生多模态+工具调用，约 ¥0.05/千 token）；阶跃星辰 Step-1V（响应快，输入约 ¥0.005–0.015/千 token）。
- 代理层做成**模型可插拔 + 失败自动切换**，避免灾时单点限流。

**安全可用性**：密钥仅代理层环境变量、前端零密钥、全站 HTTPS；代理层加图片大小/张数上限 + 单 IP 限流防刷爆额度；AI 超时/限流即回退引导式表单并提示「已切手动」；病历病情为敏感个人信息 → 私有桶 + 签名 URL 仅授权救援方可读、日志脱敏。

---

## 3. 地图/导航（零 key / 零备案）+ 实时救援队位置

### 3.1 落地方式（推荐路径）
**首选高德 URI 唤起 + 腾讯 URI 双备份**，一个 `<a href>` 即可，**完全零 key、零备案、大陆免翻墙直连**。内嵌交互多点地图（阶段 2）用高德 JS API 2.0。托管选境外平台（Cloudflare Pages / Vercel / GitHub Pages）同时满足免备案 + 免翻墙。

**备案说明**：ICP 备案与 key 无关，只取决于托管服务器所在地。境外托管免 ICP 备案且免翻墙；境内服务器/CDN 才需备案。URI 唤起与 JS API 内嵌地图均不要求站点已备案。

**⚠️ 关键风险**：两家坐标系与经纬度顺序相反——**高德 `lng,lat`（GCJ-02）/ 腾讯 `lat,lng`**。救援场景务必统一坐标系（建议全站转 GCJ-02 并标注每条原始是 WGS-84 还是 GCJ-02）并真机测试，避免定位偏移害人跑空。

### 3.2 导航 / 标注 URI 模板（`lib/map.ts`）
```
# 导航（driving）
高德(零key, 经度在前): https://uri.amap.com/navigation?to={LNG},{LAT},{NAME}&mode=car&src={APPNAME}&coordinate=gaode&callnative=1
腾讯(需referer, 纬度在前): https://apis.map.qq.com/uri/v1/routeplan?type=drive&to={NAME}&tocoord={LAT},{LNG}&coord_type=2&referer={APPNAME}

# 单点标注（marker）
高德(零key, 经度在前): https://uri.amap.com/marker?position={LNG},{LAT}&name={NAME}&src={APPNAME}&coordinate=gaode&callnative=1
腾讯(需referer, 纬度在前, 网页仅1点): https://apis.map.qq.com/uri/v1/marker?marker=coord:{LAT},{LNG};title:{NAME};addr:{ADDR}&referer={APPNAME}
```
- 卡片放「高德导航」+「腾讯导航」双按钮（`<a href>`，`callnative=1`），移动端真机测试 App 唤起与网页回退。
- URI 网页端不支持真交互多点（腾讯网页仅 1 marker）→ 内嵌多点必须走 JS SDK。

**阶段 2 内嵌交互多点地图（可选）**：高德 JS API 2.0，需 Web 端 JS key + 安全密钥（2021-12-02 后强制）。纯静态无后端时明文注入 `window._AMapSecurityConfig.securityJsCode`（官方标注生产不推荐），用**域名白名单 + 每日配额**兜底泄露风险；有余力用 Supabase Edge Function / Cloudflare Worker 代理隐藏密钥。加载器 `webapi.amap.com` 大陆可直连；降级用高德静态地图 `restapi.amap.com/v3/staticmap`（需 Web 服务 key，与 JS key 不同）。**无 key 时降级为列表 + 导航按钮**（沿用项目现有降级模式，`VITE_AMAP_JS_KEY/VITE_AMAP_SECURITY_CODE` 明文注入 + 无 key 降级视图）。

### 3.3 实时救援队位置（`RescueTeam`）：数据来源与降级
**现状：无公开、可核实的救援队实时定位 API。** 因此默认走降级，绝不虚构定位。

数据来源优先级（从可靠到降级）：
1. **官方/组织自有回传**（若后续接入）：救援队/志愿者端 App 或小程序上报 → 写入 `rescue_teams` 表（`lat,lng,updated_at`），前端**轮询更新**。
2. **平台内志愿者报名 + 手动位置**：救援队报名时可选填当前驻点/负责区域（`serviceScope`，非精确坐标）。
3. **降级（默认）**：不显示地图点，改列**官方力量电话卡片**（省级应急厅 0771-3391536、蓝天救援 400-600-9958、壹基金 400-690-2700 等，均已在救援电话页 `verified`）+ 官方通报外链。

`RescueTeam` 数据模型：
```ts
interface RescueTeam {
  id: string
  name: string                 // 队名/组织
  city?: string | null
  lat: number | null; lng: number | null
  geoStatus: 'official' | 'name_only' | 'unknown'  // 无坐标时 name_only + null
  serviceScope?: string | null // 负责区域/驻点
  contact?: string | null      // 对外电话，无则 null，禁编造
  status?: 'active' | 'standby' | 'offline' | 'unknown'
  updatedAt: string            // 超阈值提示「位置可能过期」
  source?: string              // 回溯来源
}
```
**降级纪律**：`geoStatus !== 'official'` 或 `updatedAt` 超阈值 → 不在地图上给精确点，只显示区域/电话；位置更新时间过期显式提示「位置可能已过期，请电话确认」。

---

## 4. 物资站点 / 安置点

### 4.1 数据模型 `ReliefStation`（对应 `supply_stations` 表，需补列）
```ts
type StationType = 'shelter' | 'supply' | 'medical' | 'water'   // 安置点/物资发放/医疗点/取水点，支持复合
type GeoStatus  = 'official' | 'name_only' | 'unknown'          // 官方未给坐标 → name_only + null
type StockStatus = 'sufficient' | 'limited' | 'out' | 'unknown'
type StationStatus = 'open' | 'full' | 'closing' | 'closed' | 'planned' | 'unknown'
type SourceLevel = 'official' | 'state_media' | 'local_media' | 'internal'

interface Supply   { item: string; unit?: string; quantity: number | null; stockStatus: StockStatus }
interface Contact  { phone: string | null; org?: string; is12345Fallback?: boolean } // 无公开电话禁编造
interface Source   { label: string; url: string; publishedAt?: string; sourceLevel: SourceLevel }

interface ReliefStation {
  id: string
  name: string
  city: string
  district?: string               // 区县乡镇
  address: string                 // 未公布则空字符串，禁杜撰
  lat: number | null; lng: number | null
  geoStatus: GeoStatus            // 官方未给坐标 → name_only + null
  type: StationType[]             // 支持复合
  capacity: number | null; occupancy: number | null   // 无官方数字不估算
  supplies: Supply[]              // 饮用水/方便食品/被褥/折叠床/应急照明…
  contact: Contact
  status: StationStatus
  serviceScope?: string           // 如「接收西江教育园区转出师生」「罕见病等特殊人群」
  accessNote?: string             // 到达/无障碍/道路中断提示
  source: Source[]                // 回溯复核
  verify: 'verified' | 'media' | 'unverified'  // 决定徽标与是否允许导航/拨号
  updatedAt: string               // ISO8601，超阈值提示「信息可能过期，请拨12345」
  createdAt: string
}
```
> `supply_stations` 表已存在基础列，需 `alter table` 补：`geo_status text`、`district text`、`capacity int`、`occupancy int`、`service_scope text`、`access_note text`、`source jsonb`、`updated_at timestamptz`（已有 `updated_at` 则复用）。`supplies` 由现有 `text` 升级为 `jsonb`。

### 4.2 「导航前往」按钮方案
- 卡片右下角放模块 B 的 `NavButtons`（高德 + 腾讯双唤起）。
- **`verify` 与 `geoStatus` 门控**：
  - `verify='verified'` 且 `geoStatus='official'`（有坐标）→ 显示「导航前往」（导到坐标）。
  - `geoStatus='name_only'`（无坐标）→ 导航按钮改为**按名称/地址搜索**唤起（高德 `keyword` 唤起或降级到「拨打确认地址」），不硬编造坐标。
  - `verify='unverified'` → **不给导航到具体点**，只给官方查询外链 + 「拨打确认」。
- **每张卡片强制带「📞 拨打确认是否开放/是否开诊」按钮**（避免网传名单误导跑空）。无公开电话时该按钮降级为 12345 兜底（`is12345Fallback=true`）。

### 4.3 数据来源与 unverified 标注策略
**设计纪律（写死在产品里）**：官方通稿多只给场所名、不给门牌/坐标/容量/电话 → 地址与经纬度未核验一律留空/置 null 并降级 `verify`，**绝不杜撰**；被困校区（如贵港大将学校、第八高级中学）属**救援对象**，不得作为可前往安置点展示（数据中标注 `type` 非 shelter、或单列「被困点」并禁止导航）；聚合物资**优先外链官方查询入口**，不硬编码静态名单。

`verify` 三级渲染：
- `verified`（已官方核实）→ 绿色徽标，允许导航/拨号。
- `media`（国家级媒体报道，但地址/电话/容量未逐项核到）→ 蓝色徽标 + 「建议拨打确认」。
- `unverified`（待核实）→ 橙色徽标，不给导航到具体点，只给官方外链 + 拨打确认。
- `updatedAt` 超阈值 → 顶部提示「信息可能过期，请拨 12345 核实」。

**首选官方外链（聚合入口，优先于硬编码名单）**：
- 全国应急避难场所公众查询系统（应急管理部，覆盖广西）：`https://bncs.mem.gov.cn/PublicEnquiry/Country.html`
- 应急管理部查询服务总入口：`https://www.mem.gov.cn/fw/cxfw/`
- 广西应急管理厅（0771-3391536）：`http://yjglt.gxzf.gov.cn/`
- 民政部「慈善中国」（募捐主体资质核验，防灾后骗捐）：`https://cszg.mca.gov.cn`

**当前已调研到的站点（示意，全部按 verify 分级，多为 media/unverified，落地前须复核）**：横州市 6 个乡镇临时安置点（`media`，逐点门牌/是否开放向 0771-12345 核实）；横州马岭镇振兴村附近安置点（约 800 人，`media`，`geoStatus=name_only`）；贵港荷城初级中学中转安置点（`media`，接收西江教育园区转出师生）；贵港集中安置点（数量口径冲突 39/18，`unverified`，须以官方最新通报核定不取单一值）；钦州/防城港临时安置点（`unverified`，通稿未点名场所）。**北海涠洲岛为撤离上岸（非避难点）、贵港被困校区为救援对象**——均单列以免误标为可前往安置点。详见 `08-物资与安置点.md`。

---

## 5. 罕见病模块

### 5.1 对接的基金会 / 组织（带 verify）
| 机构 | 定位 | 电话/联系 | verify |
|---|---|---|---|
| **病痛挑战基金会（ICF）** | 灾时罕见病「找钱/找药/找资源」一级转介出口；运营「罕见病医疗援助工程」，覆盖《国家罕见病目录》全部病种 | `400-040-8772`（转 801=服务咨询） | `verified` |
| **中国罕见病联盟 / CHARD 云平台** | 「找组织/找新药/找医院/找政策」查询，按病种定位诊疗医院与患者组织 | `010-65699659`（周一至周五 9:30–16:30） | `verified` |
| **蔻德罕见病中心（CORD）** | 患者注册/社群/科普/经济救助 | **无公开患者热线**，仅邮箱 `public@cord.org.cn` + 注册平台 rareman.cn | `verified`（仅邮箱/官网） |
| 中华社会救助基金会 | 「罕见病医疗援助工程」公募主体之一 | 走病痛挑战统一入口，不单列电话 | `media` |
| **广西罕见病协作网医院** | 确诊/开具协作网诊断证明（申请全国援助工程前置条件）；具透析/ICU/供氧/化疗能力，灾后区域兜底 | 广西医科大学第一附属医院（省内主力 140+ 病种）、广西壮族自治区人民医院（100+）等；总机以官网为准，急救走 120 | `verified`（名单，桂卫医发〔2024〕11 号） |

### 5.2 灾时热线（写入救援电话页「罕见病/慢病援助」分组 + 罕见病 Tab，按 verify 渲染）
| 名称 | 号码 | 场景 | verify |
|---|---|---|---|
| 病痛挑战 罕见病援助服务热线 | `400-040-8772` | 个案资金援助、医疗资源转介、医保/药物信息；灾时找钱/找药/找资源一级转介 | `verified` |
| 病痛挑战 综合服务中心 | `13075336023` | 罕见病综合服务咨询（官方项目页原文） | `verified` |
| 病痛挑战 综合服务/全人康复 | `15510298772` | 综合服务及全人康复计划（官方项目页原文） | `verified` |
| 病痛挑战 心理支持热线（分机） | `400-040-8772 转808` | 心理支持/月捐人；分机仅见搜索摘要 → 标「以官网为准」 | `media` |
| 中国罕见病联盟 / CHARD | `010-65699659` | 政策/组织/医院/新药信息咨询 | `verified` |
| 全国卫生健康热线 | `12320` | 灾时寻医问药、心理援助、突发公共卫生事件咨询、找就近开诊机构（广西已开通） | `verified` |
| 全国政务便民热线 | `12345` | 找就近运营医院/透析点/药店、协调转运、反映断药断医的人工兜底 | `verified` |
| 急救电话 | `120` | 危及生命立即拨（呼吸机断电缺氧、透析中断高钾/心律不齐/肺水肿、癫痫持续状态、严重低血糖/酮症酸中毒昏迷、粒缺期发热等） | `verified` |

**渲染纪律（号码错误会害人）**：
- `verified` → 直接可拨（`tel:`）。
- `media` → 显示号码但加「以官网为准」+ 官网跳转。
- `unverified` → **不出现号码**，只给官网/邮箱。CORD 网传手机号 `13552729249`、`转808` 均**不得作可拨号**呈现。
- 广西无可核实的省级罕见病专线/地方 12320 专用号 → 只展示全国统一短号 `12320/12345/120`，**不编造地方专线**。
- 任何医院/透析点/药房卡片强制带「拨打确认是否开诊」按钮；对外号码定期回官网巡检复核。

### 5.3 灾时用药 / 透析 / 供氧应急要点（`emergencyMeds`，来源 FDA/美CDC/NKF/NIDDK/美肺协/中CDC《全国自然灾害卫生应急工作指南》；剂量与个体化决策一律以主治医生为准）
- **胰岛素依赖型糖尿病（停电/冷藏中断）**：正常冷藏 2–8℃；应急时厂家原装瓶/笔芯可在 15–30℃ 室温存放**最多 28 天**仍有效。**绝不能冷冻，冻过即弃**。降温用带冰保温箱但药品勿直接触冰；应急可把密封药盒放马桶水箱（约 8–11℃，维持 8–12h）；长停电用电池医用冷藏盒。液体变色/絮状/结晶即弃。反复呕吐、意识模糊、深大呼吸（酮症酸中毒）或严重低血糖昏迷 → 打 120。
- **需血液透析的肾病（透析中断）**：台风前尽量按医嘱**提前透析一次**。中断期立即收紧饮食防致命高钾与容量超负荷——NKF 应急量级：每日蛋白约 40–50g、钠 1500mg、钾 1500mg、液体 <500cc（约 2 杯内）；避开土豆/香蕉/番茄/橙子等高钾食物；备三天非易腐低钾低蛋白食物。无法及时透析可用降钾树脂（聚苯乙烯磺酸钠）**须医生指导**。立即联系原透析中心加排，不通则查就近透析点 / 打 12320·12345 / 走 120。气促不能平卧、心悸脉律不齐、四肢无力麻木 → 打 120。
- **需持续供氧/呼吸机（停电）**：呼吸机最危险、不能长时间断电。停电即刻切备用氧气瓶/便携氧（备用钢瓶常放随手处并充满、事先练熟切换）。备用电力：医用 UPS/发电机/外置电池（内置 30min–2h、外置 4–8h）。提前向供电公司/社区**报备「生命支持设备用户」**争取用电保障名单。应急包备至少 24–48h 备用氧 + 手摇/电池收音机 + 充电宝 + 医生与设备供应商电话。用氧严禁明火、远离炉灶蜡烛。口唇发绀、明显气促、意识改变、血氧持续下降 → 打 120。
- **癫痫 / 需冷藏药物（断药/冷藏中断）**：抗癫痫药**绝不能突然停用**，骤停可诱发癫痫持续状态（危及生命），任何减停须医生指导缓慢进行。灾时优先保证不断药，随身多备几日量 + 处方病历。一次发作 >5 分钟或发作间意识不恢复 → 立即打 120。冷藏药物（部分胰岛素、肾上腺素笔、生物制剂/酶替代药、疫苗）通用：冰盒+冰袋但勿直接触冰勿冻、短时可用马桶水箱法、长停电用电池医用冷藏盒、全程温度计监测、变色/沉淀即弃；肾上腺素笔多建议 15–30℃ 存放、勿冷冻。
- **化疗中 / 免疫缺陷（灾后感染高风险）**：化疗患者常白细胞/血小板低下，洪灾后污水淤泥霉菌拥挤避难所是感染雷区（钩体病/甲肝/伤寒/曲霉/军团菌/革兰阴性菌风险升高）。第一步联系肿瘤/主治团队取个体化指引。防护：手卫生+口罩手套湿巾、只用清洁水洗漱清创、伤口保持包扎干燥、避开高暴露环境保持社交距离；可事先向社区/民政了解「特殊需求避难安置」避免高密度混住。**发热（尤其中性粒细胞减少期发热为急症）、寒战、出血不止、明显乏力/意识改变 → 立即就医或打 120。**

**「我的应急包」清单模板**：按病种（胰岛素/透析/供氧/癫痫冷链/化疗）提供勾选清单——备用药量（几日）、冷链方案、备用电力、处方病历副本、主治医生+设备供应商电话、协作网医院联系方式、120 使用红线。

---

## 6. 安全与隐私红线（贯穿所有模块）

### 6.1 医疗信息免责
- 罕见病/急救要点全部标注：**来源为 FDA/美CDC/NKF/NIDDK/中CDC 等权威机构；剂量与个体化决策一律以主治医生为准**，平台不提供诊断/处方。
- 每屏保留「危及生命立即拨 120/110/119」的显著提示（复用现有 `Disclaimer`）。
- AI 拍照求助结果为**信息结构化辅助**，不作医疗判断；`urgency` 只用于分诊排序，不替代急救。

### 6.2 电话核实分级（号码错误会害人）
- 沿用 `VerifyLevel`：`verified` 直接可拨；`structural` 全区统一规则可拨；`media` 可拨但提示「拨前再确认一次」+ 官网跳转；`unverified` **不呈现号码**，只给官网/邮箱/12345 兜底。
- 号码只从机构自有官网/官方政府网站原文逐字核实才标 `verified`。**已知陷阱**：搜索摘要曾把病痛挑战 `4000408772` 误当成 CHARD 热线——CHARD 官方实为 `010-65699659`，产品端 CHARD 词条禁用那个 400 号。
- 任何医院/透析点/物资站卡片强制「拨打确认是否开诊/开放」按钮，避免网传名单跑空。
- 对外号码定期回官网巡检复核；`updatedAt` 超阈值显式提示可能过期。

### 6.3 求助信息隐私
- 求助墙展示的电话**脱敏**（现有已做 `phone.includes('*')` 判断决定是否显示拨号）；生产环境对 `help_requests` 加内容审核 + 频率限制 + 展示字段脱敏。
- 病历/病情/精确定位为**敏感个人信息**：照片存**私有桶 + 签名 URL**，仅授权救援方可读；日志脱敏；`rareDisease`、`mediaRefs`、精确 `lat/lng` 不进公开求助墙渲染，仅供分派后台。
- 志愿者/救援队报名**不公开展示**（现有 RLS：`vol insert` 允许匿名写、**不允许匿名读**，组织方用 `service_role` 读）——沿用。
- 提交前提示「请勿在求助内容中泄露过多敏感个人信息」（现有已有该提示，保留）。

### 6.4 防骗
- 捐赠前用民政部「慈善中国」核验募捐主体资质与备案编号（现有 `Donate` 已实现，保留强化）；只在群聊/短信/陌生链接出现的收款码、个人账号一律不转账。
- 灾后骗捐/假冒救援收款高发：置顶反诈 `96110`（接到务必接听）；求助/物资/罕见病模块的资金援助一律**外链官方项目页**，平台不代收款。
- 物资站点/罕见病资源全部走官方查询入口 + 已核实热线，不引导私下转账/私加个人微信。

---

## 7. 落地里程碑（建议顺序）
1. **阶段 0（零 key/零备案，最优先，立即可上）**：`lib/map.ts` 导航 URI 双唤起 + `NavButtons`；物资/安置 Tab 用**静态卡片列表 + 导航按钮**（不内嵌地图）；罕见病 Tab 静态内容 + 热线（复用 `CallRow`）；救援电话页加罕见病分组。**无需 key、无需备案、大陆免翻墙。**
2. **阶段 1（拍照求助降级版）**：`SosWizard` 引导式表单 + Storage 私有桶上传，写 `help_requests`；先不接 AI，纯手动即完整可用。
3. **阶段 2（AI 代理）**：国内云函数（SCF/FC）代理 + 国产多模态 API + Zod 校验 + 就高兜底；`SosReview` 预填确认页；模型可插拔 + 失败自动切换。
4. **阶段 3（内嵌交互地图 + 实时队伍，可选）**：高德 JS API 2.0（key + 安全密钥 + 域名白名单 + 配额）；救援队位置若有数据源则轮询，否则保持电话降级。
5. **贯穿**：托管境外平台（Cloudflare/Vercel/GitHub Pages）免备案免翻墙；号码/站点定期回官网巡检；敏感字段私有桶 + 签名 URL + 日志脱敏。

---
*本规格与四路调研文件（04/06/07/08）配套；所有电话、站点、机构信息落地前须回官方来源复核，`verify` 分级不可下调仅可上调。*
