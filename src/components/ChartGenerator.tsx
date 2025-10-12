import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart3, Send, Loader2 } from "lucide-react";
import { generateChart, ChartResponse } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import * as XLSX from 'xlsx';

interface ChartGeneratorProps {
  uploadedFile?: File | null;
}

export const ChartGenerator = ({ uploadedFile }: ChartGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [chartConfig, setChartConfig] = useState<ChartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileData, setFileData] = useState<string>("");
  const { toast } = useToast();

  // Parse CSV or Excel when file is uploaded
  useEffect(() => {
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        
        // Check if it's an Excel file
        if (uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls')) {
          try {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const csvText = XLSX.utils.sheet_to_csv(firstSheet);
            setFileData(csvText);
          } catch (error) {
            console.error("Error parsing Excel file:", error);
            toast({
              title: "Error parsing Excel file",
              description: "Please ensure the file is a valid Excel file",
              variant: "destructive",
            });
          }
        } else {
          // Plain text/CSV file
          setFileData(data as string);
        }
      };
      
      // Read as array buffer for Excel, as text for CSV
      if (uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls')) {
        reader.readAsArrayBuffer(uploadedFile);
      } else {
        reader.readAsText(uploadedFile);
      }
    } else {
      setFileData("");
    }
  }, [uploadedFile, toast]);

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
      let enhancedPrompt = prompt;
      
      if (fileData && uploadedFile) {
        enhancedPrompt = `Context: I have uploaded a CSV file named "${uploadedFile.name}". Here is the data:\n\n${fileData.substring(0, 5000)}\n\nChart Request: ${prompt}\n\nPlease analyze this data and create a chart based on it.`;
      }
      
      const result = await generateChart(enhancedPrompt);
      console.log("Chart result:", result);
      setChartConfig(result);
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

  const renderChart = (config: ChartResponse) => {
    // Use dataStructure.rows directly from the API response
    const data = config.dataStructure?.rows || [];
    if (!data || data.length === 0) {
      return null;
    }

    const chartType = config.chartType || 'bar';
    const colors = config.colorScheme || ['#8884d8', '#82ca9d', '#ffc658'];
    
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
          {uploadedFile && (
            <span className="text-xs font-normal text-muted-foreground">
              • {uploadedFile.name}
            </span>
          )}
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
        
        {chartConfig && chartConfig.dataStructure?.rows && chartConfig.dataStructure.rows.length > 0 && (
          <div className="mt-4 space-y-4">
            {/* Chart Visualization */}
            <div className="p-6 bg-card rounded-lg border">
              <h3 className="font-semibold mb-4 text-foreground">Generated Chart:</h3>
              {renderChart(chartConfig)}
            </div>
            
            {/* Chart Recommendations */}
            <div className="p-6 bg-card rounded-lg border space-y-4">
              <h3 className="font-semibold text-foreground">Chart Recommendations:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">Chart Type:</h4>
                  <p className="text-sm capitalize bg-accent/50 p-3 rounded">
                    {chartConfig.chartType}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">Title:</h4>
                  <p className="text-sm bg-accent/50 p-3 rounded">
                    {chartConfig.config?.title || "Chart Analysis"}
                  </p>
                </div>
              </div>

              {chartConfig.insights && chartConfig.insights.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">Key Insights:</h4>
                  <ul className="text-sm space-y-2">
                    {chartConfig.insights.map((insight: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {chartConfig.colorScheme && chartConfig.colorScheme.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 text-muted-foreground">Color Scheme:</h4>
                  <div className="flex gap-2 flex-wrap">
                    {chartConfig.colorScheme.map((color: string, index: number) => (
                      <div
                        key={index}
                        className="w-10 h-10 rounded border border-border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};