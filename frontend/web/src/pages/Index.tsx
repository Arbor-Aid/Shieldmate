import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Heart, Home, Briefcase, Award } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Shield className="mr-3 h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">shieldmate</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/questionnaire">
              <Button variant="hero">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-hero py-20 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-6 text-4xl font-bold md:text-6xl">
            Autonomous Support Platform for Marines
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl opacity-90 md:text-2xl">
            Connecting Marines with resources, organizations, and opportunities. Your journey continues with
            support every step of the way.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/questionnaire">
              <Button variant="honor" size="lg" className="w-full sm:w-auto">
                Start Assessment
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary sm:w-auto"
              >
                Access Resources
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Support Areas</h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive resources designed specifically for Marines transitioning to civilian life
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 bg-gradient-card shadow-md transition-shadow hover:shadow-lg">
              <CardHeader className="text-center">
                <Home className="mx-auto mb-4 h-12 w-12 text-accent" />
                <CardTitle>Housing</CardTitle>
                <CardDescription>Find suitable housing options and assistance programs</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 bg-gradient-card shadow-md transition-shadow hover:shadow-lg">
              <CardHeader className="text-center">
                <Briefcase className="mx-auto mb-4 h-12 w-12 text-accent" />
                <CardTitle>Employment</CardTitle>
                <CardDescription>Career opportunities and job placement services</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 bg-gradient-card shadow-md transition-shadow hover:shadow-lg">
              <CardHeader className="text-center">
                <Heart className="mx-auto mb-4 h-12 w-12 text-accent" />
                <CardTitle>Health &amp; Wellness</CardTitle>
                <CardDescription>Mental health resources and medical support</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 bg-gradient-card shadow-md transition-shadow hover:shadow-lg">
              <CardHeader className="text-center">
                <Award className="mx-auto mb-4 h-12 w-12 text-accent" />
                <CardTitle>Benefits</CardTitle>
                <CardDescription>VA benefits and financial assistance programs</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Users className="mx-auto mb-6 h-16 w-16 opacity-90" />
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">Join the shieldmate Community</h2>
          <p className="mb-8 text-xl opacity-90">
            Connect with fellow Marines, access tailored resources, and get the support you deserve
          </p>
          <Link to="/questionnaire">
            <Button variant="honor" size="lg">
              Begin Your Journey
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t bg-card py-12">
        <div className="mx-auto flex flex-col items-center justify-between gap-4 px-4 text-center sm:px-6 lg:px-8 md:flex-row md:text-left">
          <div className="flex items-center">
            <Shield className="mr-3 h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">shieldmate</span>
          </div>
          <p className="text-muted-foreground">
            Supporting Marines in their journey forward.
            <br />
            Semper Fidelis
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
