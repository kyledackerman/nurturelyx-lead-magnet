export interface IndustryData {
  id: string;
  name: string;
  headline: string;
  subheadline: string;
  painPoints: string[];
  avgConversionRate: number;
  avgTransactionValue: number;
  benefits: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  testimonials?: Array<{
    quote: string;
    name: string;
    company: string;
    industry: string;
  }>;
  caseStudies?: Array<{
    company: string;
    industry: string;
    challenge: string;
    solution: string;
    results: Array<{
      metric: string;
      value: string;
      icon: "revenue" | "leads" | "time" | "growth";
    }>;
    quote: string;
    timeframe: string;
  }>;
  statistics?: {
    marketSize?: string;
    growthRate?: string;
    data: Array<{
      value: string;
      label: string;
      context: string;
      source?: string;
    }>;
  };
  contentSections?: Array<{
    heading: string;
    content: string[];
  }>;
}

export const industryData: Record<string, IndustryData> = {
  hvac: {
    id: 'hvac',
    name: 'HVAC',
    headline: 'Recover Lost HVAC Service Calls',
    subheadline: 'Turn anonymous website visitors into qualified HVAC leads. Track, identify, and convert heating and cooling prospects automatically.',
    painPoints: [
      '72% of HVAC website visitors leave without contacting you',
      'Average HVAC company loses $127k/year in missed opportunities',
      'Peak season traffic = wasted ad spend without follow-up',
      'Emergency service calls slip through the cracks'
    ],
    avgConversionRate: 1,
    avgTransactionValue: 8500,
    benefits: [
      'Identify companies needing HVAC maintenance before they leave your site',
      'Automatic follow-up for emergency service requests',
      'Track peak season traffic patterns',
      'Convert more maintenance contract opportunities'
    ],
    faqs: [
      {
        question: 'How is this different from LeadFeeder, Clearbit, or other visitor tracking tools?',
        answer: 'Completely different. IP-based tools like LeadFeeder, Leadfeeder, Clearbit, and LeadForensics identify COMPANIES by reverse-looking up IP addresses. They\'re built for B2B SaaS tracking business visitors. You get results like "Acme Corp visited your site"—but no contact info. NurturelyX uses identity resolution to identify individual PEOPLE with full contact details: name, email, phone, address. We\'re built for industries that sell to consumers (home services, real estate, automotive), not companies. You get "Sarah Johnson wants HVAC service, here\'s her phone number"—that\'s an actual lead you can call.'
      },
      {
        question: 'Is this my data, or am I buying leads from you?',
        answer: 'This is 100% YOUR first-party data. When businesses visit YOUR website, that\'s YOUR visitor data. We don\'t sell leads—we identify YOUR anonymous visitors. Under legitimate business interest (GDPR Article 6(1)(f)), you have the legal right to know who\'s engaging with your HVAC business. These leads belong to you, not us.'
      },
      {
        question: 'How is this different from buying lead lists?',
        answer: 'Completely different. Lead lists are cold contacts who\'ve never heard of you. Identity resolution reveals people who ALREADY visited YOUR website, viewed YOUR HVAC services, and showed real interest. This is warm, first-party data from YOUR domain. You\'re not buying leads—you\'re unlocking visitor identities you already own the rights to.'
      },
      {
        question: 'How does visitor identification work for HVAC companies?',
        answer: 'Our identity resolution technology identifies business visitors to your HVAC website, revealing company names, contact information, and service needs even if they don\'t fill out a form. This is YOUR visitor data from YOUR website that we help you unlock.'
      },
      {
        question: 'What information do I get about HVAC prospects?',
        answer: 'You receive company name, industry, location, contact details, pages visited, time on site, and service interest indicators - perfect for prioritizing hot HVAC leads.'
      },
      {
        question: 'Is visitor identification legal and privacy-compliant?',
        answer: 'Yes—this is YOUR first-party data from YOUR website. Under GDPR Article 6(1)(f) legitimate interest, you have the legal right to identify business visitors to your HVAC site. We\'re not tracking people across the web—we\'re revealing who visited YOUR domain. Fully compliant with GDPR, CCPA, and all privacy regulations. You own this data.'
      }
    ],
    testimonials: [
      {
        quote: "We discovered 247 HVAC contractors had visited our site in the past month. We had no idea. Now we're calling them.",
        name: "Mike R.",
        company: "Regional HVAC Supplier",
        industry: "HVAC"
      }
    ],
    caseStudies: [
      {
        company: "Mountain States HVAC",
        industry: "Commercial HVAC Services",
        challenge: "With a $450,000 annual marketing budget driving 8,500 monthly website visitors, only 2-3% were converting to leads. The majority of their traffic—especially during peak summer months—remained completely anonymous, representing massive lost opportunity.",
        solution: "Implemented NurturelyX visitor identification to reveal anonymous traffic. Set up automated workflows to route identified leads to sales reps based on service type and urgency. Integrated with existing Salesforce CRM for seamless follow-up.",
        results: [
          { metric: "New Revenue", value: "$287K", icon: "revenue" },
          { metric: "Identified Leads/Month", value: "1,847", icon: "leads" },
          { metric: "Response Time", value: "< 2 hrs", icon: "time" },
          { metric: "ROI Increase", value: "412%", icon: "growth" }
        ],
        quote: "We were spending six figures on marketing but only capturing a fraction of potential leads. Visitor identification revealed we were losing $200K+ annually in missed opportunities. Within 90 days, we closed enough deals to pay for the system for the next 3 years.",
        timeframe: "90-Day Results"
      },
      {
        company: "Comfort Zone Heating & Cooling",
        industry: "Residential HVAC",
        challenge: "Local HVAC contractor struggled with seasonal inconsistency. Summer AC repair season generated huge traffic spikes, but conversion rates plummeted as visitors price-shopped multiple contractors without calling. Emergency service requests went to faster competitors.",
        solution: "Deployed visitor identification with real-time lead alerts for emergency service page visitors. Created priority call lists based on pages viewed and time on site. Trained team to follow up within 1 hour of identification.",
        results: [
          { metric: "Emergency Conversions", value: "+89%", icon: "growth" },
          { metric: "Summer Season Revenue", value: "$142K", icon: "revenue" },
          { metric: "Maintenance Contracts", value: "+67", icon: "leads" },
          { metric: "Avg Follow-up Time", value: "43 min", icon: "time" }
        ],
        quote: "Game changer for emergency calls. We now know exactly who visited our emergency AC repair page and can call them immediately. Our close rate on identified emergency visitors is 71% compared to 12% on inbound form leads.",
        timeframe: "Peak Season Performance"
      }
    ],
    statistics: {
      marketSize: "$29.4B",
      growthRate: "5.2% CAGR",
      data: [
        {
          value: "72%",
          label: "Anonymous Visitor Rate",
          context: "The average HVAC company website receives 70-75% of traffic from visitors who never fill out a contact form or call. These anonymous visitors represent the largest untapped opportunity in HVAC marketing.",
          source: "HVAC Marketing Industry Report 2024"
        },
        {
          value: "$127,000",
          label: "Annual Revenue Lost Per Company",
          context: "HVAC contractors with 5,000+ monthly website visitors lose an average of $127K annually from unidentified prospects. This number climbs to $300K+ for contractors with 15,000+ monthly visits.",
          source: "NurturelyX Customer Analysis 2024"
        },
        {
          value: "83%",
          label: "Mobile Research Rate",
          context: "83% of emergency HVAC service searches happen on mobile devices, with users visiting 3-5 competitor websites before making a decision. Without visitor identification, you're invisible in this comparison process.",
          source: "Google Consumer Insights, Home Services 2024"
        },
        {
          value: "15-25%",
          label: "Typical Identification Rate",
          context: "Modern visitor identification technology successfully identifies 15-25% of anonymous website traffic with verified contact details. For a contractor with 5,000 monthly visitors, that's 750-1,250 new leads per month.",
          source: "Identity Resolution Technology Benchmarks"
        },
        {
          value: "$8,500",
          label: "Average HVAC Job Value",
          context: "The average residential HVAC system replacement costs $8,500, while commercial projects range from $25K-$500K+. Recovering just a few lost opportunities per month creates substantial revenue impact.",
          source: "HVAC Industry Average Transaction Values"
        },
        {
          value: "48 hours",
          label: "Decision Window",
          context: "Homeowners and property managers typically make HVAC buying decisions within 48 hours of starting their research. Companies that follow up within 2 hours have 7x higher conversion rates than those who wait 24+ hours.",
          source: "Lead Response Management Study"
        }
      ]
    },
    contentSections: [
      {
        heading: "Why HVAC Companies Struggle With Online Lead Generation",
        content: [
          "The HVAC industry faces unique digital marketing challenges that make visitor identification particularly valuable. Unlike B2B SaaS or e-commerce, HVAC services involve high-consideration purchases with significant research phases. Homeowners and property managers visit multiple contractor websites, compare pricing, read reviews, and evaluate service offerings—all before making contact.",
          "This extended research behavior creates a massive blind spot for HVAC contractors. Traditional analytics tools show you traffic numbers and page views, but they can't tell you WHO these visitors are or HOW to reach them. Google Analytics might report 5,000 monthly visitors, but without contact information, 70-80% of that traffic is effectively worthless for lead generation.",
          "The problem intensifies during peak seasons. Summer AC failures and winter heating emergencies drive massive traffic spikes, but conversion rates often drop as visitors frantically research options. Emergency service pages might receive hundreds of views, but only a handful convert to actual service calls. The rest go to competitors who follow up faster or have better visibility."
        ]
      },
      {
        heading: "The True Cost of Anonymous Website Traffic",
        content: [
          "Most HVAC contractors significantly underestimate the financial impact of anonymous traffic. Let's examine the math: A mid-size HVAC contractor with a $300,000 annual marketing budget might generate 10,000 monthly website visitors. At a typical 3% conversion rate, that's 300 leads per month—but what about the other 9,700 visitors?",
          "If even 20% of that anonymous traffic (1,940 visitors) represents qualified prospects actively researching HVAC services, that's 1,940 potential leads being lost every single month. At an average job value of $8,500 and a 10% close rate, those missed opportunities represent $1.65 million in potential annual revenue.",
          "The opportunity cost extends beyond immediate revenue. Anonymous visitors might become customers of competitors who follow up more aggressively. They might have been perfect fits for annual maintenance contracts, providing recurring revenue for years. Some were likely commercial prospects with multi-system properties worth $50K-$200K in lifetime value. Without identification, you'll never know what you lost."
        ]
      },
      {
        heading: "How Visitor Identification Works for HVAC Contractors",
        content: [
          "Visitor identification technology uses identity resolution algorithms to match anonymous website visitors with verified contact databases. When someone visits your HVAC website, the technology captures their digital fingerprint (IP address, browser metadata, behavioral patterns) and cross-references this data against billions of verified consumer and business records.",
          "For HVAC contractors, this means identifying not just company names (like traditional B2B tools), but actual decision-makers: homeowners, property managers, facility directors, and building owners. You receive complete contact details including name, phone number, email, physical address, and demographic information—everything needed to initiate outreach.",
          "The technology works continuously in the background, processing traffic 24/7 without affecting website performance. Identified visitors appear in your dashboard in real-time, categorized by service interest, urgency indicators, and engagement level. High-priority leads (emergency service page visitors, repeat visitors, long engagement times) can trigger instant alerts to your sales team for immediate follow-up."
        ]
      },
      {
        heading: "Maximizing ROI: Best Practices for HVAC Lead Follow-Up",
        content: [
          "Identifying visitors is only half the equation—converting them into customers requires strategic follow-up. HVAC contractors who achieve the highest ROI from visitor identification follow a systematic approach: Speed is critical. Research shows that contacting identified leads within 1-2 hours increases conversion rates by 7x compared to 24-hour delays. For emergency service visitors, 30-60 minute response times are ideal.",
          "Personalization dramatically improves results. Instead of generic sales calls, reference the specific pages they visited: 'I saw you were researching AC replacement options on our website. I wanted to reach out and answer any questions about system sizing or financing.' This contextual approach feels helpful rather than pushy, and conversion rates improve by 40-60%.",
          "Prioritization ensures your team focuses on the hottest leads first. Set up scoring rules based on behavior: emergency service page visitors get highest priority, followed by visitors who viewed pricing pages, those who spent 5+ minutes on site, and repeat visitors. Lower-priority leads can be added to email nurture campaigns rather than requiring immediate calls.",
          "Integration with existing systems prevents leads from falling through cracks. Sync identified visitors directly to your CRM, service scheduling software, or call center platform. Automate task creation, set follow-up reminders, and track outcomes to measure which lead sources drive the best ROI. Most HVAC contractors see 300-500% ROI within 90 days when following these practices consistently."
        ]
      }
    ]
  },
  legal: {
    id: 'legal',
    name: 'Legal Services',
    headline: 'Convert Anonymous Legal Prospects Into Clients',
    subheadline: 'Identify law firms and businesses researching your legal services. Never lose a potential client again.',
    painPoints: [
      '89% of legal website visitors research without contacting',
      'High-value cases slip away due to lack of follow-up',
      'Expensive legal marketing with unknown ROI',
      'Competitors follow up faster with warm leads'
    ],
    avgConversionRate: 1,
    avgTransactionValue: 25000,
    benefits: [
      'Identify companies researching legal services',
      'Track practice area interest (corporate, litigation, etc.)',
      'Priority follow-up on high-value case prospects',
      'Measure true marketing ROI by client acquisition'
    ],
    faqs: [
      {
        question: 'How is this different from LeadFeeder, Clearbit, or other visitor tracking tools?',
        answer: 'Completely different. IP-based tools like LeadFeeder, Leadfeeder, Clearbit, and LeadForensics identify COMPANIES by reverse-looking up IP addresses. They\'re built for B2B SaaS tracking business visitors. You get results like "Acme Corp visited your site"—but no contact info. NurturelyX uses identity resolution to identify individual PEOPLE with full contact details: name, email, phone, address. We\'re built for industries that sell to consumers (home services, real estate, automotive, legal services), not companies. You get "Sarah Johnson needs legal help, here\'s her phone number"—that\'s an actual lead you can call.'
      },
      {
        question: 'Is this my data, or am I buying leads from you?',
        answer: 'This is 100% YOUR first-party data. When businesses visit YOUR website, that\'s YOUR visitor data. We don\'t sell leads—we identify YOUR anonymous visitors. Under legitimate business interest (GDPR Article 6(1)(f)), you have the legal right to know who\'s engaging with your legal services business. These leads belong to you, not us.'
      },
      {
        question: 'How is this different from buying lead lists?',
        answer: 'Completely different. Lead lists are cold contacts who\'ve never heard of you. Identity resolution reveals people who ALREADY visited YOUR website, viewed YOUR legal services, and showed real interest. This is warm, first-party data from YOUR domain. You\'re not buying leads—you\'re unlocking visitor identities you already own the rights to.'
      },
      {
        question: 'How can visitor tracking help my law firm?',
        answer: 'Identify businesses researching your practice areas, see exactly what legal services they\'re interested in, and follow up before they contact competitors. This is YOUR visitor data from YOUR website.'
      },
      {
        question: 'Is visitor identification compliant with legal ethics rules?',
        answer: 'Yes. Our system identifies YOUR website visitors using verified databases and public records - no confidential client information is collected or stored. This is YOUR first-party data under GDPR Article 6(1)(f) legitimate interest. You have the legal right to know who\'s researching your legal services.'
      },
      {
        question: 'What data do I receive about legal prospects?',
        answer: 'Company name, industry, decision-maker contacts, practice areas viewed, time spent researching, and urgency indicators - all from YOUR website traffic.'
      }
    ],
    testimonials: [
      {
        quote: "We found 89 businesses had researched our corporate law services. These are warm leads we would have completely missed otherwise.",
        name: "Sarah T.",
        company: "Mid-Size Law Firm",
        industry: "Legal Services"
      }
    ]
  },
  'real-estate': {
    id: 'real-estate',
    name: 'Real Estate',
    headline: 'Turn Property Browsers Into Buyers',
    subheadline: 'Identify who\'s viewing your listings and property pages. Follow up with serious buyers before your competition.',
    painPoints: [
      '94% of property website visitors browse anonymously',
      'Hot buyers view listings but never inquire',
      'Open house traffic without contact information',
      'Lost deals due to slow follow-up'
    ],
    avgConversionRate: 1,
    avgTransactionValue: 15000,
    benefits: [
      'Identify businesses relocating or expanding',
      'Track which properties attract serious interest',
      'Follow up with buyers viewing multiple listings',
      'Commercial real estate lead intelligence'
    ],
    faqs: [
      {
        question: 'How is this different from LeadFeeder, Clearbit, or other visitor tracking tools?',
        answer: 'Completely different. IP-based tools like LeadFeeder, Leadfeeder, Clearbit, and LeadForensics identify COMPANIES by reverse-looking up IP addresses. They\'re built for B2B SaaS tracking business visitors. You get results like "Acme Corp visited your site"—but no contact info. NurturelyX uses identity resolution to identify individual PEOPLE with full contact details: name, email, phone, address. We\'re built for industries that sell to consumers (home services, real estate, automotive), not companies. You get "Sarah Johnson is looking at properties, here\'s her phone number"—that\'s an actual lead you can call.'
      },
      {
        question: 'Is this my data, or am I buying leads from you?',
        answer: 'This is 100% YOUR first-party data. When businesses visit YOUR website, that\'s YOUR visitor data. We don\'t sell leads—we identify YOUR anonymous visitors. Under legitimate business interest (GDPR Article 6(1)(f)), you have the legal right to know who\'s engaging with your real estate business. These leads belong to you, not us.'
      },
      {
        question: 'How is this different from buying lead lists?',
        answer: 'Completely different. Lead lists are cold contacts who\'ve never heard of you. Identity resolution reveals people who ALREADY visited YOUR website, viewed YOUR properties, and showed real interest. This is warm, first-party data from YOUR domain. You\'re not buying leads—you\'re unlocking visitor identities you already own the rights to.'
      },
      {
        question: 'How does visitor identification work for real estate?',
        answer: 'Our identity resolution technology identifies business visitors viewing your listings, revealing company details and contact info even without form submissions. This is YOUR visitor data from YOUR website.'
      },
      {
        question: 'Can I see which properties prospects are interested in?',
        answer: 'Yes! Track exactly which listings each identified visitor viewed, how long they spent, and if they returned multiple times.'
      },
      {
        question: 'Is visitor identification legal and privacy-compliant?',
        answer: 'Yes—this is YOUR first-party data from YOUR website. Under GDPR Article 6(1)(f) legitimate interest, you have the legal right to identify business visitors viewing your properties. We\'re not tracking people across the web—we\'re revealing who visited YOUR domain. Fully compliant with GDPR, CCPA, and all privacy regulations. You own this data.'
      }
    ],
    testimonials: [
      {
        quote: "Found 156 businesses viewing our commercial properties. These are qualified leads we can actually call and close.",
        name: "David M.",
        company: "Commercial Real Estate Firm",
        industry: "Real Estate"
      }
    ]
  },
  'home-services': {
    id: 'home-services',
    name: 'Home Services',
    headline: 'Capture Every Home Service Lead',
    subheadline: 'Identify homeowners and property managers visiting your site. Convert plumbing, roofing, and remodeling traffic into booked jobs.',
    painPoints: [
      '81% of home service website visitors never call or submit a form',
      'Emergency requests go to faster-responding competitors',
      'Seasonal traffic spikes with poor conversion',
      'Lost revenue from comparison shoppers'
    ],
    avgConversionRate: 1,
    avgTransactionValue: 6500,
    benefits: [
      'Identify property management companies needing contractors',
      'Track emergency service page visitors',
      'Follow up with quote request abandoners',
      'Seasonal campaign ROI tracking'
    ],
    faqs: [
      {
        question: 'How is this different from LeadFeeder, Clearbit, or other visitor tracking tools?',
        answer: 'Completely different. IP-based tools like LeadFeeder, Leadfeeder, Clearbit, and LeadForensics identify COMPANIES by reverse-looking up IP addresses. They\'re built for B2B SaaS tracking business visitors. You get results like "Acme Corp visited your site"—but no contact info. NurturelyX uses identity resolution to identify individual PEOPLE with full contact details: name, email, phone, address. We\'re built for industries that sell to consumers (home services, real estate, automotive), not companies. You get "Sarah Johnson needs plumbing help, here\'s her phone number"—that\'s an actual lead you can call.'
      },
      {
        question: 'Is this my data, or am I buying leads from you?',
        answer: 'This is 100% YOUR first-party data. When businesses visit YOUR website, that\'s YOUR visitor data. We don\'t sell leads—we identify YOUR anonymous visitors. Under legitimate business interest (GDPR Article 6(1)(f)), you have the legal right to know who\'s engaging with your home services business. These leads belong to you, not us.'
      },
      {
        question: 'How is this different from buying lead lists?',
        answer: 'Completely different. Lead lists are cold contacts who\'ve never heard of you. Identity resolution reveals people who ALREADY visited YOUR website, viewed YOUR services, and showed real interest. This is warm, first-party data from YOUR domain. You\'re not buying leads—you\'re unlocking visitor identities you already own the rights to.'
      },
      {
        question: 'What home service businesses benefit most from visitor identification?',
        answer: 'Plumbers, roofers, flooring companies, remodelers, landscapers, and any home service business with a website generating traffic. This is YOUR visitor data from YOUR website.'
      },
      {
        question: 'Can I identify emergency service visitors?',
        answer: 'Yes! See which businesses visited your emergency pages, when they visited, and their contact info for immediate follow-up.'
      },
      {
        question: 'Is visitor identification legal and privacy-compliant?',
        answer: 'Yes—this is YOUR first-party data from YOUR website. Under GDPR Article 6(1)(f) legitimate interest, you have the legal right to identify business visitors to your home services site. We\'re not tracking people across the web—we\'re revealing who visited YOUR domain. Fully compliant with GDPR, CCPA, and all privacy regulations. You own this data.'
      }
    ],
    testimonials: [
      {
        quote: "This is our data—finally we can see it. First week we identified 89 warm leads we would have completely missed.",
        name: "Chris P.",
        company: "Commercial Roofing",
        industry: "Home Services"
      }
    ]
  },
  automotive: {
    id: 'automotive',
    name: 'Automotive',
    headline: 'Identify Car Buyers Before They Visit The Dealership',
    subheadline: 'Track fleet managers, car shoppers, and service customers browsing your dealership website.',
    painPoints: [
      '78% of automotive website visitors research but never contact',
      'Fleet sales opportunities lost to lack of follow-up',
      'Service department traffic without appointments',
      'Expensive automotive ads with unknown visitor identity'
    ],
    avgConversionRate: 1,
    avgTransactionValue: 45000,
    benefits: [
      'Identify fleet managers researching bulk purchases',
      'Track which vehicle models attract most interest',
      'Service department lead generation',
      'Commercial vehicle sales intelligence'
    ],
    faqs: [
      {
        question: 'How is this different from LeadFeeder, Clearbit, or other visitor tracking tools?',
        answer: 'Completely different. IP-based tools like LeadFeeder, Leadfeeder, Clearbit, and LeadForensics identify COMPANIES by reverse-looking up IP addresses. They\'re built for B2B SaaS tracking business visitors. You get results like "Acme Corp visited your site"—but no contact info. NurturelyX uses identity resolution to identify individual PEOPLE with full contact details: name, email, phone, address. We\'re built for industries that sell to consumers (home services, real estate, automotive), not companies. You get "Sarah Johnson is shopping for a vehicle, here\'s her phone number"—that\'s an actual lead you can call.'
      },
      {
        question: 'Is this my data, or am I buying leads from you?',
        answer: 'This is 100% YOUR first-party data. When businesses visit YOUR website, that\'s YOUR visitor data. We don\'t sell leads—we identify YOUR anonymous visitors. Under legitimate business interest (GDPR Article 6(1)(f)), you have the legal right to know who\'s engaging with your automotive business. These leads belong to you, not us.'
      },
      {
        question: 'How is this different from buying lead lists?',
        answer: 'Completely different. Lead lists are cold contacts who\'ve never heard of you. Identity resolution reveals people who ALREADY visited YOUR website, viewed YOUR vehicles/services, and showed real interest. This is warm, first-party data from YOUR domain. You\'re not buying leads—you\'re unlocking visitor identities you already own the rights to.'
      },
      {
        question: 'How can dealerships use visitor identification?',
        answer: 'Identify businesses researching fleet vehicles, service departments tracking maintenance needs, and commercial buyers comparing models. This is YOUR visitor data from YOUR website.'
      },
      {
        question: 'What automotive prospects can I identify?',
        answer: 'Fleet managers, business owners researching commercial vehicles, companies needing service, and B2B automotive buyers - all from YOUR website traffic.'
      },
      {
        question: 'Is visitor identification legal and privacy-compliant?',
        answer: 'Yes—this is YOUR first-party data from YOUR website. Under GDPR Article 6(1)(f) legitimate interest, you have the legal right to identify business visitors to your automotive site. We\'re not tracking people across the web—we\'re revealing who visited YOUR domain. Fully compliant with GDPR, CCPA, and all privacy regulations. You own this data.'
      }
    ],
    testimonials: [
      {
        quote: "Identified 67 fleet managers researching our commercial vehicles. These are 6-figure deals we wouldn't have known about.",
        name: "Tom B.",
        company: "Commercial Vehicle Dealer",
        industry: "Automotive"
      }
    ]
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    headline: 'Identify Healthcare Organizations Researching Your Services',
    subheadline: 'Track B2B healthcare prospects, medical device buyers, and healthcare facilities visiting your website.',
    painPoints: [
      '86% of healthcare B2B website visitors research anonymously',
      'Medical device sales cycles with unknown prospects',
      'Healthcare facility purchasing decisions without contact',
      'Lost opportunities in medical supply and service sales'
    ],
    avgConversionRate: 1,
    avgTransactionValue: 75000,
    benefits: [
      'Identify hospitals and clinics researching medical equipment',
      'Track healthcare facility decision-makers',
      'B2B medical device sales intelligence',
      'Healthcare IT and software buyer identification'
    ],
    faqs: [
      {
        question: 'How is this different from LeadFeeder, Clearbit, or other visitor tracking tools?',
        answer: 'Completely different. IP-based tools like LeadFeeder, Leadfeeder, Clearbit, and LeadForensics identify COMPANIES by reverse-looking up IP addresses. They\'re built for B2B SaaS tracking business visitors. You get results like "Acme Corp visited your site"—but no contact info. NurturelyX uses identity resolution to identify individual PEOPLE with full contact details: name, email, phone, address. We\'re built for industries that sell to consumers and individual healthcare professionals, not just companies. You get "Sarah Johnson is researching healthcare products, here\'s her phone number"—that\'s an actual lead you can call.'
      },
      {
        question: 'Is this my data, or am I buying leads from you?',
        answer: 'This is 100% YOUR first-party data. When businesses visit YOUR website, that\'s YOUR visitor data. We don\'t sell leads—we identify YOUR anonymous visitors. Under legitimate business interest (GDPR Article 6(1)(f)), you have the legal right to know who\'s engaging with your healthcare business. These leads belong to you, not us.'
      },
      {
        question: 'How is this different from buying lead lists?',
        answer: 'Completely different. Lead lists are cold contacts who\'ve never heard of you. Identity resolution reveals people who ALREADY visited YOUR website, viewed YOUR healthcare products/services, and showed real interest. This is warm, first-party data from YOUR domain. You\'re not buying leads—you\'re unlocking visitor identities you already own the rights to.'
      },
      {
        question: 'How does visitor identification work for healthcare businesses?',
        answer: 'We identify healthcare organizations (hospitals, clinics, medical practices) visiting your B2B healthcare website, revealing decision-maker contacts. This is YOUR visitor data from YOUR website.'
      },
      {
        question: 'Is this HIPAA compliant?',
        answer: 'Yes. We identify YOUR website visitors researching B2B healthcare products/services using verified databases - no patient data is collected. This is YOUR first-party data under GDPR Article 6(1)(f) legitimate interest. You have the legal right to know who\'s researching your healthcare solutions.'
      },
      {
        question: 'What healthcare prospects can I identify?',
        answer: 'Hospitals, clinics, medical practices, healthcare facilities, medical device buyers, and healthcare IT decision-makers - all from YOUR website traffic.'
      }
    ],
    testimonials: [
      {
        quote: "Found 43 hospitals viewing our medical equipment pages. These are qualified B2B leads with real purchasing intent.",
        name: "Dr. Lisa K.",
        company: "Medical Device Manufacturer",
        industry: "Healthcare"
      }
    ]
  }
};

export const getIndustryData = (industryId: string): IndustryData | undefined => {
  return industryData[industryId];
};

export const getAllIndustries = (): IndustryData[] => {
  return Object.values(industryData);
};
