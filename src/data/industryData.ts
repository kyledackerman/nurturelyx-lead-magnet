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
    ],
    caseStudies: [
      {
        company: "Thompson & Associates Law Firm",
        industry: "Corporate Law",
        challenge: "Spending $180,000 annually on legal marketing across Google Ads, content marketing, and sponsorships, but only capturing 1-2% of website traffic as actual leads. High-value corporate clients were researching services extensively but rarely filling out contact forms.",
        solution: "Implemented visitor identification to reveal which companies were researching specific practice areas. Set up automated lead scoring based on pages viewed (M&A, corporate governance, contract law) and integrated with their client intake CRM for immediate attorney assignment.",
        results: [
          { metric: "New Client Revenue", value: "$847K", icon: "revenue" },
          { metric: "Qualified Leads/Month", value: "142", icon: "leads" },
          { metric: "Average Response Time", value: "3.2 hrs", icon: "time" },
          { metric: "Client Acquisition Cost", value: "-64%", icon: "growth" }
        ],
        quote: "We were shocked to discover that 89 companies had researched our M&A practice in just one month—companies we had zero visibility into before. The first identified lead we called turned into a $340,000 engagement. This technology paid for itself within 2 weeks.",
        timeframe: "6-Month Results"
      },
      {
        company: "Midwest Personal Injury Law Group",
        industry: "Personal Injury Law",
        challenge: "Highly competitive personal injury market with dozens of competitors bidding on the same keywords. Despite ranking well organically and spending $8K/month on PPC, case inquiries were declining. Most website visitors were comparison shopping multiple firms before deciding.",
        solution: "Deployed visitor identification with real-time SMS alerts when someone viewed their 'Free Case Evaluation' or specific injury type pages (car accidents, medical malpractice, workplace injury). Trained intake coordinators to reach out within 60 minutes with personalized, consultative approach.",
        results: [
          { metric: "Signed Cases", value: "+127%", icon: "growth" },
          { metric: "Case Value", value: "$1.9M", icon: "revenue" },
          { metric: "Intake Contact Rate", value: "73%", icon: "leads" },
          { metric: "First Contact Time", value: "52 min", icon: "time" }
        ],
        quote: "Speed to contact is everything in personal injury. Before, we only knew about prospects who called or filled forms—maybe 2-3% of traffic. Now we're calling 70+ qualified prospects per week within an hour of their visit. Our case signing rate increased 127% in 4 months.",
        timeframe: "4-Month Results"
      }
    ],
    statistics: {
      marketSize: "$437B",
      growthRate: "3.1% CAGR",
      data: [
        {
          value: "89%",
          label: "Anonymous Legal Research Rate",
          context: "Nearly 9 out of 10 visitors to law firm websites research legal services without ever making contact. These prospects compare multiple firms, read practice area descriptions, review attorney bios, and leave—representing the largest opportunity gap in legal marketing.",
          source: "Legal Marketing Association Industry Report 2024"
        },
        {
          value: "$247,000",
          label: "Annual Lost Revenue Per Law Firm",
          context: "Mid-size law firms with 3,000+ monthly website visitors lose an average of $247K annually from unidentified prospects. For larger firms with diverse practice areas, this number exceeds $500K+.",
          source: "NurturelyX Legal Industry Analysis 2024"
        },
        {
          value: "3-7 days",
          label: "Legal Decision Timeline",
          context: "Business clients typically evaluate and select legal representation within 3-7 days of initiating research. Firms that make contact within 4 hours are 9x more likely to win the engagement than those who wait 24+ hours.",
          source: "Legal Client Acquisition Study 2024"
        },
        {
          value: "$25,000",
          label: "Average Legal Engagement Value",
          context: "The average business legal engagement is valued at $25,000, with corporate law matters ranging from $50K-$500K+ and litigation cases often exceeding $100K. Personal injury contingency cases average $35K in legal fees.",
          source: "Law Firm Economics Survey"
        },
        {
          value: "12-18%",
          label: "Typical Identification Rate",
          context: "Law firms successfully identify 12-18% of anonymous website traffic with complete contact information. For a firm with 5,000 monthly visitors, that's 600-900 qualified leads per month that would otherwise remain invisible.",
          source: "Legal Technology Benchmarks"
        },
        {
          value: "4.2x",
          label: "Warm Lead Conversion Rate",
          context: "Prospects identified through visitor tracking convert at 4.2x higher rates than cold outreach or purchased lead lists. These are individuals actively researching your specific practice areas with demonstrated interest.",
          source: "Legal Lead Conversion Analysis"
        }
      ]
    },
    contentSections: [
      {
        heading: "Why Law Firms Struggle to Capture Online Leads",
        content: [
          "The legal services industry faces a unique challenge: potential clients conduct extensive research before making contact, often spending 20-40 minutes reviewing practice areas, attorney credentials, case results, and firm credentials across multiple law firm websites. Unlike impulse purchases, legal services involve high-stakes decisions, complex evaluations, and significant financial commitments.",
          "This extended research phase creates massive blind spots for law firms. Traditional analytics tools like Google Analytics reveal traffic volumes and popular pages, but they cannot identify WHO these visitors are or provide contact information for follow-up. A firm might see 5,000 monthly visitors but only receive 50-100 actual inquiries, leaving 98% of traffic completely unactionable.",
          "The problem intensifies in competitive practice areas like personal injury, family law, and business litigation. Prospects actively compare multiple firms, read reviews, evaluate experience levels, and assess specializations—all without revealing their identity. By the time they decide to make contact, they've already narrowed their choices, and firms without early engagement miss the opportunity to influence the decision."
        ]
      },
      {
        heading: "The Financial Impact of Anonymous Legal Website Traffic",
        content: [
          "Most law firms dramatically underestimate the revenue impact of unidentified website visitors. Consider the economics: A mid-size firm with a $200,000 annual marketing budget might generate 8,000 monthly website visitors. At a typical 2% conversion rate, that yields 160 inquiries per month. But what about the other 7,840 visitors?",
          "Research shows that 40-50% of legal website traffic represents genuinely qualified prospects—individuals or businesses actively seeking legal representation. If 3,920 monthly visitors (50%) are qualified prospects, and the firm successfully identifies just 15% of them (588 leads) with an average engagement value of $25,000 and a 10% close rate, that represents $1.47 million in potential annual revenue being lost.",
          "The opportunity cost extends far beyond immediate case revenue. Anonymous visitors who select competitors become part of their client base for years, potentially providing referrals and repeat business. High-value corporate clients who weren't followed up with might have generated $100K-$500K in ongoing legal work. Without identification technology, firms never know what premium opportunities slipped through their marketing funnel."
        ]
      },
      {
        heading: "How Visitor Identification Technology Works for Law Firms",
        content: [
          "Visitor identification for law firms works through sophisticated identity resolution algorithms that match anonymous website visitors with comprehensive legal and business contact databases. When someone visits your website, the technology captures digital identifiers (IP address, device fingerprint, browser metadata, behavioral patterns) and cross-references this data against billions of verified business and consumer records.",
          "For law firms, this means identifying not just company names, but actual decision-makers: CEOs researching corporate counsel, HR directors seeking employment law advice, individuals facing personal legal matters, and business owners evaluating litigation options. The system reveals complete contact details including name, title, phone number, email, company information, and location—everything needed for strategic outreach.",
          "The technology operates continuously in real-time without affecting website performance or user experience. Identified prospects appear in your dashboard immediately, categorized by practice area interest, urgency level, and engagement quality. High-priority leads (those viewing 'Contact Us,' specific case type pages, or spending 10+ minutes on site) can trigger instant alerts to intake coordinators or practice area attorneys for immediate response."
        ]
      },
      {
        heading: "Best Practices for Converting Identified Legal Leads",
        content: [
          "Identifying website visitors is only the first step—converting them into retained clients requires a strategic, personalized approach that respects the consultative nature of legal services. The most successful law firms follow these proven strategies: Speed matters immensely. Research consistently shows that contacting identified leads within 2-4 hours increases engagement rates by 8-9x compared to 24-hour delays. For time-sensitive matters (personal injury, criminal defense, family law emergencies), response within 30-60 minutes is ideal.",
          "Personalization transforms cold outreach into warm conversations. Rather than generic sales pitches, reference the specific content they viewed: 'I noticed you were researching our corporate M&A practice. Given your company's industry and growth stage, I wanted to reach out personally to discuss how we've helped similar businesses navigate acquisitions.' This contextual approach demonstrates genuine interest and relevance, increasing connection rates by 50-70%.",
          "Lead scoring and prioritization ensure your intake team focuses on the highest-value opportunities first. Develop scoring rules based on: practice area viewed (weight high-value areas like corporate law more heavily), time on site (10+ minutes indicates serious interest), repeat visits (multiple sessions show ongoing consideration), and specific pages viewed (pricing, attorney bios, case results indicate decision-making mode).",
          "Integration with practice management systems prevents leads from falling through cracks and enables sophisticated tracking. Sync identified visitors to your legal CRM, automatically create intake tasks, assign to appropriate practice area attorneys, set follow-up reminders, and track conversion outcomes. The most successful firms achieve 300-500% marketing ROI within 90-120 days by implementing systematic lead management workflows around visitor identification data."
        ]
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
    ],
    caseStudies: [
      {
        company: "Metro Commercial Properties",
        industry: "Commercial Real Estate",
        challenge: "High-end commercial property listings attracted thousands of monthly visitors, but only 2-3% converted to actual inquiries. Decision-makers from corporations, investors, and business owners were extensively researching properties but rarely reached out, going to competitors who followed up faster.",
        solution: "Implemented visitor identification with detailed property-level tracking. Set up automated lead alerts when C-level executives or business owners viewed listings multiple times. Integrated identified leads into their commercial CRM with property interest data for personalized outreach.",
        results: [
          { metric: "Closed Deals", value: "$4.2M", icon: "revenue" },
          { metric: "Qualified Leads/Month", value: "284", icon: "leads" },
          { metric: "Avg. Follow-up Time", value: "2.3 hrs", icon: "time" },
          { metric: "Lead-to-Close Rate", value: "+156%", icon: "growth" }
        ],
        quote: "We discovered that CFOs and VPs from Fortune 1000 companies were viewing our Class A office spaces—prospects worth millions in commissions. One identified lead resulted in a $12.5M property sale. This technology transformed our entire lead generation strategy.",
        timeframe: "12-Month Results"
      },
      {
        company: "Coastal Residential Realty",
        industry: "Luxury Residential Real Estate",
        challenge: "Luxury home market with $2M-$8M listings and long sales cycles. Qualified buyers were viewing properties online extensively but rarely attending open houses or requesting showings initially. Agents had no way to know who was seriously interested versus casual browsers.",
        solution: "Deployed visitor identification to reveal individuals viewing luxury listings. Created buyer profiles based on properties viewed, time on site, and return visits. Trained agents to reach out with market insights, comparable sales data, and private showing invitations rather than pushy sales tactics.",
        results: [
          { metric: "Luxury Home Sales", value: "$18.7M", icon: "revenue" },
          { metric: "Buyer Contacts", value: "127", icon: "leads" },
          { metric: "Showing Request Rate", value: "+214%", icon: "growth" },
          { metric: "Contact-to-Close Time", value: "38 days", icon: "time" }
        ],
        quote: "Luxury buyers don't fill out online forms—they're private, they research extensively, and they expect discreet, personalized service. Knowing who viewed which properties lets us approach them consultatively with relevant market data. We've closed 7 deals in 6 months that started with identified website visitors.",
        timeframe: "6-Month Results"
      }
    ],
    statistics: {
      marketSize: "$153B",
      growthRate: "4.7% CAGR",
      data: [
        {
          value: "94%",
          label: "Anonymous Property Browser Rate",
          context: "More than 94% of real estate website visitors browse properties without ever submitting a contact form or requesting information. These anonymous browsers represent the largest untapped lead source in residential and commercial real estate.",
          source: "National Association of Realtors Digital Report 2024"
        },
        {
          value: "$195,000",
          label: "Annual Commission Loss Per Agent",
          context: "Top-producing real estate agents with high-traffic property websites lose an average of $195K annually in potential commissions from unidentified prospects. For commercial brokers, this number exceeds $400K+.",
          source: "Real Estate Technology ROI Analysis 2024"
        },
        {
          value: "8-12 weeks",
          label: "Typical Property Research Phase",
          context: "Home buyers and commercial real estate prospects research properties for 8-12 weeks before making first contact with an agent. During this time, they visit 15-30 listings across multiple sites. Agents who engage early in the research phase have 5.3x higher close rates.",
          source: "Real Estate Buyer Behavior Study"
        },
        {
          value: "$15,000",
          label: "Average Commission Per Sale",
          context: "The average residential real estate commission is $15,000 per transaction at 5-6% of sale price. Commercial real estate commissions range from $25K to $500K+ depending on property value and deal complexity.",
          source: "Real Estate Commission Analysis"
        },
        {
          value: "18-22%",
          label: "Property Visitor Identification Rate",
          context: "Real estate websites successfully identify 18-22% of anonymous property viewers with complete contact information. For an agent with 3,000 monthly listing views, that's 540-660 qualified buyer leads per month.",
          source: "Real Estate Technology Benchmarks"
        },
        {
          value: "72 hours",
          label: "Critical Response Window",
          context: "Property buyers who are contacted within 72 hours of viewing listings are 6.4x more likely to engage than those contacted after a week. Speed to contact is the single biggest predictor of conversion in real estate lead follow-up.",
          source: "Real Estate Lead Response Management Study"
        }
      ]
    },
    contentSections: [
      {
        heading: "Why Real Estate Professionals Lose Qualified Buyers Online",
        content: [
          "The real estate industry has embraced digital marketing, with 97% of buyers starting their property search online. However, this digital transformation created an unexpected challenge: massive anonymous traffic that generates minimal lead capture. Buyers extensively research properties, neighborhoods, market trends, and agent credentials across multiple websites without revealing their identity or intent.",
          "This anonymous browsing behavior stems from buyer psychology. Property purchases are highly emotional, high-stakes decisions. Buyers want to research privately, compare options without pressure, and maintain control over the timing and nature of agent contact. They'll view 15-30 properties online, spend hours comparing features and pricing, and eliminate dozens of options—all before ever expressing interest.",
          "For real estate professionals, this creates a devastating blind spot. Traditional lead capture methods (contact forms, newsletter signups, property inquiry buttons) convert only 1-3% of website traffic. An agent with a strong online presence generating 5,000 monthly property views might capture only 50-150 leads, leaving 97% of traffic completely unidentifiable and unactionable. These anonymous visitors represent millions in potential commission revenue being lost to competitors who follow up more aggressively."
        ]
      },
      {
        heading: "The Economics of Anonymous Real Estate Traffic",
        content: [
          "Most real estate professionals significantly underestimate the financial impact of unidentified website visitors. Let's examine the math for a top-producing residential agent: With 3,000 monthly property listing views and a typical 2% conversion rate, you capture 60 inquiries per month. But what about the other 2,940 viewers?",
          "Research indicates that 50-60% of real estate website traffic represents genuinely qualified prospects actively searching for properties in your market. If 1,764 monthly visitors (60%) are qualified buyers, and you successfully identify 20% of them (353 leads) with an average commission of $15,000 and a 3% close rate, that represents $635,400 in potential annual commission revenue being lost.",
          "For commercial real estate brokers, the numbers are even more dramatic. A commercial property website generating 2,000 monthly views with 50% qualified prospects (1,000) could yield 200 identified leads at 20% identification rate. With average commercial commissions of $75,000 and a 5% close rate, that's $7.5 million in potential annual commission from traffic that would otherwise remain completely anonymous. The opportunity cost of not identifying these visitors is staggering."
        ]
      },
      {
        heading: "How Visitor Identification Works for Real Estate",
        content: [
          "Visitor identification technology for real estate operates through advanced identity resolution that matches anonymous property viewers with verified homeowner and business contact databases. When someone views your listings, the system captures their digital footprint (IP address, device information, browsing patterns, location data) and cross-references it against hundreds of millions of verified consumer and business records.",
          "For real estate professionals, this means identifying actual property buyers: individuals searching for homes, investors researching rental properties, business owners evaluating commercial spaces, and corporations planning relocations. The system reveals complete contact details including name, phone, email, current address, and demographic information—everything needed for strategic, personalized outreach.",
          "The technology works continuously in real-time across all your property listings without impacting site performance or user experience. Identified prospects appear in your dashboard instantly, organized by property interest, viewing behavior, and engagement level. High-intent signals (viewing multiple properties, returning visits, extended time on listings, viewing neighborhood/school information) trigger priority alerts for immediate agent follow-up."
        ]
      },
      {
        heading: "Converting Identified Property Viewers Into Closed Deals",
        content: [
          "Identifying property viewers is just the beginning—converting them into clients requires strategic, consultative engagement that respects the property search process. The most successful real estate professionals follow these proven approaches: Timing is everything. Contact identified leads within 24-48 hours of their property views for residential buyers, or within 4-8 hours for commercial prospects. This speed demonstrates responsiveness without being overly aggressive.",
          "Personalization dramatically improves engagement rates. Rather than generic 'Just checking in' messages, reference specific properties they viewed: 'I noticed you were looking at the 4-bedroom colonial on Oak Street. I wanted to share that it just had a price reduction, and I have some comparable sales data that might interest you.' This contextual approach shows genuine attention and creates natural conversation openings.",
          "Value-first outreach builds trust and credibility. Instead of immediately pushing for showings, offer valuable information: market trend reports, neighborhood guides, school district data, or recent comparable sales. Position yourself as a knowledgeable market advisor rather than a pushy salesperson. This consultative approach increases response rates by 60-80%.",
          "Multi-touch follow-up sequences maximize conversion over time. Real estate decisions take weeks or months. Implement systematic touch points: initial outreach within 48 hours, valuable market insights at day 5, new listing alerts matching their interests at day 10, and monthly market updates until they engage. The most successful agents see 400-600% ROI by maintaining consistent, value-driven communication with identified prospects throughout their entire property search journey."
        ]
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
    ],
    caseStudies: [
      {
        company: "ProFlow Plumbing & Drain",
        industry: "Plumbing Services",
        challenge: "Spending $12,000/month on Google Ads for emergency plumbing services, but 85% of website visitors never called. Competitors with faster response times were winning jobs despite ProFlow's superior service and reviews. Emergency service page had 800+ monthly views but only 40-50 calls.",
        solution: "Implemented visitor identification with instant SMS alerts when someone viewed emergency service pages (burst pipes, water heater failure, drain clogs). Dispatchers trained to call identified leads within 15-30 minutes with availability and pricing transparency.",
        results: [
          { metric: "Emergency Job Revenue", value: "$384K", icon: "revenue" },
          { metric: "New Leads/Month", value: "287", icon: "leads" },
          { metric: "Avg Response Time", value: "18 min", icon: "time" },
          { metric: "Booking Rate", value: "+192%", icon: "growth" }
        ],
        quote: "Emergency plumbing is all about speed. Before, we only knew about people who called—maybe 15% of our traffic. Now we're calling prospects within 20 minutes of their emergency page visit. Our booking rate nearly tripled, and we've become the go-to plumber in our area because we respond faster than anyone else.",
        timeframe: "6-Month Results"
      },
      {
        company: "Summit Roofing Contractors",
        industry: "Commercial Roofing",
        challenge: "Commercial roofing projects worth $50K-$300K were being researched by property managers and facility directors, but less than 2% were converting to RFP requests. Long sales cycles meant competitors who followed up more aggressively won most bids.",
        solution: "Deployed visitor identification to reveal property management companies, facility managers, and building owners researching commercial roofing services. Set up lead scoring based on pages viewed (flat roof repair, roof replacement, preventive maintenance) and company size. Sales team reached out with case studies and free roof assessments.",
        results: [
          { metric: "Contract Value", value: "$2.7M", icon: "revenue" },
          { metric: "Qualified Prospects", value: "167", icon: "leads" },
          { metric: "RFP Conversion", value: "+284%", icon: "growth" },
          { metric: "Sales Cycle", value: "-31%", icon: "time" }
        ],
        quote: "We discovered facilities managers from hospitals, schools, and corporate campuses were viewing our commercial roofing pages—prospects worth hundreds of thousands. The first identified lead we contacted turned into a $475,000 hospital roof replacement. We've closed 11 major projects in 8 months from identified website visitors.",
        timeframe: "8-Month Results"
      }
    ],
    statistics: {
      marketSize: "$538B",
      growthRate: "4.3% CAGR",
      data: [
        {
          value: "81%",
          label: "Anonymous Home Services Traffic",
          context: "More than 8 out of 10 visitors to home services websites research services without calling or submitting contact forms. These anonymous visitors represent the largest missed opportunity in plumbing, roofing, remodeling, landscaping, and other trades.",
          source: "Home Services Digital Marketing Report 2024"
        },
        {
          value: "$142,000",
          label: "Annual Revenue Lost Per Contractor",
          context: "Mid-size home services contractors with 4,000+ monthly website visitors lose an average of $142K annually from unidentified prospects. For multi-service contractors, this number exceeds $250K+.",
          source: "Home Services Industry Economics Study"
        },
        {
          value: "24-48 hours",
          label: "Emergency Service Decision Window",
          context: "Homeowners with emergency needs (burst pipes, roof leaks, HVAC failures) make decisions within 24-48 hours. Contractors who respond within 1 hour have 12x higher booking rates than those who respond after 24 hours. Speed to contact determines who wins the job.",
          source: "Home Services Customer Behavior Analysis"
        },
        {
          value: "$6,500",
          label: "Average Home Service Job Value",
          context: "The average home services job is valued at $6,500, with emergency repairs ranging $500-$3,000, system replacements $5,000-$15,000, and major renovations $25,000-$100,000+. Commercial property maintenance contracts average $50K-$300K annually.",
          source: "Home Services Industry Benchmarks"
        },
        {
          value: "20-28%",
          label: "Typical Identification Rate",
          context: "Home services websites successfully identify 20-28% of anonymous traffic with complete contact information. For a contractor with 5,000 monthly visitors, that's 1,000-1,400 qualified leads per month that would otherwise remain invisible.",
          source: "Home Services Technology Benchmarks"
        },
        {
          value: "3-5 contractors",
          label: "Average Comparison Shopping",
          context: "Homeowners and property managers typically research 3-5 contractors before making a decision. Without early engagement, you're competing against competitors who are already building relationships with prospects. First contact creates massive competitive advantage.",
          source: "Consumer Home Services Research Study"
        }
      ]
    },
    contentSections: [
      {
        heading: "Why Home Services Contractors Lose Online Leads",
        content: [
          "The home services industry faces a unique digital marketing challenge: homeowners and property managers conduct extensive online research before making contact, but they rarely fill out forms or call during the research phase. Whether searching for emergency repairs, planned upgrades, or routine maintenance, consumers visit multiple contractor websites, compare pricing, read reviews, and evaluate expertise—all without revealing their identity.",
          "This research-heavy behavior creates a massive visibility gap for contractors. Traditional lead generation relies on inbound calls, contact form submissions, or quote requests. But these conversion actions represent only 2-5% of total website traffic. A plumbing contractor generating 3,000 monthly website visitors might receive only 60-150 actual inquiries, leaving 95%+ of traffic completely unidentifiable and unactionable.",
          "The problem intensifies during peak seasons and emergency situations. Storm damage, heat waves, and cold snaps drive massive traffic spikes to roofing, HVAC, and plumbing websites. Emergency service pages might receive hundreds of views, but only a fraction convert to calls—the rest go to competitors who follow up faster or maintain better visibility throughout the research process."
        ]
      },
      {
        heading: "The Financial Impact of Anonymous Home Services Traffic",
        content: [
          "Most home services contractors significantly underestimate the revenue impact of unidentified website visitors. Consider the economics for a mid-size HVAC contractor: With $150,000 in annual marketing spend generating 5,000 monthly website visitors at a 3% conversion rate, you capture 150 leads per month. But what about the other 4,850 visitors?",
          "Industry research shows that 60-70% of home services traffic represents genuinely qualified prospects—homeowners with active maintenance needs, emergency situations, or planned upgrade projects. If 3,395 monthly visitors (70%) are qualified prospects, and you successfully identify 25% of them (849 leads) with an average job value of $6,500 and an 8% close rate, that represents $5.3 million in potential annual revenue being lost.",
          "For commercial contractors (roofing, plumbing, landscaping), the numbers are even more dramatic. Commercial property maintenance contracts range from $50K-$300K annually. Missing just one identified commercial prospect per month could represent $600K-$3.6M in lost annual contract value. The opportunity cost of not identifying these visitors is devastating to long-term business growth and profitability."
        ]
      },
      {
        heading: "How Visitor Identification Works for Home Services",
        content: [
          "Visitor identification technology for home services operates through sophisticated identity resolution algorithms that match anonymous website visitors with verified homeowner and property management databases. When someone visits your contractor website, the system captures digital identifiers (IP address, device fingerprint, location data, behavioral patterns) and cross-references this against hundreds of millions of verified consumer and business records.",
          "For home services contractors, this means identifying actual decision-makers: homeowners with maintenance needs, property managers overseeing multiple buildings, facility directors at commercial properties, and HOA board members managing community infrastructure. The system reveals complete contact details including name, phone number, email, property address, and property details—everything needed for strategic, personalized outreach.",
          "The technology works continuously in real-time across all your service pages without impacting website performance or user experience. Identified prospects appear in your dashboard instantly, categorized by service interest, urgency level, and engagement quality. High-priority signals (emergency service page visits, multiple return visits, long session duration, viewing pricing or financing pages) trigger instant alerts to dispatchers or sales teams for immediate follow-up."
        ]
      },
      {
        heading: "Converting Identified Leads Into Booked Jobs",
        content: [
          "Identifying website visitors is only half the equation—converting them into booked jobs requires strategic, service-focused engagement that respects the home services buying process. The most successful contractors follow these proven strategies: Speed is absolutely critical, especially for emergency services. Contact identified leads within 30-60 minutes for emergency situations (burst pipes, roof leaks, HVAC failures) and within 2-4 hours for non-emergency inquiries. This rapid response demonstrates reliability and wins jobs.",
          "Personalization transforms cold outreach into warm conversations. Reference the specific services they researched: 'I saw you were looking at our emergency drain cleaning services. I wanted to reach out personally—we have availability this afternoon and can typically resolve most drain clogs within 1-2 hours.' This contextual, helpful approach feels like customer service rather than sales.",
          "Value-first communication builds trust and credibility. Instead of pushy sales tactics, offer genuine value: 'I noticed you were researching roof replacement options. I wanted to share our free roof assessment offer—no obligation, just a professional evaluation of your roof's condition and expected remaining life.' This consultative approach increases response rates by 70-90%.",
          "Lead prioritization ensures your team focuses on the highest-value opportunities first. Develop scoring rules: emergency service page visitors get highest priority (contact within 30 min), visitors viewing pricing/financing pages next (contact within 2 hours), general service research (contact within 24 hours), and returning visitors get special attention (indicates serious consideration). The most successful contractors achieve 400-600% marketing ROI within 90 days by implementing systematic workflows around visitor identification data combined with rapid, personalized follow-up."
        ]
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
