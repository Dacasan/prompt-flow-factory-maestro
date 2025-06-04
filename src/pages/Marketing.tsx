
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Users, 
  Mail, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Star,
  MessageSquare,
  Target,
  Calendar,
  Download,
  Plus
} from "lucide-react";

export const Marketing = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const campaignStats = {
    total_campaigns: 8,
    active_campaigns: 3,
    total_leads: 247,
    conversion_rate: 12.4,
    email_open_rate: 24.8,
    click_through_rate: 3.2
  };

  const campaigns = [
    {
      id: 1,
      name: "Q4 Service Promotion",
      status: "active",
      type: "Email",
      sent: 1250,
      opened: 310,
      clicked: 45,
      conversions: 12,
      budget: 500,
      spent: 320
    },
    {
      id: 2,
      name: "New Client Onboarding",
      status: "active",
      type: "Email",
      sent: 89,
      opened: 67,
      clicked: 23,
      conversions: 8,
      budget: 200,
      spent: 150
    },
    {
      id: 3,
      name: "Holiday Special Offer",
      status: "draft",
      type: "Email",
      sent: 0,
      opened: 0,
      clicked: 0,
      conversions: 0,
      budget: 750,
      spent: 0
    }
  ];

  const leadSources = [
    { source: "Website", leads: 89, percentage: 36 },
    { source: "Email Campaign", leads: 67, percentage: 27 },
    { source: "Social Media", leads: 45, percentage: 18 },
    { source: "Referrals", leads: 32, percentage: 13 },
    { source: "Direct", leads: 14, percentage: 6 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
          <p className="text-muted-foreground">Track campaigns, leads, and marketing performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignStats.total_campaigns}</div>
            <p className="text-xs text-muted-foreground">
              {campaignStats.active_campaigns} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignStats.total_leads}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignStats.conversion_rate}%</div>
            <p className="text-xs text-muted-foreground">
              +2.4% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Email Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignStats.email_open_rate}%</div>
            <p className="text-xs text-muted-foreground">
              Industry avg: 21.3%
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="leads">Lead Sources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>Monitor and manage your marketing campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline">{campaign.type}</Badge>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Sent</p>
                        <p className="font-medium">{campaign.sent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Opened</p>
                        <p className="font-medium">{campaign.opened.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Clicked</p>
                        <p className="font-medium">{campaign.clicked.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversions</p>
                        <p className="font-medium">{campaign.conversions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-medium">${campaign.budget}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Spent</p>
                        <p className="font-medium">${campaign.spent}</p>
                      </div>
                    </div>

                    {campaign.status === 'active' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Budget Usage</span>
                          <span>{((campaign.spent / campaign.budget) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={(campaign.spent / campaign.budget) * 100} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Sources</CardTitle>
              <CardDescription>Track where your leads are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leadSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="font-medium">{source.source}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{source.leads} leads</span>
                      <div className="w-20">
                        <Progress value={source.percentage} />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{source.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Email Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Open Rate</span>
                  <span className="font-medium">{campaignStats.email_open_rate}%</span>
                </div>
                <Progress value={campaignStats.email_open_rate} />
                
                <div className="flex justify-between items-center">
                  <span>Click Rate</span>
                  <span className="font-medium">{campaignStats.click_through_rate}%</span>
                </div>
                <Progress value={campaignStats.click_through_rate} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Conversion Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Overall Conversion</span>
                  <span className="font-medium">{campaignStats.conversion_rate}%</span>
                </div>
                <Progress value={campaignStats.conversion_rate} />
                
                <div className="text-sm text-muted-foreground">
                  <p>20 conversions this month</p>
                  <p>+15% vs last month</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
