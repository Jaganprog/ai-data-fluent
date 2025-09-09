import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart3, Send, Loader2 } from "lucide-react";
import { generateChart, ChartResponse } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export const ChartGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [chartConfig, setChartConfig] = useState<ChartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a chart description",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateChart(prompt);
      
      // Try to parse JSON from the response if it exists
      let parsedConfig = result;
      if (result.response) {
        try {
          const jsonMatch = result.response.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[1]);
            parsedConfig = {
              ...result,
              ...parsed,
              parsedData: parsed
            };
          }
        } catch (e) {
          console.log("Could not parse JSON from response:", e);
        }
      }
      
      setChartConfig(parsedConfig);
      toast({
        title: "Chart Generated Successfully!",
        description: "Your chart has been created and is ready to view.",
      });
    } catch (error) {
      console.error("Error generating chart:", error);
      toast({
        title: "Error",
        description: "Failed to generate chart configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const renderChart = (config: any) => {
    if (!config.parsedData?.dataStructure?.rows || config.parsedData.dataStructure.rows.length === 0) {
      return null;
    }

    const data = config.parsedData.dataStructure.rows;
    const chartType = config.parsedData.chartType || config.chartType;
    const colors = config.parsedData.colorScheme || config.colorScheme || ['#8884d8', '#82ca9d', '#ffc658'];
    
    // Create chart configuration for shadcn
    const chartConfig = {
      data: {
        label: "Data",
        color: colors[0],
      },
    };

    switch (chartType?.toLowerCase()) {
      case 'bar':
        const barDataKey = Object.keys(data[0]).find(key => 
          typeof data[0][key] === 'number'
        ) || 'value';
        const barNameKey = Object.keys(data[0]).find(key => 
          typeof data[0][key] === 'string'
        ) || 'name';
        
        return (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={barNameKey} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey={barDataKey} fill={colors[0]} />
            </BarChart>
          </ChartContainer>
        );
        
      case 'line':
        const lineDataKey = Object.keys(data[0]).find(key => 
          typeof data[0][key] === 'number'
        ) || 'value';
        const lineNameKey = Object.keys(data[0]).find(key => 
          typeof data[0][key] === 'string'
        ) || 'name';
        
        return (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={lineNameKey} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey={lineDataKey} stroke={colors[0]} strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        );
        
      case 'pie':
        const pieDataKey = Object.keys(data[0]).find(key => 
          typeof data[0][key] === 'number'
        ) || 'value';
        const pieNameKey = Object.keys(data[0]).find(key => 
          typeof data[0][key] === 'string'
        ) || 'name';
        
        return (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill={colors[0]}
                dataKey={pieDataKey}
                nameKey={pieNameKey}
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        );
        
      default:
        return (
          <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
            <p className="text-muted-foreground">Chart type "{chartType}" not supported yet</p>
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Chart Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Describe the chart you want to create..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !prompt.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {chartConfig && (
          <div className="mt-4 space-y-4">
            {/* Chart Visualization */}
            {chartConfig.parsedData && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-4">Generated Chart:</h3>
                {renderChart(chartConfig)}
              </div>
            )}
            
            {/* Chart Recommendations */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Chart Recommendations:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">Chart Type:</h4>
                  <p className="text-sm capitalize bg-background p-2 rounded">
                    {chartConfig.parsedData?.chartType || chartConfig.chartType}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-1">Title:</h4>
                  <p className="text-sm bg-background p-2 rounded">
                    {chartConfig.parsedData?.config?.title || chartConfig.config?.title || "Chart Analysis"}
                  </p>
                </div>
              </div>

              {(chartConfig.parsedData?.insights || chartConfig.insights) && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Key Insights:</h4>
                  <ul className="text-sm space-y-1">
                    {(chartConfig.parsedData?.insights || chartConfig.insights).map((insight: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(chartConfig.parsedData?.colorScheme || chartConfig.colorScheme) && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Color Scheme:</h4>
                  <div className="flex gap-2">
                    {(chartConfig.parsedData?.colorScheme || chartConfig.colorScheme).map((color: string, index: number) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded border-2 border-background"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {chartConfig.response && !chartConfig.parsedData && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Additional Details:</h4>
                  <p className="text-sm whitespace-pre-wrap bg-background p-2 rounded">
                    {chartConfig.response}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};