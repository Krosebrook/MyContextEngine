import { PromptEditor } from "@/components/PromptEditor";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Play } from "lucide-react";
import { useState } from "react";

export default function Prompts() {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const versions = [
    {
      id: "v1",
      version: "2.3",
      name: "Product Classifier v2.3",
      isActive: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      body: "Classify the following product into one of these categories: {{categories}}.\n\nProduct: {{product_name}}\nDescription: {{product_description}}\n\nProvide your classification and a brief explanation.",
      vars: [
        { key: "categories", defaultValue: "Electronics, Clothing, Food, Books" },
        { key: "product_name", defaultValue: "" },
        { key: "product_description", defaultValue: "" },
      ],
    },
    {
      id: "v2",
      version: "2.2",
      name: "Product Classifier v2.2",
      isActive: false,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      body: "You are a product classification expert. Classify: {{product_name}}",
      vars: [
        { key: "product_name", defaultValue: "" },
      ],
    },
    {
      id: "v3",
      version: "2.1",
      name: "Product Classifier v2.1",
      isActive: false,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      body: "Classify product: {{product_name}}",
      vars: [
        { key: "product_name", defaultValue: "" },
      ],
    },
  ];

  const currentVersion = versions.find(v => selectedVersion === v.id) || versions[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium">Prompts</h1>
          <p className="text-muted-foreground mt-1">
            Manage and version your AI prompts
          </p>
        </div>
        <Button data-testid="button-test-prompt">
          <Play className="h-4 w-4 mr-2" />
          Test Prompt
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Versions</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`p-3 rounded-md border cursor-pointer hover-elevate ${
                    currentVersion.id === version.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => setSelectedVersion(version.id)}
                  data-testid={`version-${version.version}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          v{version.version}
                        </span>
                        {version.isActive && (
                          <Badge variant="default" className="text-xs px-1 py-0">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{currentVersion.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Version {currentVersion.version} • Created{" "}
                      {new Date(currentVersion.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {currentVersion.isActive && (
                    <Badge variant="default">Active</Badge>
                  )}
                </div>
              </CardHeader>
            </Card>

            <PromptEditor
              initialBody={currentVersion.body}
              initialVariables={currentVersion.vars}
              onSave={(body, vars) => {
                console.log('Saving new version:', { body, vars });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
