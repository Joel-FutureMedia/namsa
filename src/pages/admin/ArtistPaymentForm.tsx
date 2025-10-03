import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { invoiceAPI } from '@/services/api';
import type { ArtistInvoiceReports } from '@/types';

const ArtistPaymentForm: React.FC = () => {
  const [form, setForm] = useState<Partial<ArtistInvoiceReports>>({});
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const update = (key: keyof ArtistInvoiceReports, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!recipientEmail) throw new Error('Recipient email is required');
      await invoiceAPI.sendArtistPayment(form, recipientEmail);
      toast({ title: 'Members payment report sent' });
      setForm({});
      setRecipientEmail('');
    } catch (err: any) {
      toast({ title: 'Failed to send payment', description: err?.message || 'Please check fields', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Send Members Payment">
      <Card>
        <CardHeader>
          <CardTitle>Members Payment Details</CardTitle>
          <CardDescription>Complete the fields then send the payment report by email.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Email (Send To)</Label>
                <Input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} type="email" required />
              </div>

              
              <div className="space-y-2">
                <Label>Members Name</Label>
                <Input value={form.artistName || ''} onChange={(e) => update('artistName', e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Members Phone</Label>
                <Input value={(form as any).artistPhoneNumber || ''} onChange={(e) => update('artistPhoneNumber' as any, e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Members Email</Label>
                <Input type="email" value={(form as any).artistEmail || ''} onChange={(e) => update('artistEmail' as any, e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Members ID</Label>
                <Input value={form.artistId || ''} onChange={(e) => update('artistId', e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={(form as any).Desciption || ''} onChange={(e) => update('Desciption' as any, e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input value={(form as any).paymentDate || ''} onChange={(e) => update('paymentDate' as any, e.target.value)} placeholder="YYYY-MM-DD" />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Sender Company Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Company Address</Label>
                  <Input value={(form as any).companyAddress || ''} onChange={(e) => update('companyAddress' as any, e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Company Phone</Label>
                  <Input value={(form as any).companyPhone || ''} onChange={(e) => update('companyPhone' as any, e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Company Email</Label>
                  <Input type="email" value={(form as any).companyEmail || ''} onChange={(e) => update('companyEmail' as any, e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input value={(form as any).contactPerson || ''} onChange={(e) => update('contactPerson' as any, e.target.value)} />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Totals</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label>Total Played</Label>
                  <Input type="number" step="0.01" value={(form as any).totalplayed || ''} onChange={(e) => update('totalplayed' as any, Number(e.target.value))} placeholder="Enter total played" />
                </div>
                <div className="space-y-2">
                  <Label>Unit Price</Label>
                  <Input type="number" step="0.01" value={(form as any).UnitPrice || ''} onChange={(e) => update('UnitPrice' as any, Number(e.target.value))} placeholder="Enter unit price" />
                </div>
                <div className="space-y-2">
                  <Label>Total Earned</Label>
                  <Input type="number" step="0.01" value={(form as any).TotalEarned || ''} onChange={(e) => update('TotalEarned' as any, Number(e.target.value))} placeholder="Enter total earned" />
                </div>
                <div className="space-y-2">
                  <Label>Total Net Paid</Label>
                  <Input type="number" step="0.01" value={(form as any).TotalNetpaid || ''} onChange={(e) => update('TotalNetpaid' as any, Number(e.target.value))} placeholder="Enter net paid" />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Members Bank Account</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input value={(form as any).BankName || ''} onChange={(e) => update('BankName' as any, e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input type="number" value={(form as any).AccountNumber || ''} onChange={(e) => update('AccountNumber' as any, Number(e.target.value))} placeholder="Enter account number" />
                </div>
                <div className="space-y-2">
                  <Label>Branch Name</Label>
                  <Input value={(form as any).branchName || ''} onChange={(e) => update('branchName' as any, e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting} className="bg-gradient-namsa">
                {submitting ? 'Sending...' : 'Send Payment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ArtistPaymentForm;


