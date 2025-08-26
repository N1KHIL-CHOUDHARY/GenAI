import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle, AlertCircle, FileText } from "lucide-react";

interface RiskClause {
  text: string;
  type: 'high' | 'medium' | 'low';
  explanation: string;
  position: number;
}

interface SummaryViewProps {
  summary: string;
  riskClauses: RiskClause[];
  fileName: string;
  isLoading?: boolean;
}

const SummaryView = ({ summary, riskClauses, fileName, isLoading = false }: SummaryViewProps) => {
  const [selectedRisk, setSelectedRisk] = useState<RiskClause | null>(null);

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-risk-high" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-risk-medium" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-risk-low" />;
      default:
        return null;
    }
  };

  const getRiskBadgeVariant = (type: string) => {
    switch (type) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const highlightRisks = (text: string) => {
    let highlightedText = text;
    
    riskClauses.forEach((risk, index) => {
      const riskText = risk.text;
      if (highlightedText.includes(riskText)) {
        const highlightClass = `risk-${risk.type}`;
        highlightedText = highlightedText.replace(
          riskText,
          `<span class="px-1 py-0.5 rounded cursor-pointer transition-all hover:shadow-sm ${
            risk.type === 'high' ? 'bg-risk-high-bg text-risk-high border border-risk-high/20' :
            risk.type === 'medium' ? 'bg-risk-medium-bg text-risk-medium border border-risk-medium/20' :
            'bg-risk-low-bg text-risk-low border border-risk-low/20'
          }" data-risk-index="${index}">${riskText}</span>`
        );
      }
    });
    
    return highlightedText;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              <CardTitle>Analyzing Document...</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Document Info */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Document Analysis</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">{fileName}</p>
        </CardHeader>
      </Card>

      {/* Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>AI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div 
              className="prose prose-sm max-w-none text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightRisks(summary) }}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                const riskIndex = target.getAttribute('data-risk-index');
                if (riskIndex !== null) {
                  setSelectedRisk(riskClauses[parseInt(riskIndex)]);
                }
              }}
            />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Risk Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {riskClauses.map((risk, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                      risk.type === 'high' ? 'bg-risk-high-bg border-risk-high/20' :
                      risk.type === 'medium' ? 'bg-risk-medium-bg border-risk-medium/20' :
                      'bg-risk-low-bg border-risk-low/20'
                    } ${selectedRisk === risk ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedRisk(risk)}
                  >
                    <div className="flex items-start space-x-2">
                      {getRiskIcon(risk.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={getRiskBadgeVariant(risk.type) as any}>
                            {risk.type.toUpperCase()} RISK
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-1">{risk.text}</p>
                        <p className="text-xs text-muted-foreground">{risk.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Risk Details */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Risk Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRisk ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {getRiskIcon(selectedRisk.type)}
                  <Badge variant={getRiskBadgeVariant(selectedRisk.type) as any}>
                    {selectedRisk.type.toUpperCase()} RISK
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Clause Text:</h4>
                  <p className="text-sm bg-muted p-3 rounded border">{selectedRisk.text}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Risk Analysis:</h4>
                  <p className="text-sm text-muted-foreground">{selectedRisk.explanation}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Click on a risk clause to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SummaryView;