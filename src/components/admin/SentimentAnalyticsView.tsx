
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Smile, Meh, Frown, AlertCircle } from "lucide-react";
import { getFlaggedSentimentLog } from "@/services/sentimentAnalysisService";
import SentimentIndicator from "../chat/SentimentIndicator";

export function SentimentAnalyticsView() {
  const [flaggedMessages, setFlaggedMessages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("recent");
  
  useEffect(() => {
    // Get flagged messages log
    const log = getFlaggedSentimentLog();
    setFlaggedMessages(log);
  }, []);
  
  const sentimentCounts = {
    negative: flaggedMessages.filter(m => m.result.sentiment === 'negative').length,
    neutral: flaggedMessages.filter(m => m.result.sentiment === 'neutral').length,
    positive: flaggedMessages.filter(m => m.result.sentiment === 'positive').length,
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Smile className="h-4 w-4 text-green-500" />
              Positive Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentimentCounts.positive}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Meh className="h-4 w-4 text-amber-500" />
              Neutral Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentimentCounts.neutral}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Frown className="h-4 w-4 text-red-500" />
              Negative Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentimentCounts.negative}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="recent">Recent Messages</TabsTrigger>
              <TabsTrigger value="negative">Negative Only</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent">
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {flaggedMessages.length > 0 ? (
                  flaggedMessages.map((item, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{item.assistantType || 'Unknown Assistant'}</div>
                        <SentimentIndicator 
                          sentiment={item.result.sentiment} 
                          score={item.result.score} 
                          confidence={item.result.confidence}
                          showDetails={true}
                        />
                      </div>
                      <p className="text-sm bg-gray-50 p-2 rounded mb-2">{item.message}</p>
                      <div className="text-xs text-muted-foreground">
                        {item.timestamp.toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No flagged messages to display
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="negative">
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {flaggedMessages.filter(m => m.result.sentiment === 'negative').length > 0 ? (
                  flaggedMessages
                    .filter(m => m.result.sentiment === 'negative')
                    .map((item, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">{item.assistantType || 'Unknown Assistant'}</div>
                          <SentimentIndicator 
                            sentiment={item.result.sentiment} 
                            score={item.result.score} 
                            confidence={item.result.confidence}
                            showDetails={true}
                          />
                        </div>
                        <p className="text-sm bg-gray-50 p-2 rounded mb-2">{item.message}</p>
                        <div className="text-xs text-muted-foreground">
                          {item.timestamp.toLocaleString()}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No negative messages to display
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
