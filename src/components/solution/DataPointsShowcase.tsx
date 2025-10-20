import { User, Mail, Phone, MapPin, Calendar, DollarSign, Home, CreditCard, Briefcase, Heart, Eye, Clock } from "lucide-react";

export const DataPointsShowcase = () => {
  const dataPoints = [
    { icon: User, label: "Full Name", description: "First and last name of the actual visitor" },
    { icon: Mail, label: "Email Address", description: "Personal or work email, verified and deliverable" },
    { icon: Phone, label: "Phone Number", description: "Direct line, no gatekeeper needed" },
    { icon: MapPin, label: "Physical Address", description: "Complete street address, not just city" },
    { icon: Calendar, label: "Age & Generation", description: "Exact age and generational cohort" },
    { icon: DollarSign, label: "Income Level", description: "Household income range for qualification" },
    { icon: Home, label: "Home Ownership", description: "Owner, renter, or mortgage holder" },
    { icon: CreditCard, label: "Credit Score Range", description: "Financing eligibility at a glance" },
    { icon: Briefcase, label: "Occupation Category", description: "Job type and employment status" },
    { icon: Heart, label: "Marital Status", description: "Single, married, divorced—affects buying decisions" },
    { icon: Eye, label: "Pages Viewed", description: "What they looked at on your site" },
    { icon: Clock, label: "Time on Site", description: "How long they spent researching" },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            30+ Data Points Per Contact (Not Company)
          </h2>
          <p className="text-lg text-muted-foreground">
            We don't just tell you "ABC Company visited." We give you the actual person—name, phone, email, income, age, and 20+ more qualifiers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataPoints.map((point, index) => (
            <div key={index} className="flex items-start gap-4 p-6 bg-background rounded-lg border hover:shadow-lg transition-shadow">
              <point.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">{point.label}</h3>
                <p className="text-sm text-muted-foreground">{point.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Plus: Education level, political affiliation, ethnicity, religion, net worth, birth year, gender, zip code, median income, IP address, and more
          </p>
        </div>
      </div>
    </section>
  );
};
