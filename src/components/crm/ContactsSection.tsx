import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Mail, Phone, Linkedin, Edit, Trash2, User, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { auditService } from "@/services/auditService";
import { validateSalesEmail, getEmailTypeLabel, getEmailTypeBadgeVariant } from "@/lib/emailValidation";
import { updateProspectStatus } from "@/services/prospectService";
import { getDisplayName } from "@/lib/crmHelpers";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  linkedin_url: string | null;
  notes: string | null;
  is_primary: boolean;
  created_at: string;
}

interface ContactsSectionProps {
  prospectActivityId: string;
  reportId: string;
  companyName?: string | null;
}

export default function ContactsSection({ prospectActivityId, reportId, companyName }: ContactsSectionProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [prospectStatus, setProspectStatus] = useState<string>("");
  const [markingEnriched, setMarkingEnriched] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContacts();
    fetchProspectStatus();

    // Real-time subscription removed - using CRMRealtimeContext instead
    return () => {};
  }, [prospectActivityId]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("prospect_contacts")
        .select("*")
        .eq("prospect_activity_id", prospectActivityId)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProspectStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("prospect_activities")
        .select("status")
        .eq("id", prospectActivityId)
        .single();

      if (error) throw error;
      setProspectStatus(data?.status || "");
    } catch (error) {
      console.error("Error fetching prospect status:", error);
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setTitle("");
    setLinkedinUrl("");
    setNotes("");
    setIsPrimary(false);
    setEditingContact(null);
  };

  const openAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact);
    setFirstName(contact.first_name);
    setLastName(contact.last_name);
    setEmail(contact.email || "");
    setPhone(contact.phone || "");
    setTitle(contact.title || "");
    setLinkedinUrl(contact.linkedin_url || "");
    setNotes(contact.notes || "");
    setIsPrimary(contact.is_primary);
    setShowAddDialog(true);
  };

  const saveContact = async () => {
    if (!firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    setSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();

      const contactData = {
        prospect_activity_id: prospectActivityId,
        report_id: reportId,
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        title: title.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        notes: notes.trim() || null,
        is_primary: isPrimary,
        created_by: user.user?.id,
      };

      if (editingContact) {
        // Update existing contact
        const { error } = await supabase
          .from("prospect_contacts")
          .update(contactData)
          .eq("id", editingContact.id);

        if (error) throw error;

        await auditService.logBusinessContext(
          "prospect_activities",
          prospectActivityId,
          `Updated contact: ${firstName}${lastName ? ` ${lastName}` : ''}${title ? ` (${title})` : ""}`
        );

        toast.success("Contact updated");
      } else {
        // Create new contact
        const { error } = await supabase
          .from("prospect_contacts")
          .insert(contactData);

        if (error) throw error;

        await auditService.logBusinessContext(
          "prospect_activities",
          prospectActivityId,
          `Added contact: ${firstName}${lastName ? ` ${lastName}` : ''}${title ? ` (${title})` : ""}`
        );

        // If prospect is in 'review' status, automatically update to 'enriched'
        if (prospectStatus === 'review') {
          try {
            await updateProspectStatus(prospectActivityId, 'enriched');
            setProspectStatus('enriched');
            toast.success("Contact added and prospect moved to enriched");
          } catch (error) {
            console.error("Error updating status:", error);
            toast.success("Contact added");
          }
        } else {
          toast.success("Contact added");
        }
      }

      setShowAddDialog(false);
      resetForm();
      fetchContacts();
    } catch (error) {
      console.error("Error saving contact:", error);
      toast.error("Failed to save contact");
    } finally {
      setSaving(false);
    }
  };

  const deleteContact = async (contactId: string, contactName: string) => {
    if (!confirm(`Are you sure you want to delete ${contactName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("prospect_contacts")
        .delete()
        .eq("id", contactId);

      if (error) throw error;

      await auditService.logBusinessContext(
        "prospect_activities",
        prospectActivityId,
        `Deleted contact: ${contactName}`
      );

      toast.success("Contact deleted");
      fetchContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact");
    }
  };

  const markAsEnriched = async () => {
    setMarkingEnriched(true);
    try {
      const { error } = await supabase
        .from("prospect_activities")
        .update({ status: "enriched" })
        .eq("id", prospectActivityId);

      if (error) throw error;

      await auditService.logBusinessContext(
        "prospect_activities",
        prospectActivityId,
        `Marked as enriched with ${contacts.length} contact(s)`
      );

      toast.success("Prospect marked as enriched and moved to main pipeline");
      setProspectStatus("enriched");
    } catch (error) {
      console.error("Error marking as enriched:", error);
      toast.error("Failed to mark as enriched");
    } finally {
      setMarkingEnriched(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading contacts...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Contacts</h3>
          <Badge variant="secondary">{contacts.length}</Badge>
        </div>
        <div className="flex gap-2">
          {contacts.length > 0 && prospectStatus === "enriching" && (
            <Button 
              onClick={markAsEnriched} 
              size="sm"
              variant="default"
              disabled={markingEnriched}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Enriched
            </Button>
          )}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingContact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    disabled={saving}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    disabled={saving}
                  />
                  {email && (() => {
                    const validation = validateSalesEmail(email);
                    if (!validation.isValid) {
                      return (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{validation.warning}</AlertDescription>
                        </Alert>
                      );
                    }
                    return (
                      <div className="flex items-center gap-2">
                        <Badge variant={getEmailTypeBadgeVariant(validation)}>
                          {getEmailTypeLabel(validation)}
                        </Badge>
                        {validation.emailType === 'personal' && (
                          <span className="text-xs text-muted-foreground">✓ Personal emails are great for outreach</span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="title">Title/Position</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="CEO, Marketing Director, etc."
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional information about this contact..."
                  rows={3}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPrimary"
                  checked={isPrimary}
                  onCheckedChange={(checked) => setIsPrimary(checked as boolean)}
                  disabled={saving}
                />
                <Label
                  htmlFor="isPrimary"
                  className="text-sm font-normal cursor-pointer"
                >
                  Mark as primary contact
                </Label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={saveContact}
                  disabled={saving || !firstName.trim()}
                  className="flex-1"
                >
                  {saving ? "Saving..." : editingContact ? "Update Contact" : "Add Contact"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator />

      {contacts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No contacts added yet</p>
          <p className="text-xs mt-1">Add contacts to enrich this prospect</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">
                        {getDisplayName(companyName, contact.first_name, contact.last_name, contact.email)}
                      </p>
                      {contact.is_primary && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          Primary
                        </Badge>
                      )}
                    </div>
                    {!companyName || getDisplayName(companyName, contact.first_name, contact.last_name, contact.email) !== companyName ? (
                      contact.title && (
                        <p className="text-sm text-muted-foreground mb-2">{contact.title}</p>
                      )
                    ) : (
                      <p className="text-sm text-muted-foreground mb-2">Company Contact</p>
                    )}
                    <div className="space-y-1">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <a href={`mailto:${contact.email}`} className="hover:underline">
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <a href={`tel:${contact.phone}`} className="hover:underline">
                          {contact.phone}
                        </a>
                      </div>
                    )}
                    {contact.linkedin_url && (
                      <div className="flex items-center gap-2 text-sm">
                        <Linkedin className="h-3.5 w-3.5 text-muted-foreground" />
                        <a
                          href={contact.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                  {contact.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {contact.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditDialog(contact)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      deleteContact(contact.id, `${contact.first_name} ${contact.last_name}`)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
