import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { askGemini } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";

interface AskAIProps {
  uploadedFile?: File | null;
}

export const AskAI = ({ uploadedFile }: AskAIProps) => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileData, setFileData] = useState<string>("");
  const { toast } = useToast();

  // Parse CSV when file is uploaded
  useEffect(() => {
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFileData(text);
      };
      reader.readAsText(uploadedFile);
    } else {
      setFileData("");
    }
  }, [uploadedFile]);

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
      let enhancedPrompt = question;
      
      if (fileData && uploadedFile) {
        enhancedPrompt = `Context: I have uploaded a CSV file named "${uploadedFile.name}". Here is the data:\n\n${fileData.substring(0, 5000)}\n\nQuestion: ${question}`;
      }
      
      const result = await askGemini(enhancedPrompt);
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
            placeholder="Ask me anything..."
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
              <Send className="h-4 w-4" />
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