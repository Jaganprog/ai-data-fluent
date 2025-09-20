import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Send, 
  ArrowLeft,
  Bot,
  User,
  Upload,
  FileText,
  X
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useNavigate } from "react-router-dom";
import { askGemini } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");

  const handleFileUpload = async (file: File) => {
    try {
      const content = await file.text();
      setUploadedFile(file);
      setFileContent(content);
      toast({
        title: "File Uploaded",
        description: `${file.name} is now connected to the chat`,
      });
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        title: "Error",
        description: "Failed to read the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileContent("");
    toast({
      title: "File Removed",
      description: "File disconnected from chat",
    });
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      // Create enhanced prompt with file context if available
      let enhancedPrompt = currentMessage;
      if (uploadedFile && fileContent) {
        // Parse CSV content for context
        const lines = fileContent.split('\n').filter(line => line.trim());
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const sampleData = lines.slice(1, 6).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });
          
          enhancedPrompt = `Context: I have uploaded a data file (${uploadedFile.name}) with the following structure:
          
Headers: ${headers.join(', ')}
Sample data (first 5 rows):
${JSON.stringify(sampleData, null, 2)}

User question: ${currentMessage}

Please answer the user's question based on this data context.`;
        }
      }

      const response = await askGemini(enhancedPrompt);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
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
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold">AI Chat Assistant</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Chat with AI
              </CardTitle>
              <div className="flex items-center gap-2">
                {uploadedFile ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">{uploadedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="h-6 w-6 p-0 hover:bg-green-100"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.csv,.xlsx,.xls,.json';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                      };
                      input.click();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Data
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/20 rounded-lg">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with the AI assistant</p>
                  <p className="text-sm mt-2">
                    {uploadedFile 
                      ? `Ask questions about your data file: ${uploadedFile.name}`
                      : "Upload a data file to ask questions about it, or ask general questions"
                    }
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-card border'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 opacity-70 ${
                          message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-card border rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={isLoading || !currentMessage.trim()}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;