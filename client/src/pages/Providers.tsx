import { ProviderSelector } from "@/components/ProviderSelector";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { DollarSign, Zap, TrendingUp } from "lucide-react";

export default function Providers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-medium">Providers</h1>
        <p className="text-muted-foreground mt-1">
          Configure and monitor AI model providers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Requests"
          value="12.4K"
          icon={Zap}
          subtitle="This month"
        />
        <MetricCard
          title="Avg Response Time"
          value="680ms"
          icon={TrendingUp}
          trend={{ value: -8, isPositive: true }}
        />
        <MetricCard
          title="API Costs"
          value="$89.42"
          icon={DollarSign}
          subtitle="This month"
        />
      </div>

      <div>
        <h2 className="text-xl font-medium mb-4">Active Providers</h2>
        <ProviderSelector
          onChange={(providers) => console.log('Provider config:', providers)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Token Budget Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Google Gemini</span>
                <span className="font-medium">4.2M / 10M tokens</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: "42%" }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Anthropic Claude</span>
                <span className="font-medium">2.8M / 5M tokens</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-orange-600" style={{ width: "56%" }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">OpenAI ChatGPT</span>
                <span className="font-medium">1.5M / 8M tokens</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: "19%" }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
