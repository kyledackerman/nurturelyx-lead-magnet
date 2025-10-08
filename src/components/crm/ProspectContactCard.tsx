import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Linkedin, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  linkedin_url: string | null;
  is_primary: boolean;
}

interface ProspectContactCardProps {
  contacts: Contact[];
}

export function ProspectContactCard({ contacts }: ProspectContactCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (contacts.length === 0) {
    return (
      <Card className="p-3 bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">No contacts added yet</p>
      </Card>
    );
  }

  const primaryContact = contacts.find(c => c.is_primary) || contacts[0];

  return (
    <div className="space-y-2">
      <Card className="p-3 bg-muted/30">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold">
                {primaryContact.first_name} {primaryContact.last_name}
              </h4>
              {primaryContact.is_primary && (
                <Badge variant="secondary" className="text-xs">Primary</Badge>
              )}
            </div>
            {primaryContact.title && (
              <p className="text-xs text-muted-foreground mt-1">{primaryContact.title}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 mt-3">
          {primaryContact.email && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-xs truncate">{primaryContact.email}</span>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => copyToClipboard(primaryContact.email!, `email-${primaryContact.id}`)}
                >
                  {copiedField === `email-${primaryContact.id}` ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => window.location.href = `mailto:${primaryContact.email}`}
                >
                  <Mail className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {primaryContact.phone && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-xs truncate">{primaryContact.phone}</span>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => copyToClipboard(primaryContact.phone!, `phone-${primaryContact.id}`)}
                >
                  {copiedField === `phone-${primaryContact.id}` ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => window.location.href = `tel:${primaryContact.phone}`}
                >
                  <Phone className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {primaryContact.linkedin_url && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Linkedin className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-xs truncate">LinkedIn Profile</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 shrink-0"
                onClick={() => window.open(primaryContact.linkedin_url!, '_blank')}
              >
                <Linkedin className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      {contacts.length > 1 && (
        <p className="text-xs text-muted-foreground">
          +{contacts.length - 1} more contact{contacts.length > 2 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
