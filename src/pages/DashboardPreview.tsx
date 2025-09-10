import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AIGeneratedDashboard } from "@/components/AIGeneratedDashboard";
import { ArrowLeft, Save, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DashboardPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dashboardConfig = location.state?.dashboardConfig;

  if (!dashboardConfig) {
    navigate("/dashboard/create");
    return null;
  }

  const handleSaveDashboard = () => {
    toast({
      title: "Dashboard Saved!",
      description: `"${dashboardConfig.name}" has been saved successfully`,
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/dashboard/create")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Editor
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Dashboard Preview</h1>
                <p className="text-sm text-muted-foreground">AI-generated dashboard based on your data</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => navigate("/dashboard/create", { 
                  state: { dashboardConfig }
                })}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Customize
              </Button>
              <Button 
                onClick={handleSaveDashboard}
                className="bg-gradient-to-r from-primary to-data-secondary"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <AIGeneratedDashboard config={dashboardConfig} />
      </div>
    </div>
  );
};

export default DashboardPreview;