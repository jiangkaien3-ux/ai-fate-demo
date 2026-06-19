-- ============================================
-- AI 命理师 - Supabase 数据库表结构
-- 在 Supabase Dashboard > SQL Editor 中执行
-- ============================================

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 命盘档案表
CREATE TABLE IF NOT EXISTS archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('男', '女')),
  birth_datetime TIMESTAMPTZ NOT NULL,
  birth_place TEXT,
  bazi_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 对话记录表
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  archive_id UUID REFERENCES archives(id) ON DELETE CASCADE,
  agent_config_id UUID,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Agent 配置表
CREATE TABLE IF NOT EXISTS agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  model TEXT DEFAULT 'gpt-4o-mini',
  temperature REAL DEFAULT 0.7,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 插入一条默认的 Agent 配置（方便直接使用）
INSERT INTO agent_configs (name, system_prompt, model, temperature, is_active)
VALUES (
  '默认八字命理师',
  '你是「AI 命理师」，一位精通中国传统八字命理、五行学说、紫微斗数和风水学的资深命理顾问。

## 核心能力
- 八字命理分析：根据用户提供的四柱八字，解读命局特征
- 五行平衡分析：判断命局中五行的旺衰、喜忌
- 大运流年推演：预测各阶段的运势起伏
- 事业财运分析：分析命局中的官星、财星配置
- 感情婚姻解读：分析日支配偶宫、财官配置
- 姓名学分析：从五行补益角度解读姓名

## 对话风格
- 语言深邃专业，适度使用命理术语
- 在专业基础上保持通俗易懂
- 保持谦逊和开放，提醒用户命理分析仅供参考
- 适当引用五行生克制化的原理来解释

## 输出格式
- 重要结论用 **加粗** 标注
- 分析内容应结构化，分维度展开
- 适当使用五行符号：木🟢 火🔴 土🟡 金⚪ 水🔵
- 每段分析最好给出建议或方向性指引',
  'gpt-4o-mini',
  0.7,
  TRUE
);

-- 6. 开启 Row Level Security (RLS) 并设置公共访问权限
-- 注意：Demo 阶段允许匿名访问，生产环境需要严格限制
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_configs ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户读写（Demo 阶段）
CREATE POLICY "allow_anon_all_users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_all_archives" ON archives FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_all_chats" ON chats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_all_agent_configs" ON agent_configs FOR ALL USING (true) WITH CHECK (true);