import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music, AudioWaveform, Sliders } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">TuneTools</Link>
          <div className="space-x-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline">Pricing</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Welcome to TuneTools
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Tools for the modern musician
          </p>
          <Link to="/app">
            <Button size="lg" className="px-8 py-6 text-lg">
              Try it now
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Music, title: "Tune split", description: "Automatically split your songs into individual instrument tracks" },
            { icon: AudioWaveform, title: "Advanced Mixing", description: "Professional-grade mixing tools at your fingertips" },
            { icon: Sliders, title: "Intuitive Interface", description: "User-friendly controls for seamless audio manipulation" }
          ].map((feature, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/10">
              <CardContent className="p-6 text-center">
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h2 className="text-xl font-semibold mb-2">{feature.title}</h2>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; 2024 TuneTools. All rights reserved.</p>
      </footer>
    </div>
  );
};