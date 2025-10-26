import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Sparkles, Search, Zap, Shield, Clock } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            AI-Powered Knowledge Management
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your files into an intelligent, searchable knowledge base with the power of AI
          </p>
          <Button 
            size="lg" 
            onClick={handleLogin}
            className="text-lg px-8 py-6"
            data-testid="button-login"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 hover-elevate">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">AI Analysis</h3>
            </div>
            <p className="text-muted-foreground">
              Automatically categorize, tag, and summarize your documents using advanced AI models
            </p>
          </Card>

          <Card className="p-6 hover-elevate">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Smart Search</h3>
            </div>
            <p className="text-muted-foreground">
              Find exactly what you need with intelligent search across all your documents
            </p>
          </Card>

          <Card className="p-6 hover-elevate">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Lightning Fast</h3>
            </div>
            <p className="text-muted-foreground">
              Upload and analyze files in seconds with our optimized processing pipeline
            </p>
          </Card>

          <Card className="p-6 hover-elevate">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Multi-Format Support</h3>
            </div>
            <p className="text-muted-foreground">
              Works with PDFs, images, documents, code files, and more
            </p>
          </Card>

          <Card className="p-6 hover-elevate">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Secure & Private</h3>
            </div>
            <p className="text-muted-foreground">
              Your data is encrypted and isolated with multi-tenant security
            </p>
          </Card>

          <Card className="p-6 hover-elevate">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Real-time Updates</h3>
            </div>
            <p className="text-muted-foreground">
              Watch your knowledge base grow in real-time as files are processed
            </p>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1</div>
              <h3 className="font-semibold mb-2">Upload Your Files</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop your documents or scan local folders
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">2</div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our AI extracts, categorizes, and tags your content
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">3</div>
              <h3 className="font-semibold mb-2">Find Anything</h3>
              <p className="text-sm text-muted-foreground">
                Search and discover your organized knowledge base
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Button 
            size="lg" 
            onClick={handleLogin}
            className="text-lg px-8 py-6"
            data-testid="button-login-bottom"
          >
            Start Organizing Now
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Secure authentication powered by Replit
          </p>
        </div>
      </div>
    </div>
  );
}
