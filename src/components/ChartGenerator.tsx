import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Send, Loader2 } from "lucide-react";
import { generateChart, ChartResponse } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";

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
      setChartConfig(result);
      toast({
        title: "Chart Configuration Generated",
        description: "Chart recommendations have been created successfully.",
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
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Chart Recommendations:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">Chart Type:</h4>
                  <p className="text-sm capitalize bg-background p-2 rounded">
                    {chartConfig.chartType}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-1">Title:</h4>
                  <p className="text-sm bg-background p-2 rounded">
                    {chartConfig.config.title}
                  </p>
                </div>
              </div>

              {chartConfig.insights && chartConfig.insights.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Key Insights:</h4>
                  <ul className="text-sm space-y-1">
                    {chartConfig.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {chartConfig.colorScheme && chartConfig.colorScheme.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Color Scheme:</h4>
                  <div className="flex gap-2">
                    {chartConfig.colorScheme.map((color, index) => (
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

              {chartConfig.response && (
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