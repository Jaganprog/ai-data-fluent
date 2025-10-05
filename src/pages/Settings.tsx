import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Download,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      marketing: true
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      cookies: true
    },
    appearance: {
      theme: theme,
      compactMode: false,
      animations: true
    },
    data: {
      autoSave: true,
      exportFormat: 'csv',
      retentionDays: 30
    }
  });

  const handleSave = () => {
    // Here you would typically save to a backend or localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data is being prepared for download...",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "This feature will be available soon.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified in your browser
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive product updates and tips
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.marketing}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, marketing: checked }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-2">
                  <Button
                    variant={settings.appearance.theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setTheme('light');
                      setSettings(prev => ({
                        ...prev,
                        appearance: { ...prev.appearance, theme: 'light' }
                      }));
                    }}
                  >
                    Light
                  </Button>
                  <Button
                    variant={settings.appearance.theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setTheme('dark');
                      setSettings(prev => ({
                        ...prev,
                        appearance: { ...prev.appearance, theme: 'dark' }
                      }));
                    }}
                  >
                    Dark
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use a more compact interface layout
                  </p>
                </div>
                <Switch 
                  checked={settings.appearance.compactMode}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, compactMode: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable smooth transitions and animations
                  </p>
                </div>
                <Switch 
                  checked={settings.appearance.animations}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, animations: checked }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Control how your data is stored and processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-save</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save your work
                  </p>
                </div>
                <Switch 
                  checked={settings.data.autoSave}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      data: { ...prev.data, autoSave: checked }
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exportFormat">Default Export Format</Label>
                <select 
                  id="exportFormat"
                  className="w-full p-2 border border-input rounded-md bg-background"
                  value={settings.data.exportFormat}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      data: { ...prev.data, exportFormat: e.target.value }
                    }))
                  }
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="retentionDays">Data Retention (Days)</Label>
                <Input 
                  id="retentionDays"
                  type="number"
                  value={settings.data.retentionDays}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      data: { ...prev.data, retentionDays: parseInt(e.target.value) }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Manage your privacy settings and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow anonymous usage data to improve the product
                  </p>
                </div>
                <Switch 
                  checked={settings.privacy.dataSharing}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, dataSharing: checked }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Help us understand how you use the application
                  </p>
                </div>
                <Switch 
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, analytics: checked }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Export & Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Data & Account</CardTitle>
              <CardDescription>
                Export your data or manage your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Export Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Download all your data in a portable format
                  </p>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-destructive">Delete Account</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-data-secondary">
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
