import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your-anon-key';

if (!isConfigured) {
  console.warn('Supabase client is not fully configured. Database submissions will fall back to local storage.');
}

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export async function invokeCoachFunction<T>(body: {
  mode: 'initial' | 'followup' | 'closing' | 'open_chat';
  contents: Array<{ role: 'model' | 'user'; parts: { text: string }[] }>;
  systemInstructionText: string;
}): Promise<T> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase.functions.invoke('coach', { body });

  if (error) {
    let message = error.message || 'coach function failed';
    try {
      const context = (error as { context?: Response }).context;
      if (context) {
        const payload = await context.json();
        if (payload?.error && typeof payload.error === 'string') {
          message = payload.error;
        }
      }
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }

  if (!data?.json) {
    throw new Error(data?.error || 'Coach function returned an empty response.');
  }

  return data.json as T;
}

export interface AssessmentScorePayload {
  stress: number;
  selfControl: number;
  timeManagement: number;
  financialThreat: number;
  socialConnectedness: number;
  overall: number;
  rawAnswers: Record<string, number>;
}

export async function upsertUserProfile(name: string, email: string): Promise<string | null> {
  if (!supabase) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();

  const { data, error } = await supabase
    .from('users')
    .upsert(
      [{ name: normalizedName, email: normalizedEmail }],
      { onConflict: 'email' }
    )
    .select('id')
    .single();

  if (error) {
    console.error('Supabase user upsert failed:', error);
    return null;
  }

  return data?.id || null;
}

export async function saveAssessmentScores(
  userId: string,
  scores: AssessmentScorePayload
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.from('assessment_scores').insert([
    {
      user_id: userId,
      stress: scores.stress,
      self_control: scores.selfControl,
      time_management: scores.timeManagement,
      financial_security: scores.financialThreat,
      social_connection: scores.socialConnectedness,
      overall: scores.overall,
      raw_answers: scores.rawAnswers,
    },
  ]);

  if (error) {
    console.error('Supabase assessment score insert failed:', error);
  }
}
