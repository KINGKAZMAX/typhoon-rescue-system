// 救援与求助电话 — 数据来源与核实说明见 research/02-救援电话与组织.md
//
// 安全约定（救灾场景，号码错误会害人）：
//   verified   ✓已核实   —— 全国统一/权威一手来源确认，可放心拨打
//   structural 全区统一   —— 结构性规则确定（区号+12345、南方电网 95598）
//   media      官方媒体   —— 官方署名公告经官方媒体转载核实，建议拨前再确认一次
//   unverified 待核实     —— 仅见于第三方目录，禁止直接发布；请拨 12345 转接
// 本文件不杜撰任何号码；无法核实的城市号码宁可留空并提示 12345 兜底。

export type VerifyLevel = 'verified' | 'structural' | 'media' | 'unverified'

export const verifyMeta: Record<VerifyLevel, { label: string; cls: string }> = {
  verified: { label: '✓ 已核实', cls: 'bg-safe-100 text-safe-700' },
  structural: { label: '✓ 全区统一', cls: 'bg-safe-100 text-safe-700' },
  media: { label: '官方媒体核实', cls: 'bg-brand-100 text-brand-700' },
  unverified: { label: '待核实', cls: 'bg-warn-100 text-warn-700' },
}

export interface PhoneEntry {
  number: string
  name: string
  scenario?: string
  verify: VerifyLevel
  note?: string
}

// ── 1. 全国通用应急主线（置顶大按钮）──
export const emergencyLines: PhoneEntry[] = [
  { number: '110', name: '报警求助', scenario: '人身安全受威胁、遇灾遇险需公安救助、落水坠楼等；不确定打哪个时优先拨 110', verify: 'verified' },
  { number: '119', name: '火警 / 综合救援', scenario: '火灾、被困（电梯/坍塌/洪水围困）、抢险救援', verify: 'verified' },
  { number: '120', name: '医疗急救', scenario: '突发重伤、急病、溺水、中暑、触电', verify: 'verified' },
  { number: '122', name: '交通事故报警', scenario: '道路交通事故（也可直接拨 110）', verify: 'verified' },
]

// ── 2. 灾害相关专线（全国统一）──
export const disasterLines: PhoneEntry[] = [
  { number: '12395', name: '水上（海上）遇险搜救', scenario: '船舶遇险、人员落水、水上突发疾病；沿海（北海/防城港/钦州）尤其关键', verify: 'verified' },
  { number: '12379', name: '突发事件预警信息', scenario: '接收台风、暴雨、洪涝、地质灾害等预警（免费短信通道）', verify: 'verified' },
  { number: '12356', name: '全国心理援助热线', scenario: '灾后心理疏导、危机干预（多地 24 小时）；紧急危机拨 120/110', verify: 'verified' },
  { number: '96110', name: '反诈预警劝阻', scenario: '灾后骗捐/假冒救援收款高发，接到此号来电务必接听，可举报涉诈', verify: 'verified' },
  { number: '12345', name: '政务服务便民热线', scenario: '非紧急求助、物资对接、灾情咨询转办；广西全区 14 市已统一开通', verify: 'verified' },
  { number: '95598', name: '南方电网供电服务', scenario: '停电报修、停电信息查询（广西全区统一，24 小时）', verify: 'structural' },
]

// ── 3. 广西自治区级 / 民间救援力量 ──
export const provincialLines: PhoneEntry[] = [
  { number: '0771-3391536', name: '广西应急管理厅（办公）', scenario: '灾情、应急响应、转移安置权威口', verify: 'verified' },
  { number: '400-600-9958', name: '蓝天救援队（全国统一）', scenario: '咨询/报警/求助；查询广西属地支队请走此号或官网，勿信网传地方队号', verify: 'verified' },
  { number: '400-690-2700', name: '壹基金救援联盟', scenario: '国内最大公益救援联盟，已响应广西防城港/横州/柳州洪涝', verify: 'verified' },
  { number: '12350', name: '安全生产举报', scenario: '安全生产隐患、事故举报（广西应急厅标注）', verify: 'verified' },
]

export interface CityPhones {
  name: string
  areaCode: string
  entries: PhoneEntry[]
}

// ── 4. 广西 14 地市 ──
// 每市默认含：政务热线(区号+12345, 全区统一)、供电抢修(95598, 全区统一)。
// 燃气/供水/应急值班：仅收录已由官方媒体核实的号码；其余标"待核实"并提示拨 12345 转接。
const c = (name: string, areaCode: string, extra: PhoneEntry[] = []): CityPhones => ({
  name,
  areaCode,
  entries: [
    { number: `${areaCode}-12345`, name: '政务服务热线', scenario: '非紧急求助、物资对接、转接各部门', verify: 'structural' },
    { number: '95598', name: '供电抢修', scenario: '停电报修（南方电网）', verify: 'structural' },
    ...extra,
  ],
})

// 说明：应急局号码多数官网标注为"办公/联系电话"，仅柳州/贺州/崇左明确标"24小时值班"。
// 未能从官网亲验的城市该项留空，请拨 12345 兜底转接。
export const cities: CityPhones[] = [
  c('南宁', '0771', [
    { number: '0771-5583555', name: '南宁市应急管理局', scenario: '应急局联系电话（非24h防汛专线，紧急拨110/12345）', verify: 'verified' },
    // 注：南宁自来水"3296332"未能从官方渠道亲验，暂不收录，请拨 12345 转接。
  ]),
  c('柳州', '0772', [
    { number: '0772-2810914', name: '柳州市应急局（24h值班）', scenario: '应急管理局 24 小时值班电话', verify: 'verified' },
    { number: '0772-2895119', name: '燃气抢修（柳州中燃）', scenario: '室外燃气泄漏、抢险', verify: 'media' },
    { number: '0772-2892211', name: '燃气客服（柳州中燃）', scenario: '核验上门人员身份、业务咨询', verify: 'media' },
  ]),
  c('桂林', '0773', [
    { number: '0773-5625050', name: '桂林市应急管理局', scenario: '应急局联系电话（非24h专线，紧急拨110/12345）', verify: 'verified' },
  ]),
  c('梧州', '0774', [
    { number: '0774-6021932', name: '梧州市应急管理局', scenario: '应急局联系电话（非24h专线，紧急拨110/12345）', verify: 'verified' },
  ]),
  c('北海', '0779'),
  c('防城港', '0770', [
    { number: '0770-2816133', name: '防城港市政务咨询', scenario: '政府公共服务咨询电话（非防汛专线）', verify: 'verified' },
  ]),
  c('钦州', '0777', [
    { number: '0777-3688678', name: '钦州市应急管理局', scenario: '应急局联系/投诉电话', verify: 'verified' },
    { number: '0777-3696332', name: '钦州供水服务热线', scenario: '开投水务供水报修/咨询', verify: 'verified' },
  ]),
  c('贵港', '0775', [
    { number: '95158', name: '贵港燃气客服（24h）', scenario: '贵港新奥燃气 24 小时客服/抢修', verify: 'verified' },
    { number: '0775-4596332', name: '贵港供水热线（24h）', scenario: '北控水务供水服务，24 小时', verify: 'verified' },
  ]),
  c('玉林', '0775', [
    { number: '0775-2828103', name: '玉林市应急管理局', scenario: '应急局办公电话（非24h专线）', verify: 'verified' },
    { number: '400-00-96332', name: '玉林供水热线（24h）', scenario: '玉林自来水 24 小时供水服务', verify: 'verified' },
    { number: '0775-95007', name: '燃气客服（玉林中燃）', scenario: '客服/充值（抢修可先拨此号或119）', verify: 'verified' },
  ]),
  c('百色', '0776'),
  c('贺州', '0774', [
    { number: '0774-5135752', name: '贺州市应急局（24h值班）', scenario: '应急管理局 24 小时值班电话', verify: 'verified' },
  ]),
  c('河池', '0778', [
    { number: '0778-2283660', name: '河池市应急管理局', scenario: '应急局联系电话（非24h专线）', verify: 'verified' },
  ]),
  c('来宾', '0772', [
    { number: '0772-4275221', name: '来宾市应急管理局', scenario: '应急局联系电话（应急指挥中心 0772-4275119）', verify: 'verified' },
  ]),
  c('崇左', '0771', [
    { number: '0771-7968276', name: '崇左市应急局（24h值班）', scenario: '应急管理局 24 小时值班电话', verify: 'verified' },
  ]),
]

// ── 5. 民间救援 / 公益组织（含官网入口）──
export interface OrgEntry {
  name: string
  desc: string
  phone?: string
  url?: string
  verify: VerifyLevel
}

export const civilOrgs: OrgEntry[] = [
  { name: '蓝天救援队', desc: '品牌授权+属地队伍，查询本地支队请拨全国线或走官网', phone: '400-600-9958', url: 'https://bsr.net.cn/', verify: 'verified' },
  { name: '壹基金救援联盟', desc: '公益救援联盟，加盟/合作 info@onefoundation.cn', phone: '400-690-2700', url: 'https://onefoundation.cn/', verify: 'verified' },
  { name: '中国红十字会广西分会', desc: '救灾捐赠与救援；热线以官网/公众号公示为准', url: 'https://www.gxredcross.org.cn/', verify: 'media' },
  { name: '广西红十字基金会', desc: '募捐主体，公众号"广西红十字基金会"→我要捐赠', url: 'http://www.gxrcf.org.cn/', verify: 'verified' },
  { name: '南宁市应急局·救援队伍查询', desc: '核实属地救援队伍的官方入口', url: 'http://yjj.nanning.gov.cn/ggfw1/cxfw/t4027505.html', verify: 'verified' },
  { name: '卓明灾害信息服务中心', desc: '灾害信息处理与需求对接（微博 @卓明灾害信息）', url: 'https://weibo.com/quakeinfo', verify: 'media' },
]

// ── 6. 志愿者报名 ──
export const volunteerChannels: OrgEntry[] = [
  { name: '志愿广西', desc: '广西官方志愿服务平台（团中央"志愿云"），注册后检索救灾项目报名，含 14 地市分站', url: 'https://gx.zhiyuanyun.com/', verify: 'verified' },
  { name: '中国志愿服务网', desc: '民政部全国志愿服务系统', url: 'https://chinavolunteer.mca.gov.cn/site/', verify: 'verified' },
]

// ── 7. 捐赠渠道（合规公开募捐平台）──
export const donationChannels: OrgEntry[] = [
  { name: '腾讯公益', desc: '搜"广西 洪灾/台风"，认准公募基金会发起、带备案编号的项目', url: 'https://gongyi.qq.com/', verify: 'verified' },
  { name: '支付宝公益', desc: '阿里巴巴公益平台，合规公募通道', url: 'https://love.alipay.com/', verify: 'verified' },
  { name: '中国红十字基金会', desc: '国家级公募基金会', url: 'https://www.crcf.org.cn/', verify: 'verified' },
  { name: '中国乡村发展基金会', desc: '原中国扶贫基金会，救灾捐赠', url: 'https://www.cfpa.org.cn/', verify: 'verified' },
  { name: '慈善中国（核验工具）', desc: '捐款前查募捐主体资质、公开募捐资格与备案编号', url: 'https://cszg.mca.gov.cn/', verify: 'verified' },
]

export const antiFraudTips: string[] = [
  '募捐主体必须是慈善组织（非个人/公司账户），且能在"慈善中国"查到公开募捐资格。',
  '分清"公开募捐平台"（腾讯/支付宝公益）与"个人求助平台"（水滴筹/轻松筹）——后者无公募资质。',
  '凡只在群聊/短信/陌生链接出现的收款码或个人银行账号，一律不要转账。',
  '可疑骗捐、假冒救援收款，拨 96110 咨询或举报。',
]
