// 物资站点 / 安置点 — 数据来源见 research/08-物资与安置点.md
// 纪律：安置点高度动态、名单必然过期；官方通稿多只给场所名、不给门牌/坐标/电话 → 一律留空、绝不杜撰。
// 首屏优先引导官方查询入口；平台自维护条目全部带 verify 徽标与更新时间。

import type { LucideIcon } from 'lucide-react'
import { House, Package, Cross, Droplets } from 'lucide-react'
import type { VerifyLevel } from './phones'

export type StationType = 'shelter' | 'supply' | 'medical' | 'water'
export type GeoStatus = 'official' | 'name_only' | 'unknown'
export type StationStatus = 'open' | 'full' | 'closing' | 'closed' | 'planned' | 'unknown'

export const stationTypeMeta: Record<StationType, { label: string; icon: LucideIcon }> = {
  shelter: { label: '安置点', icon: House },
  supply: { label: '物资发放', icon: Package },
  medical: { label: '医疗点', icon: Cross },
  water: { label: '取水点', icon: Droplets },
}

export interface ReliefStation {
  id: string
  name: string
  city: string
  district?: string
  address?: string | null
  lat?: number | null
  lng?: number | null
  geoStatus: GeoStatus
  type: StationType[]
  capacity?: number | null
  supplies?: string[]
  contact?: { phone?: string | null; org?: string; is12345Fallback?: boolean }
  status: StationStatus
  serviceScope?: string
  accessNote?: string
  sourceLabel?: string
  sourceUrl?: string
  verify: VerifyLevel
  updatedAt: string
}

// 本轮"美莎克"官方/主流媒体披露的条目（坐标与门牌未官方公布故留空，geoStatus=name_only）
export const stations: ReliefStation[] = [
  {
    id: 'gx-hengzhou-6dian',
    name: '横州市临时安置点（共 6 个，分布横州镇/校椅镇/云表镇等）',
    city: '南宁',
    district: '横州市',
    geoStatus: 'name_only',
    type: ['shelter', 'supply'],
    supplies: ['饮用水', '方便食品', '被褥', '应急照明'],
    contact: { phone: '0771-12345', org: '属地镇街', is12345Fallback: true },
    status: 'open',
    serviceScope: '周边受灾转移群众',
    accessNote: '未逐点公布门牌，请拨 0771-12345 核实每点地址与是否开放',
    sourceLabel: '新华社 新华视点｜广西防汛救灾一线见闻',
    sourceUrl: 'https://www.news.cn/20260708/70741643fb9f463f8bebadbb7c21b6fc/c.html',
    verify: 'media',
    updatedAt: '2026-07-11',
  },
  {
    id: 'gx-hengzhou-maling',
    name: '横州市马岭镇振兴村附近安置点',
    city: '南宁',
    district: '横州市马岭镇',
    geoStatus: 'name_only',
    type: ['shelter', 'supply'],
    capacity: 800,
    supplies: ['饮用水', '方便面', '面包', '简易折叠床'],
    contact: { phone: '0771-12345', org: '镇干部 / 村民小组分片包保', is12345Fallback: true },
    status: 'open',
    serviceScope: '周边受灾转移群众（约 800 人）',
    accessNote: '记者现场报道位置，具体门牌未官方公布',
    sourceLabel: '新华社 新华视点',
    sourceUrl: 'https://www.news.cn/20260708/70741643fb9f463f8bebadbb7c21b6fc/c.html',
    verify: 'media',
    updatedAt: '2026-07-11',
  },
  {
    id: 'gx-guigang-hecheng',
    name: '贵港市荷城初级中学（中转安置点）',
    city: '贵港',
    district: '港北区',
    geoStatus: 'name_only',
    type: ['shelter'],
    supplies: ['泡面', '八宝粥', '饮用水', '充电设备'],
    contact: { phone: '0775-12345', org: '属地', is12345Fallback: true },
    status: 'open',
    serviceScope: '接收西江教育园区转出师生',
    accessNote: '未公布门牌，以官方现场公示为准',
    sourceLabel: '人民网 从围困到安顿，贵港"安心接力"',
    sourceUrl: 'http://gx.people.com.cn/n2/2026/0709/c179464-41634420.html',
    verify: 'media',
    updatedAt: '2026-07-11',
  },
  {
    id: 'gx-guigang-jizhong',
    name: '贵港市集中安置点（全市多个）',
    city: '贵港',
    geoStatus: 'unknown',
    type: ['shelter'],
    contact: { phone: '0775-12345', org: '属地', is12345Fallback: true },
    status: 'unknown',
    accessNote: '数量口径存在冲突（报道有"18 个""39 个"两种），以贵港市官方最新通报为准',
    sourceLabel: '光明网 / 央广网 相关报道',
    sourceUrl: 'https://news.gmw.cn/2026-07/08/content_38872824.htm',
    verify: 'unverified',
    updatedAt: '2026-07-11',
  },
  {
    id: 'gx-qinzhou-linshi',
    name: '钦州市临时安置点（消防转移后就近安置）',
    city: '钦州',
    geoStatus: 'unknown',
    type: ['shelter'],
    contact: { phone: '0777-12345', org: '属地镇街 / 各县区应急局', is12345Fallback: true },
    status: 'unknown',
    accessNote: '通稿未点名具体场所，请拨 0777-12345 或县区应急局索取本轮安置点名录',
    sourceLabel: '中新网 钦州消防转移 211 名被困民众',
    sourceUrl: 'https://www.chinanews.com.cn/sh/2026/07-06/10653577.shtml',
    verify: 'unverified',
    updatedAt: '2026-07-11',
  },
  {
    id: 'gx-fangchenggang-linshi',
    name: '防城港市临时安置点（防城区华石镇/珠河街道等）',
    city: '防城港',
    geoStatus: 'unknown',
    type: ['shelter'],
    contact: { phone: '0770-12345', org: '属地镇街', is12345Fallback: true },
    status: 'unknown',
    accessNote: '证实设有临时安置点但未公布名称地址，请拨 0770-12345 核实',
    sourceLabel: '中新网 / 大洋网 相关报道',
    sourceUrl: 'https://www.gx.chinanews.com.cn/video/yc/2026-07-05/detail-ihffxrfa8355300.shtml',
    verify: 'unverified',
    updatedAt: '2026-07-11',
  },
]

// 官方查询入口（优先外链，权威且最新）
export interface OfficialLink {
  name: string
  desc: string
  url: string
}
export const officialStationLinks: OfficialLink[] = [
  { name: '全国应急避难场所公众查询系统', desc: '应急管理部主办，查全国（含广西）避难场所分布、地址、疏散路线', url: 'https://bncs.mem.gov.cn/PublicEnquiry/Country.html' },
  { name: '应急管理部 · 查询服务', desc: '部级各类查询服务聚合入口', url: 'https://www.mem.gov.cn/fw/cxfw/' },
  { name: '广西壮族自治区应急管理厅', desc: '全区应急/防汛权威口，灾情与安置发布', url: 'http://yjglt.gxzf.gov.cn/' },
]
