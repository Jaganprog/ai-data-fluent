import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  Upload, 
  MessageSquare, 
  Download, 
  FileText, 
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Search,
  Plus,
  Bell,
  Settings,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AskAI } from "@/components/AskAI";
import { ChartGenerator } from "@/components/ChartGenerator";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
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
              onClick={() => {
                toast({
                  title: "Settings",
                  description: "Opening settings...",
                });
              }}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Avatar>
              <AvatarFallback className="bg-gradient-hero text-white">JD</AvatarFallback>
            </Avatar>
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
                  onClick={() => {
                    toast({
                      title: "New Chat",
                      description: "Starting a new AI conversation",
                    });
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                  New Chat
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    toast({
                      title: "Create Dashboard",
                      description: "Opening dashboard creator",
                    });
                  }}
                >
                  <BarChart3 className="w-4 h-4" />
                  Create Dashboard
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Datasets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-smooth">
                  <FileText className="w-4 h-4 text-data-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">sales_q4_2024.csv</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-smooth">
                  <FileText className="w-4 h-4 text-data-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">customer_data.csv</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-smooth">
                  <FileText className="w-4 h-4 text-data-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">marketing_metrics.csv</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome Section */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">$127,490</p>
                      <p className="text-xs text-accent">+12% from last month</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-data-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                      <p className="text-2xl font-bold">2,847</p>
                      <p className="text-xs text-accent">+5% this week</p>
                    </div>
                    <Users className="w-8 h-8 text-data-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                      <p className="text-2xl font-bold">3.24%</p>
                      <p className="text-xs text-accent">+0.3% improvement</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-data-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Datasets</p>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-xs text-muted-foreground">3 active chats</p>
                    </div>
                    <FileText className="w-8 h-8 text-data-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upload Section */}
            <Card className="border-2 border-dashed border-data-primary/30">
              <CardContent className="p-12 text-center">
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
              </CardContent>
            </Card>

            {/* AI Features */}
            <div className="grid md:grid-cols-2 gap-6">
              <AskAI />
              <ChartGenerator />
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Recent Chats
                  </CardTitle>
                  <CardDescription>
                    Your latest AI conversations and insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-data rounded-lg border">
                    <p className="text-sm font-medium mb-1">Sales Analysis Q4</p>
                    <p className="text-xs text-muted-foreground mb-2">2 hours ago</p>
                    <p className="text-sm">"What were our top performing products last quarter?"</p>
                  </div>
                  <div className="p-4 bg-gradient-data rounded-lg border">
                    <p className="text-sm font-medium mb-1">Customer Insights</p>
                    <p className="text-xs text-muted-foreground mb-2">1 day ago</p>
                    <p className="text-sm">"Show me customer retention trends by region"</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "All Chats",
                        description: "Loading all chat history...",
                      });
                    }}
                  >
                    View All Chats
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Saved Dashboards
                  </CardTitle>
                  <CardDescription>
                    Your exported dashboards and reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-data rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">Q4 Sales Report</p>
                      <p className="text-xs text-muted-foreground">Created 2 hours ago</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Downloading",
                          description: "Q4 Sales Report is being downloaded...",
                        });
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-data rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">Marketing Dashboard</p>
                      <p className="text-xs text-muted-foreground">Created 1 day ago</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Downloading",
                          description: "Marketing Dashboard is being downloaded...",
                        });
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "All Dashboards",
                        description: "Loading all saved dashboards...",
                      });
                    }}
                  >
                    View All Dashboards
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;