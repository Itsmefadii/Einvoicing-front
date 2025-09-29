'use client';

import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  PlusIcon, 
  TrashIcon, 
  EyeIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  retryAttempts: number;
  timeout: number;
  createdAt: string;
  lastDelivery?: string;
  deliveryStatus: 'success' | 'failed' | 'pending';
  successCount: number;
  failureCount: number;
}

interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: any;
  status: 'success' | 'failed' | 'pending';
  responseCode?: number;
  responseBody?: string;
  errorMessage?: string;
  attempts: number;
  deliveredAt?: string;
  createdAt: string;
}

const mockWebhooks: Webhook[] = [
  {
    id: '1',
    name: 'Invoice Created',
    url: 'https://api.example.com/webhooks/invoice-created',
    events: ['invoice.created'],
    isActive: true,
    secret: 'whsec_1234567890abcdef',
    retryAttempts: 3,
    timeout: 30,
    createdAt: '2024-01-15T10:00:00Z',
    lastDelivery: '2024-01-15T14:30:00Z',
    deliveryStatus: 'success',
    successCount: 1247,
    failureCount: 23
  },
  {
    id: '2',
    name: 'Payment Received',
    url: 'https://api.example.com/webhooks/payment-received',
    events: ['invoice.paid', 'payment.received'],
    isActive: true,
    secret: 'whsec_abcdef1234567890',
    retryAttempts: 5,
    timeout: 45,
    createdAt: '2024-01-16T11:00:00Z',
    lastDelivery: '2024-01-15T16:45:00Z',
    deliveryStatus: 'success',
    successCount: 892,
    failureCount: 12
  },
  {
    id: '3',
    name: 'FBR Status Update',
    url: 'https://api.example.com/webhooks/fbr-status',
    events: ['fbr.submitted', 'fbr.approved', 'fbr.rejected'],
    isActive: false,
    secret: 'whsec_7890abcdef123456',
    retryAttempts: 3,
    timeout: 30,
    createdAt: '2024-01-17T09:00:00Z',
    deliveryStatus: 'pending',
    successCount: 156,
    failureCount: 8
  }
];

const mockDeliveries: WebhookDelivery[] = [
  {
    id: '1',
    webhookId: '1',
    event: 'invoice.created',
    payload: { invoiceId: 'INV-001', customerName: 'ABC Company' },
    status: 'success',
    responseCode: 200,
    responseBody: 'OK',
    attempts: 1,
    deliveredAt: '2024-01-15T14:30:00Z',
    createdAt: '2024-01-15T14:29:55Z'
  },
  {
    id: '2',
    webhookId: '2',
    event: 'invoice.paid',
    payload: { invoiceId: 'INV-002', amount: 75000 },
    status: 'success',
    responseCode: 200,
    responseBody: 'OK',
    attempts: 1,
    deliveredAt: '2024-01-15T16:45:00Z',
    createdAt: '2024-01-15T16:44:50Z'
  },
  {
    id: '3',
    webhookId: '3',
    event: 'fbr.submitted',
    payload: { invoiceId: 'INV-003', fbrReference: 'FBR123456' },
    status: 'failed',
    responseCode: 500,
    responseBody: 'Internal Server Error',
    errorMessage: 'Server timeout',
    attempts: 3,
    createdAt: '2024-01-15T17:00:00Z'
  }
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>(mockWebhooks);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>(mockDeliveries);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [loading, setLoading] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);

  const availableEvents = [
    'invoice.created',
    'invoice.updated',
    'invoice.paid',
    'invoice.overdue',
    'invoice.cancelled',
    'payment.received',
    'fbr.submitted',
    'fbr.approved',
    'fbr.rejected',
    'customer.created',
    'customer.updated'
  ];

  const getDeliveryStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateWebhook = async (webhookData: Partial<Webhook>) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newWebhook: Webhook = {
        id: Date.now().toString(),
        name: webhookData.name || '',
        url: webhookData.url || '',
        events: webhookData.events || [],
        isActive: webhookData.isActive || true,
        secret: `whsec_${Math.random().toString(36).substr(2, 9)}`,
        retryAttempts: webhookData.retryAttempts || 3,
        timeout: webhookData.timeout || 30,
        createdAt: new Date().toISOString(),
        deliveryStatus: 'pending',
        successCount: 0,
        failureCount: 0
      };

      setWebhooks(prev => [...prev, newWebhook]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create webhook:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWebhook = async (webhookData: Partial<Webhook>) => {
    if (!editingWebhook) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setWebhooks(prev => prev.map(wh => 
        wh.id === editingWebhook.id 
          ? { ...wh, ...webhookData }
          : wh
      ));
      setEditingWebhook(null);
    } catch (error) {
      console.error('Failed to update webhook:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWebhooks(prev => prev.filter(wh => wh.id !== webhookId));
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWebhook = async (webhookId: string) => {
    setWebhooks(prev => prev.map(wh => 
      wh.id === webhookId 
        ? { ...wh, isActive: !wh.isActive }
        : wh
    ));
  };

  const handleTestWebhook = async (webhookId: string) => {
    setTestingWebhook(webhookId);
    try {
      // Simulate webhook test
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Add a test delivery
      const testDelivery: WebhookDelivery = {
        id: Date.now().toString(),
        webhookId,
        event: 'webhook.test',
        payload: { message: 'This is a test webhook delivery' },
        status: 'success',
        responseCode: 200,
        responseBody: 'OK',
        attempts: 1,
        deliveredAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      setDeliveries(prev => [testDelivery, ...prev]);
    } catch (error) {
      console.error('Webhook test failed:', error);
    } finally {
      setTestingWebhook(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Webhooks</h1>
          <p className="text-gray-600">Manage webhook endpoints and event notifications</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Webhook
        </Button>
      </div>

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BellIcon className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{webhook.name}</CardTitle>
                    <CardDescription className="text-sm">{webhook.url}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    webhook.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {webhook.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleWebhook(webhook.id)}
                  >
                    {webhook.isActive ? <StopIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Events</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {webhook.events.map((event) => (
                      <span key={event} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Secret</p>
                  <p className="text-sm font-mono text-gray-900 mt-1">{webhook.secret}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Retry Attempts</p>
                  <p className="text-sm text-gray-900 mt-1">{webhook.retryAttempts}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Timeout</p>
                  <p className="text-sm text-gray-900 mt-1">{webhook.timeout}s</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{webhook.successCount}</p>
                  <p className="text-sm text-gray-600">Successful</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{webhook.failureCount}</p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Last Delivery</p>
                  <p className="text-sm font-medium text-gray-900">
                    {webhook.lastDelivery ? formatDate(webhook.lastDelivery) : 'Never'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingWebhook(webhook)}
                  >
                    <CogIcon className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestWebhook(webhook.id)}
                    disabled={testingWebhook === webhook.id}
                  >
                    {testingWebhook === webhook.id ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Testing...
                      </div>
                    ) : (
                      <>
                        <PlayIcon className="h-4 w-4 mr-2" />
                        Test
                      </>
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteWebhook(webhook.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>Latest webhook delivery attempts and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Webhook</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Event</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Response</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Attempts</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery) => {
                  const webhook = webhooks.find(w => w.id === delivery.webhookId);
                  return (
                    <tr key={delivery.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{webhook?.name || 'Unknown'}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{delivery.event}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getDeliveryStatusIcon(delivery.status)}
                          <span className={`text-sm font-medium ${getDeliveryStatusColor(delivery.status)}`}>
                            {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p className="font-medium">{delivery.responseCode || '-'}</p>
                          {delivery.errorMessage && (
                            <p className="text-red-600 text-xs">{delivery.errorMessage}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{delivery.attempts}</td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(delivery.createdAt)}</td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Webhook Modal */}
      {(showCreateForm || editingWebhook) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingWebhook ? 'Edit Webhook' : 'Create New Webhook'}
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const webhookData = {
                  name: formData.get('name') as string,
                  url: formData.get('url') as string,
                  events: Array.from(formData.getAll('events')) as string[],
                  retryAttempts: parseInt(formData.get('retryAttempts') as string),
                  timeout: parseInt(formData.get('timeout') as string),
                  isActive: formData.get('isActive') === 'on'
                };

                if (editingWebhook) {
                  handleUpdateWebhook(webhookData);
                } else {
                  handleCreateWebhook(webhookData);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <Input
                      name="name"
                      defaultValue={editingWebhook?.name}
                      placeholder="Webhook name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                    <Input
                      name="url"
                      type="url"
                      defaultValue={editingWebhook?.url}
                      placeholder="https://your-domain.com/webhook"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Events</label>
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {availableEvents.map((event) => (
                        <label key={event} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="events"
                            value={event}
                            defaultChecked={editingWebhook?.events.includes(event)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{event}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Retry Attempts</label>
                      <Input
                        name="retryAttempts"
                        type="number"
                        min="1"
                        max="10"
                        defaultValue={editingWebhook?.retryAttempts || 3}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (seconds)</label>
                      <Input
                        name="timeout"
                        type="number"
                        min="5"
                        max="120"
                        defaultValue={editingWebhook?.timeout || 30}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      defaultChecked={editingWebhook?.isActive ?? true}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingWebhook(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      editingWebhook ? 'Update Webhook' : 'Create Webhook'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
