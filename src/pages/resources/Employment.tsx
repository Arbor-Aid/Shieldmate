
import { useState } from "react";
import Navigation from "../../components/Navigation";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const employmentResources = [
  {
    id: 1,
    title: "Veterans Job Connect",
    description: "Employment services and job training programs specifically for veterans.",
    contact: "734-544-6700",
    website: "https://www.mitalent.org/veteran-services",
    location: "Washtenaw County",
  },
  {
    id: 2,
    title: "Michigan Works! Southeast",
    description: "Career counseling, job search assistance, and training opportunities.",
    contact: "734-714-9814",
    website: "https://www.mwse.org/",
    location: "Ann Arbor, MI",
  },
  {
    id: 3,
    title: "VA Veteran Readiness and Employment",
    description: "Support and services to help veterans with service-connected disabilities.",
    contact: "800-827-1000",
    website: "https://www.va.gov/careers-employment/vocational-rehabilitation/",
    location: "Multiple Locations",
  },
];

const Employment = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue hover:text-blue-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Link>
          <h1 className="text-3xl font-bold text-navy mt-4">Employment Resources</h1>
          <p className="text-gray-600 mt-2">
            Connect with job opportunities and career development resources.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {employmentResources.map((resource) => (
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

export default Employment;
