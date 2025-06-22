
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import SmsService from '@/components/SmsService';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>SMS-Man Service Hub</CardTitle>
            <CardDescription>
              Choose how you want to interact with SMS-Man services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="h-20 flex flex-col"
                variant="outline"
              >
                <span className="font-semibold">Dashboard</span>
                <span className="text-sm text-muted-foreground">View balance, countries & services</span>
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                className="h-20 flex flex-col"
                disabled
              >
                <span className="font-semibold">SMS Service</span>
                <span className="text-sm text-muted-foreground">Request numbers & get SMS codes</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <SmsService />
      </div>
    </div>
  );
};

export default Index;
