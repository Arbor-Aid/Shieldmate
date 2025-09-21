
import Navigation from "../components/Navigation";
import HeroSection from "../components/HeroSection";
import ResourceCategories from "../components/ResourceCategories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Briefcase, Heart, Award, MessageSquare, Facebook, Twitter, Instagram } from "lucide-react";
import GuidedAssistant from "@/components/guided-assistant/GuidedAssistant";

const Index = () => {
  const quickAccessItems = [{
    title: "Housing Resources",
    description: "Access housing support and resources for veterans",
    icon: Home,
    path: "/resources/housing"
  }, {
    title: "Employment",
    description: "Job opportunities and career resources for veterans",
    icon: Briefcase,
    path: "/resources/employment"
  }, {
    title: "Health Services",
    description: "Mental health and wellness resources for veterans",
    icon: Heart,
    path: "/resources/health"
  }, {
    title: "Benefits Navigation",
    description: "Navigate VA benefits and support programs",
    icon: Award,
    path: "/resources/benefits"
  }];
  return <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <ResourceCategories />
        
        <div className="container mx-auto py-12 px-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickAccessItems.map(item => <Link to={item.path} key={item.title}>
                
              </Link>)}
          </div>
          
          <div className="mt-16 text-center">
            <h2 className="section-title mb-4">Need Personalized Assistance?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Our AI assistant can help you navigate resources, create a resume, 
              find housing options, or schedule appointments with a case manager.
            </p>
            <Button onClick={() => {
            const assistantButton = document.querySelector('[data-test-id="guided-assistant-button"]') as HTMLButtonElement;
            if (assistantButton) {
              assistantButton.click();
            }
          }} className="bg-navy hover:bg-navy-light text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat with AI Assistant
            </Button>
          </div>
          
          {/* Social Media Buttons */}
          <div className="flex justify-center items-center gap-4 mt-12">
            <a href="https://facebook.com/2MarinesVeteranSupport" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-navy hover:bg-navy hover:text-white" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </Button>
            </a>
            <a href="https://twitter.com/2MarinesSupport" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-navy hover:bg-navy hover:text-white" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </Button>
            </a>
            <a href="https://instagram.com/2MarinesVeteranSupport" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-navy hover:bg-navy hover:text-white" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </main>
      
      {/* Include the guided assistant component */}
      <GuidedAssistant />
    </div>;
};
export default Index;
