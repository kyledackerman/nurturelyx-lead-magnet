import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "This seems like a brand new program. Should I wait until it's more established?",
    answer: "Absolutely not! Being early gives you first-mover advantage. You'll be competing against a small group of ambassadors instead of thousands. Plus, you can help shape how the program evolves. The product (NurturelyX) is proven—customers recover $50K-$500K in lost revenue. You're just getting in on the ambassador program early.",
  },
  {
    question: "How long does it take to reach Silver tier?",
    answer: "You need 100 lifetime signups. If you refer 5-10 businesses per month, you'll hit Silver in 10-20 months. Focus on quality referrals that convert and stay active.",
  },
  {
    question: "Has anyone reached Gold tier yet?",
    answer: "No. This is a brand new program and Gold tier (1,000 signups) is aspirational. It's designed for elite performers who build this into a real business. Most ambassadors should focus on reaching Silver first—that's where income truly scales.",
  },
  {
    question: "What's the difference between platform fee and per-lead tiers?",
    answer: "Platform fee tier is based on total lifetime signups (everyone you've ever closed). Per-lead tier is based on currently active domains (retention bonus). Both unlock at 100 and 1,000.",
  },
  {
    question: "Do I lose commissions if a client cancels?",
    answer: "You stop earning platform fees for that client, but you keep all previously earned commissions. This is why retention rate matters (tracked on the leaderboard).",
  },
  {
    question: "How do I get paid?",
    answer: "You earn commission credits. Use credits to purchase more leads for testing or request cash payouts (minimum $100). Payouts are processed monthly.",
  },
  {
    question: "Do I need sales experience?",
    answer: "No. We provide training, scripts, email templates, and materials. If you know business owners who could benefit from identifying their website visitors, you can succeed.",
  },
  {
    question: "Can I see who the current top ambassadors are?",
    answer: "Yes! Check the live leaderboard to see rankings and performance metrics.",
    linkText: "View Leaderboard",
    linkUrl: "/ambassador/leaderboard",
  },
  {
    question: "What if I only refer a few businesses and never hit Silver?",
    answer: "That's perfectly fine! Even 10 referrals earning you $550/month is $6,600/year in passive income. There are no quotas or penalties for staying in Bronze.",
  },
];

export function AmbassadorFAQ() {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-3">Frequently Asked Questions</h2>
        <p className="text-muted-foreground">
          Get answers to common questions about the ambassador program
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
                {faq.linkUrl && faq.linkText && (
                  <>
                    {" "}
                    <Link to={faq.linkUrl} className="text-primary hover:underline font-medium">
                      {faq.linkText}
                    </Link>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
