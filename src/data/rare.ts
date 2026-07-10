// 罕见病 / 慢病 与灾害医疗 — 数据来源见 research/04-罕见病与灾害医疗.md
// 电话按 verify 分级渲染：verified 可拨；media 显示但注明"以官网为准"；unverified 不呈现号码，只给官网/邮箱。
// 医疗要点来源 FDA / 美CDC / NKF / NIDDK / 美肺协 / 中CDC《全国自然灾害卫生应急工作指南》；剂量与个体化决策一律以主治医生为准。

import type { LucideIcon } from 'lucide-react'
import { Syringe, Stethoscope, Activity, Pill, Ribbon } from 'lucide-react'
import type { VerifyLevel } from './phones'

export interface RareOrg {
  name: string
  role: string
  contact: string
  phone?: string
  url?: string
  email?: string
  verify: VerifyLevel
}

export interface RareHotline {
  name: string
  number: string
  scenario: string
  verify: VerifyLevel
}

export interface EmergencyMed {
  id: string
  icon: LucideIcon
  condition: string
  guidance: string
  danger: string // 立即拨 120 的红线
}

// ── 基金会 / 组织（灾时找钱/找药/找资源）──
export const rareOrgs: RareOrg[] = [
  {
    name: '病痛挑战基金会（ICF）',
    role: '灾时罕见病"找钱/找药/找资源"一级转介；运营"罕见病医疗援助工程"，覆盖《国家罕见病目录》全部病种（申请援助须由全国罕见病诊疗协作网医院出具诊断证明）',
    contact: '400-040-8772（转 801 服务咨询）',
    phone: '400-040-8772',
    url: 'https://www.chinaicf.org/',
    verify: 'verified',
  },
  {
    name: '中国罕见病联盟 / CHARD 云平台',
    role: '"找组织/找新药/找医院/找政策"查询，按病种定位诊疗医院与患者组织',
    contact: '010-65699659（周一至周五 9:30–16:30）',
    phone: '010-65699659',
    url: 'https://www.chard.org.cn/',
    verify: 'verified',
  },
  {
    name: '蔻德罕见病中心（CORD）',
    role: '患者注册 / 社群 / 科普 / 经济救助（无公开患者热线，请走官网或邮箱）',
    contact: '邮箱 public@cord.org.cn · 注册平台 rareman.cn',
    email: 'public@cord.org.cn',
    url: 'https://www.cord.org.cn/',
    verify: 'verified',
  },
  {
    name: '广西罕见病诊疗协作网医院',
    role: '确诊 / 开具协作网诊断证明（申请全国援助工程前置）；具透析/ICU/供氧/化疗能力，灾后区域兜底。就诊前先电话或看官方公告确认是否开诊',
    contact: '广西医科大学第一附属医院（省内主力 140+ 病种）、广西壮族自治区人民医院（100+）等；总机以官网为准，急救走 120',
    url: 'http://zyyj.gxzf.gov.cn/xwdt/gxgg/t18385462.shtml',
    verify: 'verified',
  },
]

// ── 灾时热线（罕见病/慢病援助）──
export const rareHotlines: RareHotline[] = [
  { number: '120', name: '急救电话', scenario: '危及生命立即拨：呼吸机断电缺氧、透析中断高钾/心律不齐/肺水肿、癫痫持续状态、严重低血糖/酮症酸中毒昏迷、粒缺期发热', verify: 'verified' },
  { number: '12320', name: '全国卫生健康热线', scenario: '灾时寻医问药、心理援助、找就近开诊机构（广西已开通）', verify: 'verified' },
  { number: '12345', name: '政务便民热线', scenario: '找就近运营医院/透析点/药店、协调转运、反映断药断医的人工兜底', verify: 'verified' },
  { number: '400-040-8772', name: '病痛挑战 罕见病援助', scenario: '个案资金援助、医疗资源转介、医保/药物信息；灾时找钱/找药一级转介', verify: 'verified' },
  { number: '13075336023', name: '病痛挑战 综合服务中心', scenario: '罕见病综合服务咨询（官方项目页原文）', verify: 'verified' },
  { number: '010-65699659', name: '中国罕见病联盟 CHARD', scenario: '政策/组织/医院/新药信息咨询', verify: 'verified' },
]

// ── 分病种灾时应急要点 ──
export const emergencyMeds: EmergencyMed[] = [
  {
    id: 'insulin',
    icon: Syringe,
    condition: '胰岛素依赖型糖尿病（停电/冷藏中断）',
    guidance:
      '正常冷藏 2–8℃；应急时厂家原装瓶/笔芯可在 15–30℃ 室温存放最多 28 天仍有效。绝不能冷冻，冻过即弃。降温用带冰保温箱但药品勿直接触冰；应急可把密封药盒放马桶水箱（约 8–11℃，维持 8–12h）；长停电用电池医用冷藏盒。液体变色/絮状/结晶即弃。',
    danger: '反复呕吐、意识模糊、深大呼吸（酮症酸中毒）或严重低血糖昏迷 → 立即打 120。',
  },
  {
    id: 'dialysis',
    icon: Stethoscope,
    condition: '需血液透析的肾病（透析中断）',
    guidance:
      '台风前尽量按医嘱提前透析一次。中断期立即收紧饮食防致命高钾与容量超负荷（NKF 应急量级：每日蛋白约 40–50g、钠 1500mg、钾 1500mg、液体 <500cc）；避开土豆/香蕉/番茄/橙子等高钾食物；备三天非易腐低钾低蛋白食物。立即联系原透析中心加排，不通则查就近透析点 / 打 12320·12345。',
    danger: '气促不能平卧、心悸脉律不齐、四肢无力麻木 → 立即打 120。',
  },
  {
    id: 'oxygen',
    icon: Activity,
    condition: '需持续供氧 / 呼吸机（停电）',
    guidance:
      '呼吸机最危险、不能长时间断电。停电即刻切备用氧气瓶/便携氧（备用钢瓶常放随手处并充满、事先练熟切换）。备用电力：医用 UPS/发电机/外置电池。提前向供电公司/社区报备"生命支持设备用户"争取用电保障名单。应急包备至少 24–48h 备用氧。用氧严禁明火、远离炉灶蜡烛。',
    danger: '口唇发绀、明显气促、意识改变、血氧持续下降 → 立即打 120。',
  },
  {
    id: 'epilepsy',
    icon: Pill,
    condition: '癫痫 / 需冷藏药物（断药/冷藏中断）',
    guidance:
      '抗癫痫药绝不能突然停用，骤停可诱发癫痫持续状态（危及生命），任何减停须医生指导缓慢进行。灾时优先保证不断药，随身多备几日量 + 处方病历。冷藏药物（部分胰岛素、肾上腺素笔、生物制剂/酶替代药、疫苗）：冰盒+冰袋但勿直接触冰勿冻，变色/沉淀即弃。',
    danger: '一次发作 >5 分钟或发作间意识不恢复 → 立即打 120。',
  },
  {
    id: 'chemo',
    icon: Ribbon,
    condition: '化疗中 / 免疫缺陷（灾后感染高风险）',
    guidance:
      '化疗患者常白细胞/血小板低下，洪灾后污水淤泥霉菌拥挤避难所是感染雷区。第一步联系肿瘤/主治团队取个体化指引。防护：手卫生 + 口罩手套湿巾、只用清洁水洗漱清创、伤口保持包扎干燥、避开高暴露环境；可事先向社区/民政了解"特殊需求避难安置"避免高密度混住。',
    danger: '发热（尤其中性粒细胞减少期发热为急症）、寒战、出血不止、明显乏力/意识改变 → 立即就医或打 120。',
  },
]

// ── "我的应急包"通用清单 ──
export const emergencyKit: string[] = [
  '备用药量：至少 3–7 天用量 + 处方/病历副本（可拍照存手机）',
  '冷链方案：冰盒 + 冰袋 / 电池医用冷藏盒（药品勿直接触冰、勿冷冻）',
  '备用电力：充电宝、外置电池、医用 UPS；供氧/呼吸机用户提前报备"生命支持设备用户"',
  '通讯：主治医生、设备供应商、协作网医院、120 的电话写在纸上一份',
  '就高判断：任何危及生命的体征变化，先打 120 再说',
]
