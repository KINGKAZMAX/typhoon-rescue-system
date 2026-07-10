-- 广西台风救援平台 · Supabase 建表脚本
-- 在 Supabase 控制台 → SQL Editor 执行。执行后把项目 URL / anon key 填入 .env.local。

-- ── 求助信息（工单化：待对接 pending → 对接中 claimed → 已解决 rescued）──
-- 隐私分级：detail 为公开脱敏摘要（进公开求助墙）；phone / lat / lng / detail_private
--          为敏感私有列，匿名不可读，仅救援方(service_role/鉴权后台)可读。
create table if not exists help_requests (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  type           text not null,                 -- 被困待救/医疗急需/物资短缺/…
  name           text,                          -- 敏感
  phone          text not null,                 -- 敏感：回拨用，公开视图仅返回脱敏
  city           text,
  people         int,
  urgency        text,                          -- critical/high/medium/low
  needs          jsonb,                         -- 物资/需求清单
  rare_disease   boolean,                       -- 是否涉及罕见病/慢病（仅布尔标记进公开）
  detail         text not null,                 -- 公开脱敏摘要
  detail_private text,                          -- 敏感：原始描述/精确位置/病历
  lat            double precision,              -- 敏感：精确坐标
  lng            double precision,
  status         text not null default 'pending', -- pending/claimed/rescued
  claimed_by     text                           -- 认领的救援队/志愿者
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

-- ── 报平安 / 寻人（对标 Google Person Finder）──
create table if not exists person_records (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  kind        text not null,                 -- 报平安 / 寻人
  name        text not null,                 -- 可搜索：报平安=本人 / 寻人=被寻者
  location    text,                          -- 可搜索：所在地 / 最后出现地
  status      text not null,                 -- 安全/已安置/安全但需帮助/寻找中/已找到
  phone       text,                          -- 敏感：公开视图脱敏
  feature     text,                          -- 寻人特征
  note        text
);

-- ── 行级安全 RLS（安全默认：敏感 PII 绝不对匿名开放）──
alter table help_requests     enable row level security;
alter table volunteer_signups enable row level security;
alter table supply_stations   enable row level security;
alter table person_records    enable row level security;

-- 求助：匿名可提交；匿名【不可 select 原表】(避免拉走电话/坐标/病历)；
--       匿名仅可更新工单状态与认领人(列级授权)，用于"我来跟进/已解决"闭环。
create policy "help insert" on help_requests for insert with check (true);
create policy "help claim"  on help_requests for update using (true) with check (true);
revoke select on help_requests from anon;
grant  update (status, claimed_by) on help_requests to anon;

-- 公开求助墙只读【脱敏视图】：只暴露非敏感列 + 脱敏电话，绝不含精确定位/病历/完整电话/姓名。
-- 视图默认以属主(postgres)权限运行，绕过原表 RLS，从而安全地只返回脱敏结果。
create or replace view help_requests_public as
  select id, created_at, type, city, people, urgency,
         (rare_disease is true)                          as "rareDisease",
         detail,
         left(phone, 3) || '****' || right(phone, 2)     as phone,
         status, claimed_by                              as "claimedBy"
  from help_requests;
grant select on help_requests_public to anon, authenticated;

-- 志愿者报名：仅允许匿名提交，不允许匿名读取（保护报名者隐私，组织方用 service_role 读）
create policy "vol insert"  on volunteer_signups for insert with check (true);

-- 物资站点：匿名可读；写入建议后台/管理员，这里默认不开放匿名写
create policy "station read" on supply_stations for select using (true);

-- 报平安/寻人：匿名可提交；匿名不可读原表(避免拉走电话)；仅可更新 status(寻人闭环"已找到")。
-- 公开只走脱敏视图：姓名/地点可搜索(寻人所需)，电话脱敏。
create policy "pf insert" on person_records for insert with check (true);
create policy "pf update" on person_records for update using (true) with check (true);
revoke select on person_records from anon;
grant  update (status) on person_records to anon;
create or replace view person_records_public as
  select id, created_at, kind, name, location, status, feature, note,
         left(phone, 3) || '****' || right(phone, 2) as phone
  from person_records;
grant select on person_records_public to anon, authenticated;

-- ⚠️ 生产环境务必补充（不能靠人力自觉，用机制守住四条底线）：
--   1) 内容审核 + 频率限制(防刷爆)；2) 认领鉴权(避免任意匿名改状态)；
--   3) 汛后自动脱敏/销毁个人信息(留脱敏复盘)；
--   4) 完整 phone / lat / lng / detail_private 仅经鉴权后台(service_role)读取，绝不下发浏览器。
