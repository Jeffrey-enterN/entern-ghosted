import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getExtensionInfo } from "@/lib/extensionApi";

type Settings = {
  autoDetectJobs: boolean;
  showOverlays: boolean;
  anonymousReporting: boolean;
  notificationsEnabled: boolean;
};

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    autoDetectJobs: true,
    showOverlays: true,
    anonymousReporting: true,
    notificationsEnabled: false,
  });
  const [extensionId, setExtensionId] = useState<string>("Unknown");
  const { toast } = useToast();

  useEffect(() => {
    // In a real extension, we would load actual settings from storage
    const loadSettings = async () => {
      try {
        // Get saved settings
        const savedSettings = localStorage.getItem("ghosted_settings");
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
        
        // Get extension info
        const info = await getExtensionInfo();
        if (info.reporterId) {
          setExtensionId(info.reporterId);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    
    loadSettings();
  }, []);

  const handleSaveSettings = () => {
    try {
      localStorage.setItem("ghosted_settings", JSON.stringify(settings));
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleSetting = (setting: keyof Settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Extension Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-detect">Auto-detect job listings</Label>
              <p className="text-xs text-gray-500">Automatically scan pages for job listings</p>
            </div>
            <Switch 
              id="auto-detect" 
              checked={settings.autoDetectJobs} 
              onCheckedChange={() => handleToggleSetting('autoDetectJobs')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-overlays">Show rating overlays</Label>
              <p className="text-xs text-gray-500">Display ghosting ratings on job boards</p>
            </div>
            <Switch 
              id="show-overlays" 
              checked={settings.showOverlays} 
              onCheckedChange={() => handleToggleSetting('showOverlays')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="anonymous">Anonymous reporting</Label>
              <p className="text-xs text-gray-500">Submit reports anonymously by default</p>
            </div>
            <Switch 
              id="anonymous" 
              checked={settings.anonymousReporting} 
              onCheckedChange={() => handleToggleSetting('anonymousReporting')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Notifications</Label>
              <p className="text-xs text-gray-500">Receive updates about reported companies</p>
            </div>
            <Switch 
              id="notifications" 
              checked={settings.notificationsEnabled} 
              onCheckedChange={() => handleToggleSetting('notificationsEnabled')}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Extension ID:</span>
              <span className="font-mono">{extensionId.substring(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Version:</span>
              <span>1.0.0</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Your privacy is important to us. We only collect information about ghosting 
            incidents that you explicitly report. Your identity is never shared with 
            employers or other users.
          </p>
          <Button variant="outline" size="sm" className="w-full text-red-600">
            Delete All My Data
          </Button>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>Save Settings</Button>
      </div>
    </div>
  );
}
