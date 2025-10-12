import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { askGemini } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface AskAIProps {
  uploadedFile?: File | null;
}

export const AskAI = ({ uploadedFile }: AskAIProps) => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileData, setFileData] = useState<string>("");
  const { toast } = useToast();

  // Parse file when uploaded (handles both CSV and Excel)
  useEffect(() => {
    if (uploadedFile) {
      const fileExtension = uploadedFile.name.split('.').pop()?.toLowerCase();
      const isExcel = fileExtension === 'xlsx' || fileExtension === 'xls';
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (isExcel) {
          // Parse Excel file
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csvText = XLSX.utils.sheet_to_csv(worksheet);
          setFileData(csvText);
        } else {
          // Parse as plain text (CSV)
          const text = e.target?.result as string;
          setFileData(text);
        }
      };
      
      if (isExcel) {
        reader.readAsArrayBuffer(uploadedFile);
      } else {
        reader.readAsText(uploadedFile);
      }
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