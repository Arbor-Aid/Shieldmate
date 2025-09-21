import { useEffect } from 'react';
import Profile from './Profile';
import { useAuth } from '@/hooks/useAuth';
import { useMcpClient } from '@/hooks/useMcpClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ClientDashboard = () => {
  const { currentUser } = useAuth();
  const { getReferrals } = useMcpClient();

  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }

    getReferrals.mutate({
      profile: {
        userId: currentUser.uid,
        intent: 'career-transition',
      },
    });
  }, [currentUser, getReferrals]);

  const referrals = (getReferrals.data as { referrals?: any[] } | undefined)?.referrals ?? [];

  return (
    <div className="bg-background">
      <Profile />
      <div className="container mx-auto px-4 pb-12">
        <Card className="mt-8 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-navy">Recommended Referrals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getReferrals.isPending && (
              <p className="text-muted-foreground">Loading personalized referrals...</p>
            )}
            {getReferrals.isError && !getReferrals.isPending && (
              <p className="text-red-600">We were unable to load referrals from the MCP.</p>
            )}
            {!getReferrals.isPending && !getReferrals.isError && referrals.length === 0 && (
              <p className="text-muted-foreground">No referral recommendations are available yet.</p>
            )}
            {referrals.length > 0 && (
              <ul className="space-y-4">
                {referrals.map((referral, index) => (
                  <li key={referral.id ?? index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-navy">
                          {referral.title ?? 'Referral recommendation'}
                        </p>
                        {referral.description && (
                          <p className="text-sm text-muted-foreground mt-1">{referral.description}</p>
                        )}
                      </div>
                      <Badge className="bg-slate-200 text-navy">Suggested</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
