import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SiOpenai, SiGoogle, SiAnthropic } from "react-icons/si";
import { useState } from "react";

interface ProviderConfig {
  provider: string;
  model: string;
}

interface ProviderSelectorProps {
  selectedProviders?: ProviderConfig[];
  onChange?: (providers: ProviderConfig[]) => void;
}

const providers = [
  {
    id: "gemini",
    name: "Google Gemini",
    icon: SiGoogle,
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    color: "text-blue-600",
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    icon: SiAnthropic,
    models: ["claude-3.7-sonnet", "claude-3.7-haiku", "claude-3-opus"],
    color: "text-orange-600",
  },
  {
    id: "openai",
    name: "OpenAI ChatGPT",
    icon: SiOpenai,
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
    color: "text-green-600",
  },
];

export function ProviderSelector({ selectedProviders = [], onChange }: ProviderSelectorProps) {
  const [configs, setConfigs] = useState<ProviderConfig[]>(
    selectedProviders.length > 0 
      ? selectedProviders 
      : [{ provider: "gemini", model: "gemini-2.0-flash" }]
  );

  const updateConfig = (index: number, field: "provider" | "model", value: string) => {
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setConfigs(newConfigs);
    onChange?.(newConfigs);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {providers.map((provider, idx) => {
        const Icon = provider.icon;
        const config = configs[idx] || { provider: provider.id, model: provider.models[0] };
        
        return (
          <Card key={provider.id} data-testid={`card-provider-${provider.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${provider.color}`} />
                  <CardTitle className="text-base">{provider.name}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor={`model-${provider.id}`} className="text-sm">
                  Model
                </Label>
                <Select
                  value={config.model}
                  onValueChange={(value) => updateConfig(idx, "model", value)}
                >
                  <SelectTrigger 
                    id={`model-${provider.id}`}
                    data-testid={`select-model-${provider.id}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {provider.models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Est. cost/1K tokens</span>
                  <span className="font-medium">$0.002</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
