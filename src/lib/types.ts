export interface UserProfile {
  id: string;
  name?: string;
  created_at: string;
}

export interface BaziArchive {
  id: string;
  user_id: string;
  name: string;
  gender: "男" | "女";
  birth_datetime: string;
  birth_place?: string;
  bazi_json: BaziResult;
  created_at: string;
}

export interface BaziPillar {
  heavenly_stem: string;
  earthly_branch: string;
  hidden_stems: string[];
  wuxing: string;
  nayin: string;
  shishen?: string;
}

export interface BaziResult {
  year_pillar: BaziPillar;
  month_pillar: BaziPillar;
  day_pillar: BaziPillar;
  hour_pillar: BaziPillar;
  four_pillars: string;
  day_master: string;
  day_master_wuxing: string;
  gender: string;
  wuxing_distribution: Record<string, number>;
  wuxing_summary: string;
  zodiac: string;
  lunar_birthday: string;
  shengxiao: string;
  nayin: string[];
  shishen: string[];
  hidden_stems: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  archive_id: string;
  agent_config_id?: string;
  messages: ChatMessage[];
  created_at: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  system_prompt: string;
  model: string;
  temperature: number;
  is_active: boolean;
  created_at: string;
}

export interface BirthInfo {
  name: string;
  gender: "男" | "女";
  birthDate: Date;
  birthHour: number;
  birthMinute: number;
  birthPlace?: string;
}