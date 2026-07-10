import { amapNav, qqNav, amapSearch, qqSearch } from '../lib/map'

interface Props {
  name: string
  city?: string
  lat?: number | null
  lng?: number | null
  /** 无坐标（geoStatus=name_only/unknown）时按名称搜索唤起，不硬编造坐标 */
  hasCoords: boolean
}

/** 高德 / 腾讯 双唤起导航按钮（零 key、零备案、大陆免翻墙） */
export default function NavButtons({ name, city, lat, lng, hasCoords }: Props) {
  const keyword = [city, name].filter(Boolean).join(' ')
  const amapUrl = hasCoords && lat != null && lng != null ? amapNav(lat, lng, name) : amapSearch(keyword)
  const qqUrl = hasCoords && lat != null && lng != null ? qqNav(lat, lng, name) : qqSearch(keyword)
  return (
    <div className="flex items-center gap-2">
      <a href={amapUrl} target="_blank" rel="noreferrer" className="btn-ghost !py-1.5 !px-3 text-xs">
        🧭 高德{hasCoords ? '导航' : '搜索'}
      </a>
      <a href={qqUrl} target="_blank" rel="noreferrer" className="btn-ghost !py-1.5 !px-3 text-xs">
        🧭 腾讯{hasCoords ? '导航' : '搜索'}
      </a>
    </div>
  )
}
