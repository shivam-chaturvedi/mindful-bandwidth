const DEFAULT_MODEL = 'gpt-4.1-nano-2025-04-14';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

type CoachMessage = {
  role?: string;
  parts?: Array<{ text?: string }>;
};

type CoachPayload = {
  contents?: CoachMessage[];
  mode?: 'initial' | 'followup' | 'closing' | 'open_chat';
  systemInstructionText?: string;
};

function tryParseJson(text: string): unknown | null {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    /* ignore */
  }

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function extractStructuredJson(data: Record<string, unknown>): unknown | null {
  if (data?.output_parsed && typeof data.output_parsed === 'object') {
    return data.output_parsed;
  }

  if (typeof data?.output_text === 'string') {
    const parsed = tryParseJson(data.output_text);
    if (parsed) return parsed;
  }

  const outputs = Array.isArray(data?.output) ? data.output : [];
  for (const outputItem of outputs as Array<Record<string, unknown>>) {
    const contents = Array.isArray(outputItem?.content) ? outputItem.content : [];
    for (const contentItem of contents as Array<Record<string, unknown>>) {
      if (contentItem?.parsed && typeof contentItem.parsed === 'object') {
        return contentItem.parsed;
      }

      if (typeof contentItem?.text === 'string') {
        const parsed = tryParseJson(contentItem.text);
        if (parsed) return parsed;
      }

      if (typeof contentItem?.value === 'string') {
        const parsed = tryParseJson(contentItem.value);
        if (parsed) return parsed;
      }
    }
  }

  return null;
}

function getSchemaForMode(mode: CoachPayload['mode']) {
  switch (mode) {
    case 'initial':
      return {
        name: 'coach_initial_response',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            intro: { type: 'string' },
            question: { type: 'string' },
          },
          required: ['intro', 'question'],
        },
      };
    case 'followup':
      return {
        name: 'coach_followup_response',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            question: { type: 'string' },
          },
          required: ['question'],
        },
      };
    case 'closing':
      return {
        name: 'coach_closing_response',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            summary: { type: 'string' },
          },
          required: ['summary'],
        },
      };
    case 'open_chat':
      return {
        name: 'coach_open_chat_response',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            message: { type: 'string' },
          },
          required: ['message'],
        },
      };
    default:
      return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  const model = Deno.env.get('OPENAI_MODEL') || DEFAULT_MODEL;

  if (!apiKey) {
    return jsonResponse({
      error: 'OpenAI API key is not configured. Set OPENAI_API_KEY as a Supabase secret.',
    }, 503);
  }

  try {
    const body = (await req.json()) as CoachPayload;
    const contents = Array.isArray(body.contents) ? body.contents : [];
    const mode = body.mode;
    const systemInstructionText =
      typeof body.systemInstructionText === 'string' ? body.systemInstructionText : '';

    if (!systemInstructionText) {
      return jsonResponse({ error: 'Missing systemInstructionText.' }, 400);
    }

    const schemaConfig = getSchemaForMode(mode);
    if (!schemaConfig) {
      return jsonResponse({ error: 'Missing or unsupported coach response mode.' }, 400);
    }

    const input = contents
      .map((message) => ({
        role: message.role === 'model' ? 'assistant' : 'user',
        content: (message.parts || [])
          .map((part) => part?.text || '')
          .join('\n\n')
          .trim(),
      }))
      .filter((message) => message.content);

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        instructions: systemInstructionText,
        input,
        temperature: 0.7,
        store: false,
        text: {
          format: {
            type: 'json_schema',
            name: schemaConfig.name,
            schema: schemaConfig.schema,
            strict: true,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return jsonResponse({
        error: `OpenAI API request failed with status ${response.status}: ${errorText}`,
      }, response.status);
    }

    const data = await response.json();
    const parsed = extractStructuredJson(data);

    if (!parsed || typeof parsed !== 'object') {
      console.error('Coach function received invalid structured output', JSON.stringify(data));
      return jsonResponse({
        error: 'OpenAI returned a response that did not match the required JSON schema.',
      }, 502);
    }

    return jsonResponse({ json: parsed });
  } catch (error) {
    console.error('Coach function failed', error);
    return jsonResponse({
      error: error instanceof Error ? error.message : 'Failed to generate coach response.',
    }, 500);
  }
});
