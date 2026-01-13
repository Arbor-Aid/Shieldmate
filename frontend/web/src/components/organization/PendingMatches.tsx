
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/hooks/useOrganization";
import { getOrganizationPendingMatches, markMatchAsContacted, OrganizationMatch } from "@/services/organizationMatchService";
import { createClientRecord } from "@/services/referralService";
import { UserCheck, Mail, Phone, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { QuestionnaireData } from "@/types/questionnaire";

export function PendingMatches() {
  const [matches, setMatches] = useState<OrganizationMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  const { organization } = useOrganization();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMatches = async () => {
      if (!organization?.id) return;
      
      setLoading(true);
      try {
        const pendingMatches = await getOrganizationPendingMatches(organization.id);
        setMatches(pendingMatches);
      } catch (error) {
        console.error("Error fetching pending matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    
    // In a real application, you would set up a real-time listener here
    const interval = setInterval(fetchMatches, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [organization?.id]);

  const handleMarkAsContacted = async (match: OrganizationMatch) => {
    if (!organization?.id) return;
    
    setProcessing(prev => ({ ...prev, [match.id]: true }));
    
    try {
      // Mark the match as contacted
      const success = await markMatchAsContacted(match.id);
      
      if (success) {
        // Create a client record with minimal required fields
        const clientData: Partial<QuestionnaireData> = {
          firstName: match.userName.split(' ')[0],
          lastName: match.userName.split(' ').slice(1).join(' '),
          fullName: match.userName,
          email: match.userEmail,
          phoneNumber: '',
          zipCode: '',
          dateOfBirth: null,
          householdSize: 1,
          monthlyIncome: 0,
          hasHealthInsurance: false,
          hasChildren: false,
          wantsRecoveryHelp: false,
          isCurrentlySober: false,
          faithPreference: 'no-preference',
          preferredReferralMethod: 'email',
          needsAssistance: match.matchReason,
          immediateHelp: false,
          inWashtenawCounty: true,
          isVeteran: true
        };
        
        await createClientRecord(match.userId, organization.id, clientData as QuestionnaireData);
        
        // Update the UI
        setMatches(prev => prev.filter(m => m.id !== match.id));
        
        toast({
          title: "Client Contacted",
          description: `${match.userName} has been marked as contacted.`,
        });
      }
    } catch (error) {
      console.error("Error marking match as contacted:", error);
      toast({
        title: "Error",
        description: "There was a problem updating the match status.",
        variant: "destructive",
      });
    } finally {
      setProcessing(prev => ({ ...prev, [match.id]: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pending Client Matches</span>
          <Badge variant="outline" className="ml-2">
            {matches.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-6">
            <div className="animate-pulse text-muted-foreground">Loading matches...</div>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No pending matches at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="border rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                  <h3 className="font-medium text-lg">{match.userName}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {match.createdAt ? (
                      <span>Matched {format(new Date(match.createdAt.toDate()), "MMM d, h:mm a")}</span>
                    ) : (
                      <span>Recently matched</span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center text-sm">
                    <Mail className="h-3 w-3 mr-2" />
                    <a href={`mailto:${match.userEmail}`} className="text-blue-600 hover:underline">
                      {match.userEmail}
                    </a>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-1">Needs Assistance With:</h4>
                  <div className="flex flex-wrap gap-1">
                    {match.matchReason.map((reason) => (
                      <Badge key={reason} variant="secondary" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => handleMarkAsContacted(match)}
                    disabled={processing[match.id]}
                    className="flex items-center"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    {processing[match.id] ? "Processing..." : "Mark as Contacted"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
