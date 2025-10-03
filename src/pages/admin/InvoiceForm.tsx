import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { invoiceAPI } from '@/services/api';
import type { Invoice } from '@/types';

const InvoiceForm: React.FC = () => {
  const [form, setForm] = useState<Partial<Invoice>>({});
  const [clientEmail, setClientEmail] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const update = (key: keyof Invoice, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!clientEmail) throw new Error('Client email is required');
      await invoiceAPI.sendInvoice(form, clientEmail);
      toast({ title: 'Invoice sent' });
      setForm({});
      setClientEmail('');
    } catch (err: any) {
      toast({ title: 'Failed to send invoice', description: err?.message || 'Please check fields', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Send Invoice">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>Fill in all fields then send to client email.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Client Email (Send To)</Label>
                <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} type="email" required />
              </div>

              <div className="space-y-2">
                <Label>Invoice Date</Label>
                <Input value={form.invoiceDate || ''} onChange={(e) => update('invoiceDate', e.target.value)} placeholder="YYYY-MM-DD" required />
              </div>

              <div className="space-y-2">
                <Label>Service Type</Label>
                <Input value={form.invoiceServiceType || ''} onChange={(e) => update('invoiceServiceType', e.target.value)} required />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Company (Sender) Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Company Address</Label>
                  <Input value={form.companyAddress || ''} onChange={(e) => update('companyAddress', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Company Phone</Label>
                  <Input value={form.companyPhone || ''} onChange={(e) => update('companyPhone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Company Email</Label>
                  <Input value={form.companyEmail || ''} onChange={(e) => update('companyEmail', e.target.value)} type="email" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input value={form.contactPerson || ''} onChange={(e) => update('contactPerson', e.target.value)} />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Client (Billing To)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input value={form.billingToCompanyName || ''} onChange={(e) => update('billingToCompanyName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Company Address</Label>
                  <Input value={form.billingToCompanyAddress || ''} onChange={(e) => update('billingToCompanyAddress', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Company Phone</Label>
                  <Input value={form.billingToCompanyPhone || ''} onChange={(e) => update('billingToCompanyPhone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Company Email</Label>
                  <Input value={form.billingToCompanyEmail || ''} onChange={(e) => update('billingToCompanyEmail', e.target.value)} type="email" />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Service</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Total Used</Label>
                  <Input type="number" value={form.totalUsed || ''} onChange={(e) => update('totalUsed', Number(e.target.value))} placeholder="Enter quantity" />
                </div>
                <div className="space-y-2">
                  <Label>Unit Price</Label>
                  <Input type="number" step="0.01" value={form.unitPrice || ''} onChange={(e) => update('unitPrice', Number(e.target.value))} placeholder="Enter unit price" />
                </div>
                <div className="space-y-2">
                  <Label>Total Amount</Label>
                  <Input type="number" step="0.01" value={form.totalAmount || ''} onChange={(e) => update('totalAmount', Number(e.target.value))} placeholder="Enter total amount" />
                </div>
                <div className="space-y-2">
                  <Label>Total Net Amount</Label>
                  <Input type="number" step="0.01" value={form.totalNetAmount || ''} onChange={(e) => update('totalNetAmount', Number(e.target.value))} placeholder="Enter net amount" />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input type="number" value={form.accountNumber || ''} onChange={(e) => update('accountNumber', Number(e.target.value))} placeholder="Enter account number" />
                </div>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input value={form.bankName || ''} onChange={(e) => update('bankName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Branch Name</Label>
                  <Input value={form.branchName || ''} onChange={(e) => update('branchName', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting} className="bg-gradient-namsa">
                {submitting ? 'Sending...' : 'Send Invoice'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default InvoiceForm;


