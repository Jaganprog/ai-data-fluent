import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { 
  ArrowLeft, 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Plus,
  Upload,
  FileText,
  Loader2,
  Sparkles,
  Brain
} from "lucide-react";

const CreateDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiGeneratedConfig, setAiGeneratedConfig] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    widgets: [] as string[],
    layout: "grid"
  });

  const availableWidgets = [
    { id: "revenue", name: "Revenue Chart", icon: DollarSign, description: "Track revenue over time" },
    { id: "users", name: "User Analytics", icon: Users, description: "Monitor user growth and activity" },
    { id: "conversion", name: "Conversion Rates", icon: TrendingUp, description: "Analyze conversion funnel" },
    { id: "timeline", name: "Timeline View", icon: Calendar, description: "Date-based data visualization" },
    { id: "pie", name: "Distribution Chart", icon: PieChart, description: "Show data distribution" },
    { id: "trends", name: "Trend Analysis", icon: LineChart, description: "Identify patterns and trends" }
  ];

  const handleWidgetToggle = (widgetId: string) => {
    setFormData(prev => ({
      ...prev,
      widgets: prev.widgets.includes(widgetId)
        ? prev.widgets.filter(id => id !== widgetId)
        : [...prev.widgets, widgetId]
    }));
  };

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    toast({
      title: "File Selected",
      description: `${file.name} is ready for AI analysis`,
    });
  };

  const analyzeDataWithAI = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Read file content (handle both CSV and Excel)
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      const isExcel = fileExtension === 'xlsx' || fileExtension === 'xls';
      
      let fileContent: string;
      
      if (isExcel) {
        // Parse Excel file
        const arrayBuffer = await selectedFile.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        fileContent = XLSX.utils.sheet_to_csv(worksheet);
      } else {
        // Parse as plain text (CSV)
        fileContent = await selectedFile.text();
      }
      
      // Call the analyze-data edge function
      const { data, error } = await supabase.functions.invoke('analyze-data', {
        body: {
          fileContent,
          fileName: selectedFile.name,
          fileType: selectedFile.type || 'text/csv'
        }
      });

      if (error) throw error;

      if (data.success) {
        setAiGeneratedConfig(data.dashboardConfig);
        
        // Auto-populate form with AI suggestions
        setFormData({
          name: data.dashboardConfig.name,
          description: data.dashboardConfig.description,
          category: data.dashboardConfig.category,
          widgets: data.dashboardConfig.widgets.map((w: any) => w.id),
          layout: data.dashboardConfig.layout
        });

        toast({
          title: "AI Analysis Complete!",
          description: "Dashboard configuration generated from your data",
        });
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing data:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Dashboard name is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.widgets.length === 0) {
      toast({
        title: "Validation Error", 
        description: "Please select at least one widget",
        variant: "destructive",
      });
      return;
    }

    // Simulate dashboard creation
    toast({
      title: "Dashboard Created!",
      description: `"${formData.name}" has been created successfully`,
    });

    // Navigate back to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Create New Dashboard</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* AI Data Upload Section */}
            <Card className="border-2 border-dashed border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI-Powered Dashboard Creation
                </CardTitle>
                <CardDescription>
                  Upload your data file and let AI analyze it to create the perfect dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedFile ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Upload Your Data</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload CSV, Excel, or JSON files for AI analysis
                    </p>
                    <Button 
                      type="button"
                      variant="default"
                      className="bg-gradient-to-r from-primary to-data-secondary"
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
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                      <FileText className="w-8 h-8 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={analyzeDataWithAI}
                        disabled={isAnalyzing}
                        className="bg-gradient-to-r from-primary to-data-secondary flex-1"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing with AI...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analyze with AI
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Generated Insights */}
            {aiGeneratedConfig && (
              <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-data-secondary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Analysis Results
                  </CardTitle>
                  <CardDescription>
                    Based on your data, here's what AI recommends for your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Recommended Metrics</h4>
                      <div className="space-y-2">
                        {aiGeneratedConfig.metrics?.map((metric: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            {metric.title}: {metric.value}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Suggested Widgets</h4>
                      <div className="space-y-2">
                        {aiGeneratedConfig.widgets?.map((widget: any, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 bg-data-secondary rounded-full"></span>
                            {widget.title} ({widget.chartType})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Details</CardTitle>
                <CardDescription>
                  {aiGeneratedConfig ? 
                    "Review and customize the AI-generated dashboard configuration" :
                    "Set up the basic information for your new dashboard"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Dashboard Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Sales Overview, Marketing Analytics"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales & Revenue</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this dashboard will track and display..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Widget Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Widgets</CardTitle>
                <CardDescription>
                  Choose the widgets you want to include in your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableWidgets.map((widget) => (
                      <div
                        key={widget.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                          formData.widgets.includes(widget.id) 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border'
                        }`}
                        onClick={() => handleWidgetToggle(widget.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={formData.widgets.includes(widget.id)}
                            onCheckedChange={() => handleWidgetToggle(widget.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <widget.icon className="w-5 h-5 text-primary" />
                              <h3 className="font-medium">{widget.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {widget.description}
                            </p>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Layout Options */}
            <Card>
              <CardHeader>
                <CardTitle>Layout Style</CardTitle>
                <CardDescription>
                  Choose how your widgets will be arranged
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                      formData.layout === 'grid' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, layout: 'grid' }))}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-hero rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <div className="grid grid-cols-2 gap-1">
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                        </div>
                      </div>
                      <h3 className="font-medium">Grid Layout</h3>
                      <p className="text-sm text-muted-foreground">Equal-sized widgets in a grid</p>
                    </div>
                  </div>
                  
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                      formData.layout === 'masonry' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, layout: 'masonry' }))}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-hero rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <div className="grid grid-cols-2 gap-1">
                          <div className="w-2 h-3 bg-white rounded-sm"></div>
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                          <div className="w-2 h-3 bg-white rounded-sm"></div>
                        </div>
                      </div>
                      <h3 className="font-medium">Masonry Layout</h3>
                      <p className="text-sm text-muted-foreground">Dynamic height widgets</p>
                    </div>
                  </div>
                  
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                      formData.layout === 'single' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, layout: 'single' }))}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-hero rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <div className="w-8 h-3 bg-white rounded-sm"></div>
                      </div>
                      <h3 className="font-medium">Single Column</h3>
                      <p className="text-sm text-muted-foreground">Stacked full-width widgets</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
              {aiGeneratedConfig && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(`/dashboard/preview`, { 
                    state: { dashboardConfig: aiGeneratedConfig }
                  })}
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Preview AI Dashboard
                </Button>
              )}
              <Button type="submit" className="bg-gradient-to-r from-primary to-data-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Create Dashboard
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDashboard;