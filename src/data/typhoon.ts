// 台风实况数据 — 数据来源见 research/01-台风实况-广西.md
// ⚠️ 灾情数字（受灾/伤亡）应以广西应急管理厅官方通报为准，人工定期更新本文件。

export interface OfficialSource {
  name: string
  desc: string
  url: string
}

export interface TyphoonStatus {
  updatedAt: string
  // 对广西是否有直接影响的当前结论
  guangxiHeadline: string
  guangxiLevel: 'none' | 'watch' | 'active' // none=无直接影响, watch=需关注, active=正在影响
  current: {
    name: string
    intlId: string
    enName: string
    category: string
    status: string
    forecast: string
    affects: string
  }
  recentImpact: {
    name: string
    intlId: string
    period: string
    summary: string
    stats: { label: string; value: string }[]
    hitAreas: string[]
  }
  timeline: { date: string; text: string }[]
  officialSources: OfficialSource[]
  warningSignals: { level: string; color: string; meaning: string }[]
}

export const typhoon: TyphoonStatus = {
  updatedAt: '2026-07-11',
  guangxiHeadline: '当前无台风直接影响广西；重点转入灾后恢复。请持续关注官方预警。',
  guangxiLevel: 'none',
  current: {
    name: '巴威',
    intlId: '2609',
    enName: 'Bavi',
    category: '超强台风级',
    status: '活跃 · 中央气象台橙色预警（7/10 发布）',
    forecast: '预计 7/11 夜间登陆福建霞浦–浙江温岭一带（13–15 级），登陆后向西北减弱。',
    affects: '主要影响浙江、福建 —— 对广西无直接风雨影响。',
  },
  recentImpact: {
    name: '美莎克',
    intlId: '2610',
    period: '2026-07-03 至 07-06',
    summary:
      '今年首个登陆我国、也是首个重创广西的台风。7/3 登陆海南陵水，7/4 在越南芒街（紧邻广西）二次登陆，7/5 环流移入广西，7/6 移出、后减弱消散。带来破纪录暴雨与狂风。',
    stats: [
      { label: '广西受灾人口', value: '约 37.5 万人' },
      { label: '紧急转移', value: '约 13 万人' },
      { label: '最大累计雨量', value: '1193.1 mm（钦州久隆）' },
      { label: '最大阵风', value: '46.9 m/s / 15 级（防城港江山）' },
      { label: '农作物受损', value: '约 1.29 万公顷' },
      { label: '河流超警', value: '59 河 81 站' },
    ],
    hitAreas: ['防城港', '钦州', '南宁', '贵港', '北海', '崇左'],
  },
  timeline: [
    { date: '07-03', text: '"美莎克"升为第10号台风，18:20 登陆海南陵水，中央气象台黄色预警' },
    { date: '07-04', text: '20:30 二次登陆越南广宁芒街（紧邻广西东兴/防城港）' },
    { date: '07-05', text: '环流移入广西，防城港/钦州特大暴雨' },
    { date: '07-06', text: '10:00 移出广西，晚间在湖南减弱、停止编号' },
    { date: '07-07', text: '广西灾情统计：约 37.5 万受灾、13 万转移' },
    { date: '07-10', text: '第9号"巴威"加强为超强台风，中央气象台橙色预警（影响浙闽）' },
    { date: '07-11', text: '"巴威"预计夜间登陆闽浙 —— 不影响广西' },
  ],
  warningSignals: [
    { level: '红色', color: 'bg-danger-600', meaning: '最高级 · 6 小时内可能或已受特强台风影响，务必停止一切户外活动、按指令转移' },
    { level: '橙色', color: 'bg-warn-600', meaning: '12 小时内可能或已受强台风影响，停课停工停运、加固门窗、避免外出' },
    { level: '黄色', color: 'bg-warn-500', meaning: '24 小时内可能受台风影响，做好防风防雨准备、关注最新预报' },
    { level: '蓝色', color: 'bg-brand-500', meaning: '24 小时内可能受台风影响，留意天气变化、检查防台准备' },
  ],
  officialSources: [
    { name: '中央气象台 · 台风公报', desc: '全国台风路径/强度/预警（实时·权威）', url: 'https://www.nmc.cn/publish/typhoon/warning.html' },
    { name: '中国天气网 · 台风频道', desc: '图文台风专题', url: 'https://typhoon.weather.com.cn/' },
    { name: '广西天气', desc: '广西台风/暴雨预警与实况', url: 'https://gx.weather.com.cn/' },
    { name: '广西应急管理厅', desc: '灾情通报、应急响应、转移安置（权威灾情源）', url: 'http://yjglt.gxzf.gov.cn/' },
    { name: '中国气象局 CMA 预警', desc: '国家级官方预警页', url: 'https://weather.cma.cn/' },
    { name: '国家预警信息发布', desc: '各类突发事件预警', url: 'http://www.12379.cn/' },
  ],
}
