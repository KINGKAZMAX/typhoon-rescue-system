-- 广西台风救援平台 · Supabase 建表脚本
-- 在 Supabase 控制台 → SQL Editor 执行。执行后把项目 URL / anon key 填入 .env.local。

-- ── 求助信息（公开求助墙）──
create table if not exists help_requests (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  type        text not null,                 -- 被困待救/医疗急需/物资短缺/临时住宿/道路失联/其他
  name        text,
  phone       text not null,                 -- 救援人员回拨用
  city        text,
  people      int,
  detail      text not null,
  -- 结构化需求（AI 拍照求助生成，可空）
  urgency     text,                          -- 危急/紧急/一般
  needs       jsonb,                         -- 物资清单等
  rare_disease jsonb,                        -- 罕见病/慢病字段（病种/体征/用药/透析/供氧）
  lat         double precision,
  lng         double precision,
  status      text not null default 'open'   -- open/processing/resolved
);

-- ── 志愿者/救援队报名（隐私：不公开展示，仅供组织方使用）──
create table if not exists volunteer_signups (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  phone       text not null,
  city        text,
  role        text,                          -- 个人志愿者/救援队/车辆船只/物资捐赠方/医疗心理
  skills      text,
  detail      text
);

-- ── 物资站点 / 安置点 ──
create table if not exists supply_stations (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  name        text not null,
  city        text,
  address     text,
  lat         double precision,
  lng         double precision,
  type        text,                          -- 安置点/物资发放/医疗点/取水点/救援站
  supplies    text,                          -- 可提供的物资
  contact     text,
  status      text default 'open',           -- open/full/closed
  verify      text default 'unverified'      -- verified/media/unverified
);

-- ── 行级安全 RLS ──
alter table help_requests    enable row level security;
alter table volunteer_signups enable row level security;
alter table supply_stations  enable row level security;

-- 求助墙：匿名可提交、可查看（生产环境建议加审核/限流/字段脱敏）
create policy "help insert" on help_requests for insert with check (true);
create policy "help read"   on help_requests for select using (true);

-- 志愿者报名：仅允许匿名提交，不允许匿名读取（保护报名者隐私，组织方用 service_role 读）
create policy "vol insert"  on volunteer_signups for insert with check (true);

-- 物资站点：匿名可读；写入建议后台/管理员，这里默认不开放匿名写
create policy "station read" on supply_stations for select using (true);

-- 提示：生产环境应对 help_requests 增加内容审核、频率限制，并在前端对展示的电话做脱敏。
