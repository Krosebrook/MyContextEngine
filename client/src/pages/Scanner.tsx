import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { HardDrive, Loader2, FolderOpen, FileText, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { withRetry } from "@/lib/retryLogic";

interface ScannedFile {
  path: string;
  name: string;
  size: number;
  modified: string;
}

export default function Scanner() {
  const [scanPath, setScanPath] = useState("C:/");
  const [scanDepth, setScanDepth] = useState(3);
  const [scannedFiles, setScannedFiles] = useState<ScannedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const scanMutation = useMutation({
    mutationFn: withRetry(
      async ({ path, depth }: { path: string; depth: number }) => {
        const response = await apiRequest("POST", "/api/scanner/scan", { path, depth });
        return response.json();
      },
      { maxRetries: 3, baseDelay: 2000, maxDelay: 60000 }
    ),
    onSuccess: (data: any) => {
      setScannedFiles(data.files || []);
      setSelectedFiles(new Set());
      toast({
        title: "Scan complete",
        description: `Found ${data.files.length} files`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Scan failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: withRetry(
      async (files: string[]) => {
        const response = await apiRequest("POST", "/api/scanner/import", { files });
        return response.json();
      },
      { maxRetries: 3, baseDelay: 2000, maxDelay: 60000 }
    ),
    onSuccess: (data: any) => {
      toast({
        title: "Import successful",
        description: `Imported ${data.imported} files for processing`,
      });
      setScannedFiles([]);
      setSelectedFiles(new Set());
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleFile = (path: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === scannedFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(scannedFiles.map(f => f.path)));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-medium">Local Drive Scanner</h1>
        <p className="text-muted-foreground mt-1">
          Scan local directories (C:/, D:/) and import files for AI organization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Directory Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter directory path (e.g., C:/, D:/Documents)"
              value={scanPath}
              onChange={(e) => setScanPath(e.target.value)}
              data-testid="input-scan-path"
            />
            <Button
              onClick={() => scanMutation.mutate({ path: scanPath, depth: scanDepth })}
              disabled={scanMutation.isPending || !scanPath}
              data-testid="button-start-scan"
            >
              {scanMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Scanning...
                </>
              ) : (
                <>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Scan Directory
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Scan Depth</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={scanDepth}
                  onChange={(e) => setScanDepth(parseInt(e.target.value))}
                  className="flex-1"
                  data-testid="slider-scan-depth"
                />
                <Badge variant="outline" className="w-16 justify-center" data-testid="badge-depth-value">
                  {scanDepth} level{scanDepth !== 1 ? 's' : ''}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                How many subdirectory levels to scan (1-5)
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScanPath("C:/")}
                data-testid="button-preset-c"
              >
                C: Drive
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScanPath("D:/")}
                data-testid="button-preset-d"
              >
                D: Drive
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScanPath(process.env.HOME || "/home")}
                data-testid="button-preset-home"
              >
                Home Directory
              </Button>
            </div>
          </div>

          {scanMutation.isPending && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </CardContent>
      </Card>

      {scannedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Scanned Files ({selectedFiles.size}/{scannedFiles.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  data-testid="button-select-all"
                >
                  {selectedFiles.size === scannedFiles.length ? "Deselect All" : "Select All"}
                </Button>
                <Button
                  onClick={() => importMutation.mutate(Array.from(selectedFiles))}
                  disabled={selectedFiles.size === 0 || importMutation.isPending}
                  data-testid="button-import-selected"
                >
                  {importMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Import {selectedFiles.size} Files
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {scannedFiles.map((file) => (
                <div
                  key={file.path}
                  className="flex items-center gap-3 p-3 rounded-md border hover-elevate"
                  data-testid={`scanned-file-${file.name}`}
                >
                  <Checkbox
                    checked={selectedFiles.has(file.path)}
                    onCheckedChange={() => handleToggleFile(file.path)}
                    data-testid={`checkbox-file-${file.name}`}
                  />
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{file.path}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {formatFileSize(file.size)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(file.modified).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
