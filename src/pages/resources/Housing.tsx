
import { useState } from "react";
import Navigation from "../../components/Navigation";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const housingResources = [
  {
    id: 1,
    title: "VA Housing Assistance",
    description: "Access VA home loans, housing grants, and other housing-related programs.",
    contact: "888-827-3702",
    website: "https://www.va.gov/housing-assistance/",
    location: "Washtenaw County",
  },
  {
    id: 2,
    title: "Housing Access of Washtenaw County",
    description: "Local housing assistance and emergency shelter services.",
    contact: "734-961-1999",
    website: "https://www.housingaccess.net/",
    location: "Ann Arbor, MI",
  },
  {
    id: 3,
    title: "Michigan State Housing Development Authority",
    description: "State-level housing assistance programs and resources.",
    contact: "517-373-8370",
    website: "https://www.michigan.gov/mshda",
    location: "Michigan",
  },
];

const Housing = () => {
  const [filter, setFilter] = useState("all");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-blue hover:text-blue-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Link>
          <h1 className="text-3xl font-bold text-navy mt-4">Housing Resources</h1>
          <p className="text-gray-600 mt-2">
            Find stable housing solutions and rental assistance programs in Washtenaw County.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {housingResources.map((resource) => (
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

export default Housing;
