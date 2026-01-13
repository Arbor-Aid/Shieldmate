
import { Card } from "./ui/card";
import { Home, Briefcase, Heart, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    title: "Housing Assistance",
    description: "Find stable housing solutions and rental assistance programs",
    icon: Home,
    link: "/resources/housing",
  },
  {
    title: "Employment",
    description: "Connect with job opportunities and career development resources",
    icon: Briefcase,
    link: "/resources/employment",
  },
  {
    title: "Health Services",
    description: "Access mental health support and VA healthcare benefits",
    icon: Heart,
    link: "/resources/health",
  },
  {
    title: "Benefits Navigation",
    description: "Get help understanding and accessing your VA benefits",
    icon: FileText,
    link: "/resources/benefits",
  },
];

const ResourceCategories = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">How Can We Help You?</h2>
        <p className="section-subtitle text-center">
          Explore our services and resources designed to support veterans
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {categories.map((category) => (
            <Link to={category.link} key={category.title}>
              <Card className="hover:scale-105 transition-transform duration-200 cursor-pointer">
                <div className="p-6">
                  <category.icon className="h-12 w-12 text-blue mb-4" />
                  <h3 className="text-xl font-semibold text-navy mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourceCategories;
