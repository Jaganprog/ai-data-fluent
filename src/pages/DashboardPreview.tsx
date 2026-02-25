import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AIGeneratedDashboard } from "@/components/AIGeneratedDashboard";
import { ArrowLeft, Save, Edit3, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DashboardPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const dashboardConfig = location.state?.dashboardConfig;

  if (!dashboardConfig) {
    navigate("/dashboard/create");
    return null;
  }

  const handleSaveDashboard = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save dashboards",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      const { error } = await supabase.from("dashboards" as any).insert({
        user_id: user.id,
        name: dashboardConfig.name,
        description: dashboardConfig.description || "",
        category: dashboardConfig.category || "custom",
        config: dashboardConfig,
      } as any);

      if (error) throw error;

      toast({
        title: "Dashboard Saved!",
        description: `"${dashboardConfig.name}" has been saved successfully`,
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error saving dashboard:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Could not save dashboard",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
                disabled={saving}
                className="bg-gradient-to-r from-primary to-data-secondary"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? "Saving..." : "Save Dashboard"}
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