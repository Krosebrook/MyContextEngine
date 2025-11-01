import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Save, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface TenantSettings {
  defaultAiProvider: "gemini" | "claude" | "openai";
  defaultModel: string;
  autoTagging: boolean;
  maxFileSize: number;
}

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<TenantSettings>({
    defaultAiProvider: "gemini",
    defaultModel: "gemini-2.0-flash",
    autoTagging: true,
    maxFileSize: 100,
  });

  const aiProviders = [
    { value: "gemini", label: "Google Gemini", models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"] },
    { value: "claude", label: "Anthropic Claude", models: ["claude-3-7-sonnet", "claude-3-7-haiku", "claude-3-opus"] },
    { value: "openai", label: "OpenAI", models: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo"] },
  ];

  const currentProvider = aiProviders.find(p => p.value === settings.defaultAiProvider);

  const saveMutation = useMutation({
    mutationFn: async (newSettings: TenantSettings) => {
      const response = await apiRequest("POST", "/api/settings", newSettings);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProviderChange = (provider: string) => {
    const providerData = aiProviders.find(p => p.value === provider);
    setSettings({
      ...settings,
      defaultAiProvider: provider as any,
      defaultModel: providerData?.models[0] || "",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-medium">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your AI preferences and system settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Provider Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-provider">Default AI Provider</Label>
            <Select
              value={settings.defaultAiProvider}
              onValueChange={handleProviderChange}
            >
              <SelectTrigger id="ai-provider" data-testid="select-ai-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aiProviders.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose which AI service to use for analyzing your files
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-model">Default Model</Label>
            <Select
              value={settings.defaultModel}
              onValueChange={(model) => setSettings({ ...settings, defaultModel: model })}
            >
              <SelectTrigger id="ai-model" data-testid="select-ai-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currentProvider?.models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the specific model version to use
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            File Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="max-file-size">Maximum File Size (MB)</Label>
            <Input
              id="max-file-size"
              type="number"
              min="1"
              max="500"
              value={settings.maxFileSize}
              onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) || 100 })}
              data-testid="input-max-file-size"
            />
            <p className="text-xs text-muted-foreground">
              Maximum allowed file size for uploads (1-500 MB)
            </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-md border">
            <div className="space-y-0.5">
              <Label>Automatic Tagging</Label>
              <p className="text-xs text-muted-foreground">
                Automatically generate tags for uploaded files using AI
              </p>
            </div>
            <Badge variant={settings.autoTagging ? "default" : "outline"}>
              {settings.autoTagging ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => saveMutation.mutate(settings)}
          disabled={saveMutation.isPending}
          data-testid="button-save-settings"
        >
          {saveMutation.isPending ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
