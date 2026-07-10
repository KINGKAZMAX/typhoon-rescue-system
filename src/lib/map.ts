// 地图/导航能力层 — 零 key、零备案、大陆免翻墙（URI 唤起高德/腾讯地图）
// ⚠️ 坐标系与经纬度顺序：高德 lng,lat(GCJ-02) / 腾讯 lat,lng。本项目统一以 GCJ-02 存储 {lat,lng}。
// 详见 research/06-中国地图集成方案.md

const APP = '广西台风救援平台'
const enc = encodeURIComponent

/** 高德导航（驾车）—— 经度在前 */
export function amapNav(lat: number, lng: number, name: string): string {
  return `https://uri.amap.com/navigation?to=${lng},${lat},${enc(name)}&mode=car&src=${enc(APP)}&coordinate=gaode&callnative=1`
}

/** 腾讯导航（驾车）—— 纬度在前 */
export function qqNav(lat: number, lng: number, name: string): string {
  return `https://apis.map.qq.com/uri/v1/routeplan?type=drive&to=${enc(name)}&tocoord=${lat},${lng}&coord_type=2&referer=${enc(APP)}`
}

/** 无坐标时：按名称/地址在高德内搜索唤起（不硬编造坐标） */
export function amapSearch(keyword: string): string {
  return `https://uri.amap.com/search?keyword=${enc(keyword)}&src=${enc(APP)}&coordinate=gaode&callnative=1`
}

/** 腾讯按关键词搜索 */
export function qqSearch(keyword: string): string {
  return `https://apis.map.qq.com/uri/v1/search?keyword=${enc(keyword)}&referer=${enc(APP)}`
}
