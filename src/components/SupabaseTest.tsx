import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { testSupabaseConnection, testSupabaseAuth } from '@/utils/supabase-test';
import { useAuth } from '@/contexts/AuthContext';

export const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [authStatus, setAuthStatus] = useState<string>('');
  const { user, session } = useAuth();

  const testConnection = async () => {
    setConnectionStatus('Testing connection...');
    const result = await testSupabaseConnection();
    setConnectionStatus(result.success ? '✅ Connected successfully!' : `❌ Error: ${result.error}`);
  };

  const testAuth = async () => {
    setAuthStatus('Testing authentication...');
    const result = await testSupabaseAuth();
    setAuthStatus(result.success ? '✅ Auth working!' : `❌ Error: ${result.error}`);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Button onClick={testConnection} className="w-full mb-2">
            Test Database Connection
          </Button>
          <p className="text-sm text-muted-foreground">{connectionStatus}</p>
        </div>
        
        <div>
          <Button onClick={testAuth} className="w-full mb-2">
            Test Authentication
          </Button>
          <p className="text-sm text-muted-foreground">{authStatus}</p>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Current Auth Status:</h4>
          <p className="text-sm text-muted-foreground">
            User: {user ? user.email : 'Not logged in'}
          </p>
          <p className="text-sm text-muted-foreground">
            Session: {session ? 'Active' : 'No session'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
