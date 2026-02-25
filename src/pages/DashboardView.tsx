import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AIGeneratedDashboard } from "@/components/AIGeneratedDashboard";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DashboardView = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dashboardConfig, setDashboardConfig] = useState<any>(location.state?.dashboardConfig || null);
  const [loading, setLoading] = useState(!dashboardConfig);
  const [dashboardName, setDashboardName] = useState("");

  useEffect(() => {
    if (!dashboardConfig && id) {
      fetchDashboard();
    }
  }, [id]);

  const fetchDashboard = async () => {
    try {
      const { data, error } = await (supabase.from("dashboards" as any) as any)
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setDashboardConfig(data.config);
      setDashboardName(data.name);
    } catch (error) {
      toast({
        title: "Dashboard Not Found",
        description: "Could not load the dashboard",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await (supabase.from("dashboards" as any) as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Dashboard Deleted" });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dashboardConfig) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">{dashboardConfig.name || dashboardName}</h1>
            </div>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <AIGeneratedDashboard config={dashboardConfig} />
      </div>
    </div>
  );
};

export default DashboardView;