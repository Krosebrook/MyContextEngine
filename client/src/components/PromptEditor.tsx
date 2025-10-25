import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, X } from "lucide-react";
import { useState } from "react";

interface Variable {
  key: string;
  defaultValue: string;
}

interface PromptEditorProps {
  initialBody?: string;
  initialVariables?: Variable[];
  onSave?: (body: string, variables: Variable[]) => void;
}

export function PromptEditor({ 
  initialBody = "", 
  initialVariables = [],
  onSave 
}: PromptEditorProps) {
  const [body, setBody] = useState(initialBody);
  const [variables, setVariables] = useState<Variable[]>(initialVariables);
  const [newVarKey, setNewVarKey] = useState("");
  const [newVarValue, setNewVarValue] = useState("");

  const addVariable = () => {
    if (newVarKey.trim()) {
      setVariables([...variables, { key: newVarKey, defaultValue: newVarValue }]);
      setNewVarKey("");
      setNewVarValue("");
    }
  };

  const removeVariable = (key: string) => {
    setVariables(variables.filter(v => v.key !== key));
  };

  const insertVariable = (key: string) => {
    setBody(body + `{{${key}}}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prompt Body</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter your prompt template here... Use {{variable}} syntax for dynamic values."
            className="min-h-[200px] font-mono text-sm"
            data-testid="input-prompt-body"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Variables</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Variable name"
              value={newVarKey}
              onChange={(e) => setNewVarKey(e.target.value)}
              className="w-32"
              data-testid="input-variable-name"
            />
            <Input
              placeholder="Default value"
              value={newVarValue}
              onChange={(e) => setNewVarValue(e.target.value)}
              className="w-40"
              data-testid="input-variable-value"
            />
            <Button 
              size="sm" 
              onClick={addVariable}
              data-testid="button-add-variable"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {variables.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No variables defined. Add variables to make your prompts dynamic.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {variables.map((variable) => (
                <Badge
                  key={variable.key}
                  variant="secondary"
                  className="hover-elevate cursor-pointer pr-1"
                  onClick={() => insertVariable(variable.key)}
                  data-testid={`badge-variable-${variable.key}`}
                >
                  <span className="font-mono">{variable.key}</span>
                  {variable.defaultValue && (
                    <span className="text-xs text-muted-foreground ml-1">
                      = {variable.defaultValue}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVariable(variable.key);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => {
            onSave?.(body, variables);
            console.log('Saving prompt:', { body, variables });
          }}
          data-testid="button-save-prompt"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Version
        </Button>
      </div>
    </div>
  );
}
