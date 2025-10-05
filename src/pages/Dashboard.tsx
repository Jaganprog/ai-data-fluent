import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  Upload, 
  MessageSquare, 
  FileText, 
  Search,
  Plus,
  Bell,
  Settings
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AskAI } from "@/components/AskAI";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { ChartGenerator } from "@/components/ChartGenerator";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                DataChat Insights
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search datasets, chats, dashboards..." 
                className="pl-10 w-80"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-primary/10"
              onClick={() => {
                toast({
                  title: "Notifications",
                  description: "No new notifications",
                });
              }}
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-primary/10"
              onClick={() => navigate("/dashboard/settings")}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <UserProfileMenu />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="default" 
                  className="w-full justify-start bg-gradient-to-r from-primary to-data-secondary"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.csv';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        toast({
                          title: "File Selected",
                          description: `${file.name} is ready for upload`,
                        });
                      }
                    };
                    input.click();
                  }}
                >
                  <Upload className="w-4 h-4" />
                  Upload CSV
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/dashboard/chat")}
                >
                  <MessageSquare className="w-4 h-4" />
                  New Chat
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/dashboard/create")}
                >
                  <BarChart3 className="w-4 h-4" />
                  Create Dashboard
                </Button>
              </CardContent>
            </Card>

          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">

            {/* Upload Section */}
            <Card className="border-2 border-dashed border-data-primary/30">
              <CardContent className="p-12 text-center">
                {!selectedFile ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Upload Your Data</h3>
                      <p className="text-muted-foreground mb-6">
                        Drag & drop your CSV file here, or click to browse and select
                      </p>
                    </div>
                    <Button 
                      variant="default"
                      className="bg-gradient-to-r from-primary to-data-secondary text-white"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.csv,.xlsx,.json';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            setSelectedFile(file);
                            toast({
                              title: "File Ready",
                              description: `${file.name} selected for analysis`,
                            });
                          }
                        };
                        input.click();
                      }}
                    >
                      Choose File
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Supports CSV files up to 100MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">File Selected</h3>
                      <div className="bg-muted/50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="w-5 h-5 text-data-primary" />
                          <div className="text-left">
                            <p className="font-medium">{selectedFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Unknown type'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        variant="outline"
                        onClick={() => setSelectedFile(null)}
                      >
                        Remove File
                      </Button>
                      <Button 
                        variant="default"
                        className="bg-gradient-to-r from-primary to-data-secondary text-white"
                        onClick={() => {
                          toast({
                            title: "Upload Started",
                            description: `Uploading ${selectedFile.name}...`,
                          });
                          // Here you would handle the actual upload
                        }}
                      >
                        Start Upload
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Features */}
            <div className="grid md:grid-cols-2 gap-6">
              <AskAI />
              <ChartGenerator />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;