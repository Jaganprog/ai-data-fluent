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
import { 
  ArrowLeft, 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Plus
} from "lucide-react";

const CreateDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Details</CardTitle>
                <CardDescription>
                  Set up the basic information for your new dashboard
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