import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function createSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    // 返回一个 mock 客户端，所有操作返回空数据
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
            order: () => Promise.resolve({ data: [], error: null }),
          }),
          order: () => Promise.resolve({ data: [], error: null }),
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
          }),
        }),
        update: () => ({
          eq: () => Promise.resolve({ error: new Error("Supabase not configured") }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: new Error("Supabase not configured") }),
        }),
      }),
    } as any;
  }
  return createClient(supabaseUrl, supabaseKey);
}

export const supabase = createSupabaseClient();

export async function getOrCreateUser(userId?: string) {
  if (userId) {
    const { data } = await supabase.from("users").select("*").eq("id", userId).single();
    if (data) return data;
  }
  const { data } = await supabase.from("users").insert({}).select().single();
  return data;
}

export async function saveArchive(archive: {
  user_id: string;
  name: string;
  gender: string;
  birth_datetime: string;
  birth_place?: string;
  bazi_json: unknown;
}) {
  const { data, error } = await supabase.from("archives").insert(archive).select().single();
  if (error) throw error;
  return data;
}

export async function getArchives(userId: string) {
  const { data } = await supabase
    .from("archives")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getArchive(id: string) {
  const { data } = await supabase.from("archives").select("*").eq("id", id).single();
  return data;
}

export async function saveChatSession(session: {
  user_id: string;
  archive_id: string;
  agent_config_id?: string;
  messages: unknown;
}) {
  const { data, error } = await supabase.from("chats").insert(session).select().single();
  if (error) throw error;
  return data;
}

export async function updateChatMessages(id: string, messages: unknown) {
  const { error } = await supabase.from("chats").update({ messages }).eq("id", id);
  if (error) throw error;
}

export async function getChatSessions(userId: string, archiveId?: string) {
  let query = supabase
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (archiveId) query = query.eq("archive_id", archiveId);
  const { data } = await query;
  return data || [];
}

export async function getAgentConfigs() {
  const { data } = await supabase
    .from("agent_configs")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getAllAgentConfigs() {
  const { data } = await supabase
    .from("agent_configs")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function saveAgentConfig(config: {
  name: string;
  system_prompt: string;
  model: string;
  temperature: number;
  is_active?: boolean;
}) {
  const { data, error } = await supabase.from("agent_configs").insert(config).select().single();
  if (error) throw error;
  return data;
}

export async function updateAgentConfig(
  id: string,
  config: Partial<{
    name: string;
    system_prompt: string;
    model: string;
    temperature: number;
    is_active: boolean;
  }>
) {
  const { error } = await supabase.from("agent_configs").update(config).eq("id", id);
  if (error) throw error;
}