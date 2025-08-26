import { useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { ThemeToggle } from '@/components/ThemeToggle';
import UploadPage from "@/components/UploadPage";
import SummaryView from "@/components/SummaryView";
import Chatbot from "@/components/Chatbot";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Settings, History, PieChart, 
  File, FilePlus, FileCheck, AlertTriangle,
  Download, Share2, Trash2, MoreVertical,
  BarChart3, FileBarChart
} from "lucide-react";

interface DocumentData {
  summary: string;
  riskClauses: Array<{
    text: string;
    type: 'high' | 'medium' | 'low';
    explanation: string;
    position: number;
  }>;
  fileName: string;
}

interface Stats {
  totalDocuments: number;
  riskBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  recentDocuments: Array<{
    name: string;
    date: string;
    riskLevel: 'high' | 'medium' | 'low';
  }>;
}

export default function Dashboard() {
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const uploadSectionRef = useRef<HTMLDivElement>(null);
  
  const scrollToUpload = useCallback(() => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  // Mock statistics
  const [stats] = useState<Stats>({
    totalDocuments: 15,
    riskBreakdown: {
      high: 3,
      medium: 7,
      low: 5
    },
    recentDocuments: [
      { name: "Contract_2025_Q3.pdf", date: "2025-08-25", riskLevel: "high" },
      { name: "Agreement_v2.1.docx", date: "2025-08-24", riskLevel: "low" },
      { name: "Terms_of_Service.pdf", date: "2025-08-23", riskLevel: "medium" },
    ]
  });

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Mock API call - replace with actual backend endpoint
      const response = await new Promise<DocumentData>((resolve) => {
        setTimeout(() => {
          resolve({
            summary: `This is a comprehensive analysis of ${file.name}. The document contains several important clauses and provisions that require careful consideration. Key findings include contractual obligations, liability limitations, and termination conditions. The analysis has identified potential risks in areas such as data privacy, intellectual property rights, and financial obligations. Notable sections include force majeure clauses, governing law provisions, and dispute resolution mechanisms. Overall assessment indicates moderate risk level with specific areas requiring attention and potential negotiation.`,
            riskClauses: [
              {
                text: "unlimited liability for data breaches",
                type: 'high',
                explanation: "This clause exposes the organization to potentially unlimited financial liability in case of data security incidents, which could result in significant financial losses.",
                position: 1
              },
              {
                text: "automatic renewal without notice period",
                type: 'medium',
                explanation: "The contract automatically renews without adequate notice period, potentially binding the organization to unwanted terms and limiting flexibility.",
                position: 2
              },
              {
                text: "intellectual property ownership clearly defined",
                type: 'low',
                explanation: "This clause provides clear definition of intellectual property ownership, which is beneficial for protecting organizational assets and avoiding disputes.",
                position: 3
              },
              {
                text: "30-day termination clause without cause",
                type: 'medium',
                explanation: "While providing flexibility, the short termination period may not allow sufficient time for transition planning and could impact business continuity.",
                position: 4
              },
              {
                text: "compliance with industry standards required",
                type: 'low',
                explanation: "This requirement ensures adherence to best practices and regulatory compliance, which is generally favorable for risk management.",
                position: 5
              }
            ],
            fileName: file.name
          });
        }, 2000);
      });

      setDocumentData(response);
      toast({
        title: "Analysis Complete",
        description: "Your document has been successfully analyzed!",
      });

    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleChatMessage = async (message: string): Promise<string> => {
    setIsChatLoading(true);
    
    try {
      // Mock AI response - replace with actual backend endpoint
      const response = await new Promise<string>((resolve) => {
        setTimeout(() => {
          const responses = [
            `Based on your document analysis, I can help clarify that point. The "${message}" relates to the risk assessment we performed. Would you like me to explain the specific implications?`,
            `That's a great question about your document. The clause you're asking about has been flagged in our analysis. Here's what you should know: this provision could impact your organization's liability exposure.`,
            `I can provide more context on that section. According to our analysis, this clause falls under medium risk category. The key concern is the potential for automatic obligations without proper review periods.`,
            `Your question touches on an important aspect of the contract. This particular provision was identified as requiring attention due to its implications for data governance and compliance requirements.`
          ];
          resolve(responses[Math.floor(Math.random() * responses.length)]);
        }, 1500);
      });

      return response;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
     
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container min-h-screen py-8 space-y-12"
      >
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Document Analysis</h1>
            <p className="text-lg text-muted-foreground">
              AI-powered legal document analysis and risk assessment
            </p>
          </div>
         
         <div   className="space-x-2">
            
             <Button size="lg" className="gap-2 md:self-end" onClick={scrollToUpload}>
            <FilePlus className="h-5 w-5" />
            New Analysis
          </Button>

          <ThemeToggle />
         </div>
         
            
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid gap-6 md:grid-cols-3"
        >
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Document Analytics</CardTitle>
              <FileBarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              <div className="flex items-center justify-between mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">High Risk</span>
                </div>
                <span className="font-medium">{stats.riskBreakdown.high}</span>
              </div>
              <Progress value={stats.riskBreakdown.high / stats.totalDocuments * 100} className="h-1 mt-2 bg-red-100" />
              
              <div className="flex items-center justify-between mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-muted-foreground">Medium Risk</span>
                </div>
                <span className="font-medium">{stats.riskBreakdown.medium}</span>
              </div>
              <Progress value={stats.riskBreakdown.medium / stats.totalDocuments * 100} className="h-1 mt-2 bg-yellow-100" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentDocuments.slice(0, 3).map((doc, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.date}</p>
                    </div>
                    <Badge 
                      variant={doc.riskLevel === 'high' ? 'destructive' : 
                             doc.riskLevel === 'medium' ? 'default' : 'secondary'}
                      className="ml-auto"
                    >
                      {doc.riskLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Risk Distribution</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((stats.riskBreakdown.low / stats.totalDocuments) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Low risk documents</p>
              
              <div className="mt-4 space-y-2">
                {Object.entries(stats.riskBreakdown).map(([level, count]) => (
                  <div key={level} className="flex items-center gap-2">
                    <div className={`w-full h-2 rounded-full overflow-hidden bg-muted`}>
                      <div 
                        className={`h-full ${
                          level === 'high' ? 'bg-red-500' : 
                          level === 'medium' ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${(count / stats.totalDocuments) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-12">{count} docs</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={documentData ? 'analysis' : 'upload'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {!documentData ? (
              <Card ref={uploadSectionRef}>
                <CardContent className="pt-6">
                  <UploadPage 
                    onFileUpload={handleFileUpload} 
                    isUploading={isUploading} 
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <SummaryView
                        summary={documentData.summary}
                        riskClauses={documentData.riskClauses}
                        fileName={documentData.fileName}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Document Actions</CardTitle>
                      <CardDescription>Manage your analyzed document</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4">
                        <Button variant="secondary" className="gap-2">
                          <Download className="h-4 w-4" />
                          Export Report
                        </Button>
                        <Button variant="secondary" className="gap-2">
                          <Share2 className="h-4 w-4" />
                          Share Analysis
                        </Button>
                        <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Assistant</CardTitle>
                        <CardDescription>Ask questions about your document</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Chatbot
                          onSendMessage={handleChatMessage}
                          isLoading={isChatLoading}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
  );
}
