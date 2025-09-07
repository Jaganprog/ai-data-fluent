import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type = 'general' } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let systemPrompt = '';
    
    if (type === 'chart') {
      systemPrompt = `You are a data visualization expert. Based on the user's request, provide specific recommendations for:
1. Chart type (bar, line, pie, scatter, etc.)
2. Data structure needed
3. Key insights to highlight
4. Color scheme suggestions
5. Axis labels and titles

Format your response as JSON with these fields:
- chartType: string
- dataStructure: object
- insights: array of strings
- colorScheme: array of hex colors
- config: object with axis labels, title, etc.`;
    } else {
      systemPrompt = 'You are a helpful AI assistant. Provide clear, concise, and accurate responses to user questions.';
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    let result;
    if (type === 'chart') {
      try {
        // Try to parse as JSON for chart responses
        result = JSON.parse(generatedText);
      } catch {
        // If not valid JSON, return as text with default chart config
        result = {
          response: generatedText,
          chartType: 'bar',
          dataStructure: {},
          insights: ['Review the response for chart recommendations'],
          colorScheme: ['#8884d8', '#82ca9d', '#ffc658'],
          config: { title: 'Chart Analysis' }
        };
      }
    } else {
      result = { response: generatedText };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gemini-pro function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred while processing your request' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});