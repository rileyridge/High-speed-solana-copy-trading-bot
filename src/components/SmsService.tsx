
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SmsRequest {
  id?: string;
  phone?: string;
  status?: string;
  code?: string;
}

const SmsService = () => {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [activeRequests, setActiveRequests] = useState<SmsRequest[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedService, setSelectedService] = useState('');
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

  const getBalance = async () => {
    try {
      const data = await callSmsApi('getBalance');
      if (data.balance !== undefined) {
        setBalance(parseFloat(data.balance));
        toast({
          title: "Balance Updated",
          description: `Current balance: $${data.balance}`
        });
      }
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  };

  const getNumber = async () => {
    if (!selectedCountry || !selectedService) {
      toast({
        title: "Missing Information",
        description: "Please select country and service first",
        variant: "destructive"
      });
      return;
    }

    try {
      const data = await callSmsApi('getNumber', {
        country_id: selectedCountry,
        application_id: selectedService
      });

      if (data.number && data.request_id) {
        const newRequest: SmsRequest = {
          id: data.request_id,
          phone: data.number,
          status: 'waiting'
        };
        setActiveRequests(prev => [...prev, newRequest]);
        toast({
          title: "Number Received",
          description: `Phone number: ${data.number}`,
        });
      }
    } catch (error) {
      console.error('Failed to get number:', error);
    }
  };

  const getSms = async (requestId: string) => {
    try {
      const data = await callSmsApi('getSMS', { request_id: requestId });
      
      if (data.sms_code) {
        setActiveRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, code: data.sms_code, status: 'completed' }
              : req
          )
        );
        toast({
          title: "SMS Received",
          description: `Code: ${data.sms_code}`,
        });
      } else if (data.error_code) {
        toast({
          title: "SMS Status",
          description: data.error_msg || "Waiting for SMS...",
        });
      }
    } catch (error) {
      console.error('Failed to get SMS:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SMS-Man Service</CardTitle>
          <CardDescription>
            Manage SMS verification numbers using SMS-Man API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button onClick={getBalance} disabled={loading}>
              Get Balance
            </Button>
            {balance !== null && (
              <span className="text-lg font-semibold">
                Balance: ${balance.toFixed(2)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Russia</SelectItem>
                  <SelectItem value="380">Ukraine</SelectItem>
                  <SelectItem value="77">Kazakhstan</SelectItem>
                  <SelectItem value="1">USA</SelectItem>
                  <SelectItem value="44">UK</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Service</label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Telegram</SelectItem>
                  <SelectItem value="2">WhatsApp</SelectItem>
                  <SelectItem value="3">Viber</SelectItem>
                  <SelectItem value="4">Instagram</SelectItem>
                  <SelectItem value="5">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={getNumber} disabled={loading || !selectedCountry || !selectedService}>
            Get Phone Number
          </Button>
        </CardContent>
      </Card>

      {activeRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Phone: {request.phone}</p>
                    <p className="text-sm text-gray-500">Status: {request.status}</p>
                    {request.code && (
                      <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        Code: {request.code}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => getSms(request.id!)}
                    disabled={loading || request.status === 'completed'}
                    size="sm"
                  >
                    Get SMS
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmsService;
