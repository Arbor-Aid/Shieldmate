
import { useState } from "react";
import Navigation from "../../components/Navigation";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const healthResources = [
  {
    id: 1,
    title: "VA Health Care Services",
    description: "Access to VA healthcare benefits, medical centers, and mental health resources.",
    contact: "877-222-8387",
    website: "https://www.va.gov/health-care/",
    location: "Washtenaw County",
  },
  {
    id: 2,
    title: "Veterans Crisis Line",
    description: "Confidential crisis support for veterans and their families.",
    contact: "988 (Press 1)",
    website: "https://www.veteranscrisisline.net/",
    location: "Nationwide",
  },
  {
    id: 3,
    title: "Washtenaw County Community Mental Health",
    description: "Local mental health services and support programs.",
    contact: "734-544-3050",
    website: "https://www.washtenaw.org/839/Community-Mental-Health",
    location: "Ann Arbor, MI",
  },
];

const Health = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue hover:text-blue-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Link>
          <h1 className="text-3xl font-bold text-navy mt-4">Health Services</h1>
          <p className="text-gray-600 mt-2">
            Access mental health support and VA healthcare benefits.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {healthResources.map((resource) => (
            <Card key={resource.id} className="p-6">
              <h3 className="text-xl font-semibold text-navy mb-2">{resource.title}</h3>
              <p className="text-gray-600 mb-4">{resource.description}</p>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Location:</strong> {resource.location}
                </p>
                <p className="text-sm">
                  <strong>Contact:</strong> {resource.contact}
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => window.open(resource.website, '_blank')}
                >
                  Visit Website
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Health;
