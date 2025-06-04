
import React, { useState } from "react";
import { useSubscriptions } from "@/domains/subscriptions/hooks/useSubscriptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  CreditCard, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus
} from "lucide-react";
import { toast } from "sonner";

export const Subscriptions = () => {
  const { subscriptions, isLoading } = useSubscriptions();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const subscriptionStats = {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter(sub => sub.status === 'active').length,
    monthlyRevenue: subscriptions.reduce((sum, sub) => {
      // Mock calculation - in real app this would come from the service pricing
      return sum + 99; // example price
    }, 0),
    churnRate: 2.3
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 29,
      interval: 'month',
      features: [
        'Up to 5 projects',
        'Basic support',
        '10GB storage',
        'Email notifications'
      ],
      recommended: false
    },
    {
      id: 'professional',
      name: 'Professional Plan',
      price: 99,
      interval: 'month',
      features: [
        'Unlimited projects',
        'Priority support',
        '100GB storage',
        'Advanced analytics',
        'Team collaboration',
        'Custom integrations'
      ],
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 299,
      interval: 'month',
      features: [
        'Everything in Professional',
        'Dedicated support',
        'Unlimited storage',
        'Advanced security',
        'Custom development',
        'SLA guarantee'
      ],
      recommended: false
    }
  ];

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    toast.success(`Selected ${plans.find(p => p.id === planId)?.name}`);
    // In real app, this would integrate with Stripe
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'canceled':
        return <AlertCircle className="h-4 w-4" />;
      case 'past_due':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">Manage subscription plans and billing</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Subscription
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionStats.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {subscriptionStats.activeSubscriptions} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${subscriptionStats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionStats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              +5% growth rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionStats.churnRate}%</div>
            <p className="text-xs text-muted-foreground">
              -0.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Available Plans</h2>
          <p className="text-muted-foreground">Choose the perfect plan for your needs</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.recommended ? 'ring-2 ring-primary' : ''}`}>
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.recommended ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  Choose Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Current Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscriptions</CardTitle>
          <CardDescription>Manage existing subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active subscriptions found
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getStatusColor(subscription.status)}`}>
                        {getStatusIcon(subscription.status)}
                      </div>
                      <div>
                        <h3 className="font-medium">Professional Plan</h3>
                        <p className="text-sm text-muted-foreground">
                          Client: {subscription.clients?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">
                        {new Date(subscription.current_period_start).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium">
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Renewal</p>
                      <p className="font-medium">
                        {subscription.status === 'active' ? 'Auto-renew' : 'Disabled'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Actions</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>
                  </div>

                  {subscription.status === 'active' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Billing Period Progress</span>
                        <span>
                          {Math.round(
                            ((new Date().getTime() - new Date(subscription.current_period_start).getTime()) /
                            (new Date(subscription.current_period_end).getTime() - new Date(subscription.current_period_start).getTime())) * 100
                          )}%
                        </span>
                      </div>
                      <Progress 
                        value={
                          ((new Date().getTime() - new Date(subscription.current_period_start).getTime()) /
                          (new Date(subscription.current_period_end).getTime() - new Date(subscription.current_period_start).getTime())) * 100
                        } 
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
