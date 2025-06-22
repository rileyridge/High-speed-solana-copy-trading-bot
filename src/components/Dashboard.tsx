
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, List } from 'lucide-react';

interface Country {
  id: string;
  name: string;
  code: string;
}

interface Service {
  id: string;
  name: string;
  code: string;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const { toast } = useToast();

  const callSmsApi = async (action: string, params: Record<string, any> = {}) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('sms-service', {
        body: { action, ...params }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to call SMS service",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const data = await callSmsApi('getBalance');
      if (data.balance !== undefined) {
        setBalance(parseFloat(data.balance));
      }
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  };

  const fetchCountries = async () => {
    try {
      const data = await callSmsApi('getCountries');
      if (data && typeof data === 'object') {
        // Convert object to array format
        const countriesArray = Object.entries(data).map(([id, name]) => ({
          id,
          name: name as string,
          code: id
        }));
        setCountries(countriesArray);
      }
    } catch (error) {
      console.error('Failed to get countries:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const data = await callSmsApi('getApplications');
      if (data && typeof data === 'object') {
        // Convert object to array format
        const servicesArray = Object.entries(data).map(([id, name]) => ({
          id,
          name: name as string,
          code: id
        }));
        setServices(servicesArray);
      }
    } catch (error) {
      console.error('Failed to get services:', error);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchCountries();
    fetchServices();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SMS-Man Dashboard</h1>
          <p className="text-muted-foreground">Monitor your account and explore available services</p>
        </div>
        <Button onClick={fetchBalance} disabled={loading}>
          <DollarSign className="w-4 h-4 mr-2" />
          Refresh Balance
        </Button>
      </div>

      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Account Balance
          </CardTitle>
          <CardDescription>
            Your current SMS-Man account balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {balance !== null ? `$${balance.toFixed(2)}` : 'Loading...'}
          </div>
        </CardContent>
      </Card>

      {/* Countries and Services Tabs */}
      <Tabs defaultValue="countries" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="countries">
            <List className="w-4 h-4 mr-2" />
            Countries ({countries.length})
          </TabsTrigger>
          <TabsTrigger value="services">
            <List className="w-4 h-4 mr-2" />
            Services ({services.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="countries">
          <Card>
            <CardHeader>
              <CardTitle>Supported Countries</CardTitle>
              <CardDescription>
                List of countries available for SMS verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {countries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country ID</TableHead>
                      <TableHead>Country Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {countries.map((country) => (
                      <TableRow key={country.id}>
                        <TableCell className="font-mono">{country.code}</TableCell>
                        <TableCell>{country.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {loading ? 'Loading countries...' : 'No countries available'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Available Services</CardTitle>
              <CardDescription>
                List of services available for SMS verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {services.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service ID</TableHead>
                      <TableHead>Service Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-mono">{service.code}</TableCell>
                        <TableCell>{service.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {loading ? 'Loading services...' : 'No services available'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
