import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, FileText, Loader2 } from "lucide-react";
import { useState } from "react";

interface KbEntry {
  id: string;
  fileId: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  metadata: any;
  createdAt: string;
}

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: entries = [], isLoading } = useQuery<KbEntry[]>({
    queryKey: ["/api/kb", categoryFilter !== "all" ? `?category=${categoryFilter}` : ""],
  });

  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.title.toLowerCase().includes(query) ||
      entry.summary.toLowerCase().includes(query) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const categories = ["Code", "Documentation", "Data", "Image", "Document", "Archive", "Other"];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Code: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
      Documentation: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
      Data: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
      Image: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300",
      Document: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
      Archive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      Other: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
    };
    return colors[category] || colors.Other;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-medium">Knowledge Base</h1>
        <p className="text-muted-foreground mt-1">
          AI-organized files with automatic categorization and summaries
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-kb"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48" data-testid="select-category-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No entries found</p>
              <p className="text-sm mt-1">
                Upload some files to build your knowledge base
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map((entry) => (
            <Card
              key={entry.id}
              className="hover-elevate cursor-pointer"
              data-testid={`kb-entry-${entry.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-base line-clamp-2">{entry.title}</CardTitle>
                  <Badge variant="outline" className={getCategoryColor(entry.category)}>
                    {entry.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {entry.summary}
                </p>
                
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {entry.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{entry.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t text-xs text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {filteredEntries.length} of {entries.length} entries</span>
      </div>
    </div>
  );
}
