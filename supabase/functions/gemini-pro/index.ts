import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

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

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let systemPrompt = '';
    
    if (type === 'chart') {
      systemPrompt = `You are a data visualization expert. Based on the user's request, provide specific recommendations for creating charts.

Return your response as valid JSON with these exact fields:
{
  "chartType": "bar|line|pie|scatter",
  "dataStructure": {
    "columns": [{"name": "string", "type": "string|number"}],
    "rows": [{"key": "value"}]
  },
  "insights": ["insight 1", "insight 2"],
  "colorScheme": ["#8884d8", "#82ca9d", "#ffc658"],
  "config": {
    "title": "Chart Title",
    "xAxisLabel": "X Axis",
    "yAxisLabel": "Y Axis"
  }
}

Create sample data that matches the user's request with at least 4-5 data points.`;
    } else {
      systemPrompt = 'You are a helpful AI assistant. Provide clear, concise, and accurate responses to user questions.';
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
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
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || 'No response generated';

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
          dataStructure: {
            columns: [
              { name: "category", type: "string" },
              { name: "value", type: "number" }
            ],
            rows: [
              { category: "Sample A", value: 100 },
              { category: "Sample B", value: 80 },
              { category: "Sample C", value: 120 },
              { category: "Sample D", value: 90 }
            ]
          },
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
