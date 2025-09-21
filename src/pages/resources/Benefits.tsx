
import { useState, useEffect } from "react";
import Navigation from "../../components/Navigation";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { trackEvent } from "@/lib/firebase";

const benefitResources = [
  {
    id: 1,
    title: "VA Benefits Navigator",
    description: "Comprehensive guide to understanding and accessing your VA benefits.",
    contact: "800-827-1000",
    website: "https://www.va.gov/find-benefits-va-letters/",
    location: "Nationwide",
  },
  {
    id: 2,
    title: "Washtenaw County Veterans Services",
    description: "Local assistance with VA benefits applications and navigation.",
    contact: "734-973-4540",
    website: "https://www.washtenaw.org/598/Veterans-Services",
    location: "Ann Arbor, MI",
  },
  {
    id: 3,
    title: "Michigan Veterans Affairs Agency",
    description: "State-level veterans benefits and resources.",
    contact: "800-MICH-VET",
    website: "https://www.michigan.gov/mvaa",
    location: "Michigan",
  },
];

const Benefits = () => {
  useEffect(() => {
    // Track page view when the component mounts
    trackEvent('page_viewed', { page: 'benefits' });
  }, []);

  const handleResourceClick = (resourceName: string, resourceUrl: string) => {
    // Track external resource click
    trackEvent('resource_clicked', { 
      resource: resourceName,
      url: resourceUrl,
      category: 'benefits'
    });
    window.open(resourceUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue hover:text-blue-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Link>
          <h1 className="text-3xl font-bold text-navy mt-4">Benefits Navigation</h1>
          <p className="text-gray-600 mt-2">
            Get help understanding and accessing your VA benefits.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefitResources.map((resource) => (
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
                  onClick={() => handleResourceClick(resource.title, resource.website)}
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

export default Benefits;
