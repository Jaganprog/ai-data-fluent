import { Button } from "@/components/ui/enhanced-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/enhanced-card";
import { ArrowRight, BarChart3, Brain, Download, MessageSquare, Upload, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-data.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              DataChat Insights
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button variant="hero" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Turn Your <span className="bg-gradient-hero bg-clip-text text-transparent">Data</span> Into
                  <br />
                  <span className="bg-gradient-hero bg-clip-text text-transparent">Insights</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Upload CSV files, chat with AI to discover insights, and create beautiful dashboards—all without SQL or complex tools.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button variant="hero" size="hero" className="group">
                    Start Analyzing Data
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button variant="gradient" size="lg">
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>No coding required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Instant insights</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Export ready</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero opacity-20 rounded-2xl blur-3xl"></div>
              <img 
                src={heroImage} 
                alt="Data Analytics Dashboard Preview" 
                className="relative rounded-2xl shadow-glow w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-data">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need for Data Analysis</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From upload to insight to dashboard—streamlined for business users who need results fast.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card variant="elevated" className="group">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Easy CSV Upload</CardTitle>
                <CardDescription>
                  Drag & drop your CSV files and we'll handle the parsing and analysis automatically.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card variant="elevated" className="group">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <CardTitle>AI-Powered Chat</CardTitle>
                <CardDescription>
                  Ask questions in plain English. Get insights, trends, and summaries instantly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card variant="elevated" className="group">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Smart Insights</CardTitle>
                <CardDescription>
                  Automatic detection of patterns, outliers, and trends in your data.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card variant="elevated" className="group">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Visual Dashboards</CardTitle>
                <CardDescription>
                  Create beautiful, interactive charts and customize your perfect dashboard.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card variant="elevated" className="group">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Export & Share</CardTitle>
                <CardDescription>
                  Download dashboards as PDF or PNG. Perfect for reports and presentations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card variant="elevated" className="group">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Team Ready</CardTitle>
                <CardDescription>
                  Built for business teams. Secure, reliable, and scalable for any organization.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Card variant="glow" className="max-w-4xl mx-auto">
            <CardContent className="py-16 px-8">
              <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Data?</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of business professionals who trust DataChat Insights for their data analysis needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button variant="hero" size="hero">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="gradient" size="lg">
                  Schedule Demo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                DataChat Insights
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 DataChat Insights. Built with ❤️ for data-driven teams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;