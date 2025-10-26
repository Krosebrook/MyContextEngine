import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, File, Loader2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { FileProcessingProgress } from "@/components/FileProcessingProgress";

interface FileRecord {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: string;
  uploadedAt: string;
}

export default function Files() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: files = [], isLoading } = useQuery<FileRecord[]>({
    queryKey: ["/api/files"],
  });

  const [uploadQueue, setUploadQueue] = useState<{ file: File; status: 'pending' | 'uploading' | 'success' | 'error'; id: string }[]>([]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: (_, file) => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/kb"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setUploadQueue(prev => prev.map(item => 
        item.file === file ? { ...item, status: 'success' } : item
      ));
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} is being analyzed by AI. Check the Knowledge Base in ~10 seconds.`,
      });
    },
    onError: (error: any, file) => {
      setUploadQueue(prev => prev.map(item => 
        item.file === file ? { ...item, status: 'error' } : item
      ));
      toast({
        title: "Upload failed",
        description: `${file.name}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const newUploads = droppedFiles.map(file => ({
      file,
      status: 'pending' as const,
      id: Math.random().toString(36)
    }));
    setUploadQueue(prev => [...prev, ...newUploads]);
    
    droppedFiles.forEach((file) => {
      setUploadQueue(prev => prev.map(item => 
        item.file === file ? { ...item, status: 'uploading' } : item
      ));
      uploadMutation.mutate(file);
    });

    if (droppedFiles.length > 1) {
      toast({
        title: "Bulk upload started",
        description: `Processing ${droppedFiles.length} files`,
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const filesArray = Array.from(selectedFiles);
      const newUploads = filesArray.map(file => ({
        file,
        status: 'pending' as const,
        id: Math.random().toString(36)
      }));
      setUploadQueue(prev => [...prev, ...newUploads]);
      
      filesArray.forEach((file) => {
        setUploadQueue(prev => prev.map(item => 
          item.file === file ? { ...item, status: 'uploading' } : item
        ));
        uploadMutation.mutate(file);
      });

      if (filesArray.length > 1) {
        toast({
          title: "Bulk upload started",
          description: `Processing ${filesArray.length} files`,
        });
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getStatusIcon = (status: string) => {
    if (status === "uploaded") return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    if (status === "extracted") return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    if (status === "analyzed") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium">Files</h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage your files for AI analysis
          </p>
        </div>
      </div>

      {uploadQueue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload Queue ({uploadQueue.filter(u => u.status === 'success').length}/{uploadQueue.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadQueue.slice(0, 5).map((upload) => (
                <div key={upload.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate flex-1">{upload.file.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatFileSize(upload.file.size)}</span>
                    {upload.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                    {upload.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {upload.status === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                  </div>
                </div>
              ))}
              {uploadQueue.length > 5 && (
                <p className="text-xs text-muted-foreground">+{uploadQueue.length - 5} more files</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card
        className={`border-2 border-dashed cursor-pointer hover-elevate ${isDragging ? "border-primary bg-primary/5" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        data-testid="dropzone-upload"
      >
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">Drop files here to upload</p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse files
              </p>
            </div>
            <Badge variant="secondary">
              Supports: PDF, DOCX, TXT, Code, Images, ZIP, and more
            </Badge>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            data-testid="input-file-upload"
          />
        </CardContent>
      </Card>

      {uploadMutation.isPending && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">Uploading files...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Files */}
      {files.filter(f => f.status !== "analyzed").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Processing Files ({files.filter(f => f.status !== "analyzed").length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {files
              .filter(f => f.status !== "analyzed")
              .map((file) => (
                <FileProcessingProgress
                  key={file.id}
                  status={file.status as "uploaded" | "pending" | "extracted" | "analyzed"}
                  fileName={file.originalName}
                />
              ))}
          </CardContent>
        </Card>
      )}

      {/* All Files Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Files ({files.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No files uploaded yet. Drop some files above to get started!
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-md border hover-elevate"
                  data-testid={`file-item-${file.id}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs">
                      {file.mimeType.split("/")[1]}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(file.status)}
                      <span className="text-sm text-muted-foreground capitalize">
                        {file.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
