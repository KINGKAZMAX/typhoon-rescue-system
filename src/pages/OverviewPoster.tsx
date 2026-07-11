import {
  BookOpen,
  Camera,
  CheckCircle2,
  ClipboardList,
  Dna,
  HandHeart,
  HeartHandshake,
  House,
  LifeBuoy,
  MapPinned,
  Phone,
  ShieldCheck,
  Wind,
  type LucideIcon,
} from 'lucide-react'

type ScreenKind = 'main' | 'aid'

interface ScreenSpec {
  id: string
  kind: ScreenKind
  index: string
  title: string
  subtitle: string
  route: string
  icon: LucideIcon
  instruction: string
  focus: string
}

const mainScreens: ScreenSpec[] = [
  {
    id: 'home',
    kind: 'main',
    index: '主 Tab 1/5',
    title: '首页 Home',
    subtitle: '态势判断 · 一键求助入口',
    route: '/',
    icon: House,
    instruction: '先看广西台风态势，生命危急直接拨 110 / 119 / 120，普通求助点「拍照求助」。',
    focus: '台风态势、紧急拨号、功能入口',
  },
  {
    id: 'forecast',
    kind: 'main',
    index: '主 Tab 2/5',
    title: '台风预报 Forecast',
    subtitle: '实时路径 · 预警 · 官方源',
    route: '/forecast',
    icon: Wind,
    instruction: '查看当前台风、近期影响广西情况、预警含义和官方数据源，避免转发未核实消息。',
    focus: '官方源、时间线、预警信号',
  },
  {
    id: 'phones',
    kind: 'main',
    index: '主 Tab 3/5',
    title: '救援电话 Directory',
    subtitle: '全国主线 · 广西各市 · 民间组织',
    route: '/phones',
    icon: Phone,
    instruction: '按紧急程度选择主线、灾害专线、属地 12345 或公益组织入口；核实等级同步展示。',
    focus: '一键拨号、分级核实、属地兜底',
  },
  {
    id: 'aid',
    kind: 'main',
    index: '主 Tab 4/5',
    title: '求助互助 MutualAid',
    subtitle: '7 个子页横向切换',
    route: '/aid?tab=sos',
    icon: HeartHandshake,
    instruction: '进入后横向滑动二级 Tab，在拍照求助、求助墙、安置点、罕见病和志愿捐赠间切换。',
    focus: '二级 Tab、工单流、互助入口',
  },
  {
    id: 'guide',
    kind: 'main',
    index: '主 Tab 5/5',
    title: '灾后指南 Guide',
    subtitle: '返家安全 · 重建理赔 · 卫生防疫',
    route: '/guide',
    icon: BookOpen,
    instruction: '灾后返家按清单排查结构、电气、燃气、饮水、防疫和心理支持；高危情况找专业人员。',
    focus: '返家清单、次生灾害、理赔记录',
  },
]

const aidScreens: ScreenSpec[] = [
  {
    id: 'sos',
    kind: 'aid',
    index: '求助互助 子页 1/7',
    title: '拍照求助',
    subtitle: '拍照/粘贴消息 · AI 预填 · 手动兜底',
    route: '/aid?tab=sos',
    icon: Camera,
    instruction: '上传现场照片或粘贴微信群求助文本，自动整理成可分派求助单；AI 未配置时仍可手填。',
    focus: '照片、方言文字、结构化求助',
  },
  {
    id: 'help',
    kind: 'aid',
    index: '求助互助 子页 2/7',
    title: '求助墙',
    subtitle: '待对接 → 对接中 → 已解决',
    route: '/aid?tab=help',
    icon: ClipboardList,
    instruction: '调度员或救援队认领求助后再拨打完整电话，跟进后标记已解决，减少重复救援。',
    focus: '工单认领、状态回写、隐私脱敏',
  },
  {
    id: 'safe',
    kind: 'aid',
    index: '求助互助 子页 3/7',
    title: '报平安 / 寻人',
    subtitle: '灾中家属互寻 · 安置状态',
    route: '/aid?tab=safe',
    icon: CheckCircle2,
    instruction: '登记本人安全状态或发布寻人记录，使用姓名、城市、备注快速筛选，降低电话拥堵。',
    focus: '报平安、寻人、状态标记',
  },
  {
    id: 'stations',
    kind: 'aid',
    index: '求助互助 子页 4/7',
    title: '物资 / 安置',
    subtitle: '安置点 · 医疗点 · 一键导航',
    route: '/aid?tab=stations',
    icon: MapPinned,
    instruction: '按安置、供水、医疗、物资类型筛选点位，优先走官方查询入口，再用高德/腾讯导航。',
    focus: '点位筛选、导航、官方入口',
  },
  {
    id: 'rare',
    kind: 'aid',
    index: '求助互助 子页 5/7',
    title: '罕见病',
    subtitle: '断药/断透析/断氧应急',
    route: '/aid?tab=rare',
    icon: Dna,
    instruction: '对胰岛素、透析、供氧、癫痫、化疗等高风险情况给出紧急联系和应急包清单。',
    focus: '医疗热线、药品信息、应急包',
  },
  {
    id: 'volunteer',
    kind: 'aid',
    index: '求助互助 子页 6/7',
    title: '我要报名',
    subtitle: '志愿者 · 救援队 · 车辆船只 · 医疗心理',
    route: '/aid?tab=volunteer',
    icon: HandHeart,
    instruction: '登记可提供的角色、服务城市、联系方式和能力说明，方便调度方按需联系。',
    focus: '角色登记、属地服务、技能说明',
  },
  {
    id: 'donate',
    kind: 'aid',
    index: '求助互助 子页 7/7',
    title: '物资捐赠',
    subtitle: '官方渠道 · 防骗提示 · 物资清单',
    route: '/aid?tab=donate',
    icon: ShieldCheck,
    instruction: '按官方/公益渠道捐赠，核对备案和收款主体，优先提供灾区明确需要的物资。',
    focus: '官方渠道、防骗、需求匹配',
  },
]

const screens = [...mainScreens, ...aidScreens]

const guideSteps = [
  { id: 'g1', title: '1. 先判断态势', text: '首页给出当前广西风险、紧急拨号和拍照求助入口。' },
  { id: 'g2', title: '2. 再选行动', text: '需要信息查预报/电话；需要救援进入求助互助。' },
  { id: 'g3', title: '3. 求助走工单', text: '照片或文字先结构化，再进入求助墙认领和回写状态。' },
  { id: 'g4', title: '4. 专项支持', text: '安置点、罕见病、志愿报名、物资捐赠都在二级 Tab。' },
]

function routeToSrc(route: string) {
  const basePath = window.location.pathname.endsWith('/') ? window.location.pathname : `${window.location.pathname}/`
  return `${window.location.origin}${basePath}#${route}`
}

function PhonePreview({ screen }: { screen: ScreenSpec }) {
  const Icon = screen.icon

  return (
    <article className={`overview-screen overview-screen-${screen.kind}`}>
      <div className="overview-screen-head">
        <div className="overview-screen-icon">
          <Icon size={28} strokeWidth={2.3} />
        </div>
        <div>
          <div className="overview-screen-index">{screen.index}</div>
          <h2>{screen.title}</h2>
          <p>{screen.subtitle}</p>
        </div>
      </div>
      <div className="overview-phone">
        <div className="overview-phone-speaker" />
        <iframe title={screen.title} src={routeToSrc(screen.route)} />
      </div>
      <div className="overview-screen-note">
        <p>{screen.instruction}</p>
        <span>{screen.focus}</span>
      </div>
    </article>
  )
}

export default function OverviewPoster() {
  return (
    <div className="overview-export-page">
      <section className="overview-poster" aria-label="广西台风救援平台交互界面总览">
        <header className="overview-titlebar">
          <div>
            <div className="overview-kicker">Mobile-first rescue product map</div>
            <h1>广西台风救援平台 · 交互界面总览</h1>
            <p>
              5 个底部主 Tab + 7 个「求助互助」子页完整手机端预览，含使用说明、线条指引与公益信息核实纪律。
            </p>
          </div>
          <div className="overview-badges" aria-label="技术标签">
            <span>React 18 + TypeScript</span>
            <span>Vite</span>
            <span>Tailwind CSS</span>
            <span>HashRouter</span>
            <span>PWA / Service Worker</span>
            <span>Supabase 可选后端</span>
            <span>lucide 图标</span>
          </div>
        </header>

        <section className="overview-guide">
          <div className="overview-guide-title">
            <LifeBuoy size={34} strokeWidth={2.3} />
            <div>
              <h2>使用说明 / 线条指引</h2>
              <p>按「态势判断 → 行动选择 → 工单处理 → 专项支持」的顺序使用。</p>
            </div>
          </div>
          <div className="overview-guide-steps">
            {guideSteps.map((step) => (
              <div key={step.id} className="overview-guide-step">
                <strong>{step.title}</strong>
                <span>{step.text}</span>
              </div>
            ))}
          </div>
          <svg className="overview-guide-lines" viewBox="0 0 3200 380" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <marker id="overviewArrow" markerWidth="16" markerHeight="16" refX="13" refY="8" orient="auto">
                <path d="M1 1 L14 8 L1 15 Z" fill="#0ea5e9" />
              </marker>
            </defs>
            <path d="M420 118 C600 250, 750 300, 850 360" markerEnd="url(#overviewArrow)" />
            <path d="M1180 118 C1260 235, 1450 300, 1680 360" markerEnd="url(#overviewArrow)" />
            <path d="M1940 118 C2030 250, 2270 300, 2515 360" markerEnd="url(#overviewArrow)" />
            <path d="M2690 118 C2840 240, 2960 300, 3120 360" markerEnd="url(#overviewArrow)" />
          </svg>
        </section>

        <section className="overview-grid" aria-label="全部手机端界面">
          {screens.map((screen) => (
            <PhonePreview key={screen.id} screen={screen} />
          ))}
        </section>

        <footer className="overview-footer">
          <div>具体需求和建议联系开发者 小智 · wechat: KING_KAZMAX · mail: xinlise@gmail.com</div>
          <div>公益信息聚合 · 数据以官方通报为准 · 生命危急请直接拨打 110 / 119 / 120</div>
        </footer>
      </section>
    </div>
  )
}
