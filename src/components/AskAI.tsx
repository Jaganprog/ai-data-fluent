import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Send, Loader2, Database } from "lucide-react";
import { askGemini } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";


interface Dataset {
  id: string;
  name: string;
  columns: any;
  row_count: number;
}

export const AskAI = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    const { data, error } = await supabase
      .from('datasets')
      .select('id, name, columns, row_count')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setDatasets(data);
    }
  };


  const handleAsk = async () => {
    if (!question.trim()) {
      toast({
        title: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await askGemini(question, selectedDataset || undefined);
      setResponse(result.response);
      toast({
        title: "AI Response Generated",
        description: "Your question has been answered successfully.",
      });
    } catch (error) {
      console.error("Error asking AI:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Ask AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {datasets.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4" />
              Select Dataset (Optional)
            </label>
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger>
                <SelectValue placeholder="Ask general questions or select a dataset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">General Question (No Dataset)</SelectItem>
                {datasets.map((dataset) => (
                  <SelectItem key={dataset.id} value={dataset.id}>
                    {dataset.name} ({dataset.row_count} rows)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            placeholder={selectedDataset ? "Ask about your data..." : "Ask me anything..."}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button 
            onClick={handleAsk} 
            disabled={isLoading || !question.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 h-4" />
            )}
          </Button>
        </div>
        
        {response && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">AI Response:</h3>
            <p className="whitespace-pre-wrap text-sm">{response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};