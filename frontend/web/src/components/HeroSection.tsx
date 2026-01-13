
import { Button } from "./ui/button";
import { ArrowRight, Apple, Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-gray to-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-6 animate-fade-in">
            Supporting Veterans in Washtenaw County
          </h1>
          <p className="text-xl text-gray-600 mb-8 animate-fade-in">
            Connect with housing, employment, and support services designed for veterans like you. We're here to help you navigate your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button className="btn-primary">
              Find Resources
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="btn-secondary">
              Learn More
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 animate-fade-in">
            <Button 
              className="bg-black text-white hover:bg-gray-800 transition-colors duration-200"
              onClick={() => window.open('https://apps.apple.com/us/app/2marines/YOUR_APP_ID', '_blank')}
            >
              <Apple className="mr-2 h-5 w-5" />
              App Store
            </Button>
            <Button 
              className="bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
              onClick={() => window.open('https://play.google.com/store/apps/details?id=com.twomarines.app', '_blank')}
            >
              <Play className="mr-2 h-5 w-5" />
              Google Play
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
