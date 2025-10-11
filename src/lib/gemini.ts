import { supabase } from "@/integrations/supabase/client";

export interface GeminiResponse {
  response: string;
}

export interface ChartResponse {
  chartType: string;
  dataStructure: {
    rows?: any[];
    columns?: { name: string; type: string }[];
  };
  insights: string[];
  colorScheme: string[];
  config: {
    title: string;
    [key: string]: any;
  };
  response?: string;
}

export const askGemini = async (prompt: string): Promise<GeminiResponse> => {
  const { data, error } = await supabase.functions.invoke('gemini-pro', {
    body: { prompt, type: 'general' }
  });

  if (error) {
    throw new Error(error.message || 'Failed to get AI response');
  }

  return data;
};

export const generateChart = async (prompt: string): Promise<ChartResponse> => {
  const { data, error } = await supabase.functions.invoke('gemini-pro', {
    body: { prompt, type: 'chart' }
  });

  if (error) {
    throw new Error(error.message || 'Failed to generate chart recommendations');
  }

  return data;
};