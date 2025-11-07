export interface Author {
  id: string;
  name: string;
  jobTitle: string;
  bio: string;
  image?: string;
  expertise: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export const authors: Record<string, Author> = {
  "nurturely-team": {
    id: "nurturely-team",
    name: "NurturelyX Team",
    jobTitle: "Lead Generation Experts",
    bio: "The NurturelyX team consists of marketing technologists, data scientists, and B2B lead generation specialists with over 50 years of combined experience helping businesses identify and convert anonymous website visitors into qualified leads.",
    expertise: [
      "Identity Resolution",
      "Lead Generation",
      "B2B Marketing",
      "Conversion Optimization",
      "Marketing Analytics",
    ],
    socialLinks: {
      linkedin: "https://www.linkedin.com/company/nurturely",
    },
  },
  "sarah-johnson": {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    jobTitle: "Senior Marketing Strategist",
    bio: "Sarah specializes in identity resolution technology and has helped over 200 businesses improve their lead generation ROI. With 12 years in B2B marketing, she's an expert in turning anonymous traffic into qualified pipeline.",
    expertise: [
      "Marketing Strategy",
      "Lead Generation",
      "Analytics",
      "Customer Acquisition",
    ],
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/sarahjohnson-marketing",
    },
  },
};

export const getAuthorById = (authorName: string): Author => {
  // Try to find by name match first
  const author = Object.values(authors).find(
    (a) => a.name.toLowerCase() === authorName.toLowerCase()
  );
  
  if (author) return author;
  
  // Default to team
  return authors["nurturely-team"];
};
