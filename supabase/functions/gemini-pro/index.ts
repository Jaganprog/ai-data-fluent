import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

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
      systemPrompt = `You are a data visualization expert. Analyze the provided CSV data and create a chart based on the user's request.

CRITICAL: You MUST analyze and process the actual data provided. Return computed/aggregated data rows ready for visualization.

Format your response as JSON with these fields:
- chartType: string (e.g., "bar", "line", "pie")
- dataStructure: { 
    example: array of objects with actual computed data rows
    // For example, if asked for sales by city, compute totals and return:
    // [{"city": "Mumbai", "sales": 5420}, {"city": "Delhi", "sales": 3210}, ...]
  }
- insights: array of strings (key findings from the data)
- colorScheme: array of hex colors
- config: object with title, xAxis label, yAxis label, etc.

IMPORTANT: The "example" array in dataStructure must contain the actual processed data, not a schema.`;
    } else {
      systemPrompt = 'You are a helpful AI assistant. Provide clear, concise, and accurate responses to user questions.';
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || 'No response generated';

    let result;
    if (type === 'chart') {
      try {
        // Extract JSON from markdown code blocks if present
        let jsonText = generatedText;
        const jsonMatch = generatedText.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        }
        
        // Parse the JSON
        const parsed = JSON.parse(jsonText);
        
        // Extract chart data from dataStructure.example if it exists
        let chartData = [];
        if (parsed.dataStructure?.example) {
          chartData = parsed.dataStructure.example;
        }
        
        result = {
          chartType: parsed.chartType?.toLowerCase().replace(' chart', '').trim() || 'bar',
          dataStructure: {
            rows: chartData
          },
          insights: parsed.insights || [],
          colorScheme: parsed.colorScheme || ['#8884d8', '#82ca9d', '#ffc658'],
          config: parsed.config || { title: 'Chart Analysis' },
          response: generatedText
        };
      } catch (error) {
        console.error('Failed to parse chart response:', error);
        // If not valid JSON, return as text with default chart config
        result = {
          response: generatedText,
          chartType: 'bar',
          dataStructure: { rows: [] },
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