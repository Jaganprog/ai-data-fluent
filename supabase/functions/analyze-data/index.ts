import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!geminiApiKey) {
  throw new Error('GEMINI_API_KEY is required');
}

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

interface DataAnalysisRequest {
  fileContent: string;
  fileName: string;
  fileType: string;
}

interface DashboardConfig {
  name: string;
  description: string;
  category: string;
  widgets: Array<{
    id: string;
    type: string;
    title: string;
    chartType: string;
    data: any[];
    insights: string[];
    colorScheme: string[];
  }>;
  layout: string;
  metrics: Array<{
    title: string;
    value: string;
    change: string;
    icon: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileContent, fileName, fileType }: DataAnalysisRequest = await req.json();
    
    console.log(`Analyzing file: ${fileName} (${fileType})`);

    // Parse CSV content (simple implementation)
    let parsedData: any[] = [];
    if (fileType.includes('csv') || fileType.includes('text')) {
      const lines = fileContent.split('\n').filter(line => line.trim());
      if (lines.length > 1) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        parsedData = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((header, index) => {
            const value = values[index] || '';
            // Try to parse as number
            const numValue = parseFloat(value);
            row[header] = isNaN(numValue) ? value : numValue;
          });
          return row;
        });
      }
    }

    if (parsedData.length === 0) {
      throw new Error('No data could be parsed from the file');
    }

    // Prepare data sample for AI analysis (limit to avoid token limits)
    const sampleData = parsedData.slice(0, Math.min(20, parsedData.length));
    const dataStructure = {
      columns: Object.keys(sampleData[0] || {}),
      sampleRows: sampleData,
      totalRows: parsedData.length
    };

    console.log('Data structure:', dataStructure);

    // Generate dashboard configuration using Gemini
    const prompt = `
    Analyze this dataset and create a comprehensive dashboard configuration. Here's the data:
    
    File: ${fileName}
    Columns: ${dataStructure.columns.join(', ')}
    Total Rows: ${dataStructure.totalRows}
    Sample Data: ${JSON.stringify(sampleData, null, 2)}
    
    Create a dashboard configuration with:
    1. An appropriate dashboard name and description
    2. 3-6 relevant widgets with different chart types (bar, line, pie)
    3. Key metrics cards
    4. Insights about the data
    5. Appropriate color schemes
    
    Return ONLY a JSON object with this structure:
    {
      "name": "Dashboard Name",
      "description": "Dashboard description",
      "category": "sales|marketing|operations|hr|finance|custom",
      "layout": "grid",
      "metrics": [
        {
          "title": "Metric Name",
          "value": "123,456",
          "change": "+12% from last month",
          "icon": "DollarSign|Users|TrendingUp|BarChart3"
        }
      ],
      "widgets": [
        {
          "id": "widget1",
          "type": "chart",
          "title": "Chart Title",
          "chartType": "bar|line|pie",
          "data": [{"name": "Item1", "value": 100}],
          "insights": ["Key insight about this chart"],
          "colorScheme": ["#8884d8", "#82ca9d", "#ffc658"]
        }
      ]
    }
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    console.log('Generated text:', generatedText);

    // Parse the JSON response
    let dashboardConfig: DashboardConfig;
    try {
      // Try to extract JSON from the response
      const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                       generatedText.match(/```\n([\s\S]*?)\n```/) ||
                       generatedText.match(/\{[\s\S]*\}/);
      
      let jsonStr = '';
      if (jsonMatch) {
        jsonStr = jsonMatch[1] || jsonMatch[0];
      } else {
        jsonStr = generatedText;
      }
      
      dashboardConfig = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      console.log('Raw response:', generatedText);
      
      // Create a fallback dashboard
      dashboardConfig = {
        name: `${fileName.replace(/\.[^/.]+$/, "")} Dashboard`,
        description: `AI-generated dashboard for ${fileName}`,
        category: "custom",
        layout: "grid",
        metrics: [
          {
            title: "Total Records",
            value: parsedData.length.toString(),
            change: "Data uploaded",
            icon: "BarChart3"
          }
        ],
        widgets: [
          {
            id: "overview",
            type: "chart",
            title: "Data Overview",
            chartType: "bar",
            data: sampleData.slice(0, 10),
            insights: [`Analyzed ${parsedData.length} records from ${fileName}`],
            colorScheme: ["#8884d8", "#82ca9d", "#ffc658"]
          }
        ]
      };
    }

    // Enhance the dashboard config with actual data
    dashboardConfig.widgets = dashboardConfig.widgets.map(widget => {
      if (widget.data && widget.data.length > 0) {
        // Use actual data from the file instead of sample data
        const relevantData = parsedData.slice(0, 20); // Limit for performance
        return {
          ...widget,
          data: relevantData
        };
      }
      return widget;
    });

    console.log('Final dashboard config:', dashboardConfig);

    return new Response(JSON.stringify({
      success: true,
      dashboardConfig,
      dataPreview: sampleData,
      totalRows: parsedData.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-data function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});