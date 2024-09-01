import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Pricing: React.FC = () => {
  const plans = [
    { name: 'Basic', price: '$9.99/mo', features: ['5 songs per month', 'Basic mixing tools'] },
    { name: 'Pro', price: '$19.99/mo', features: ['Unlimited songs', 'Advanced mixing tools', 'Priority support'] },
    { name: 'Enterprise', price: 'Contact us', features: ['Custom solutions', 'Dedicated support', 'API access'] },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-primary">TuneSplit Pricing</h1>
      </header>
      <main className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.name} className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4">{plan.price}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full">Choose Plan</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};