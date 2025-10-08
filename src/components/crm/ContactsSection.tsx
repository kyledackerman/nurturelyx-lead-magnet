import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Mail, Phone, Linkedin, Edit, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { auditService } from "@/services/auditService";

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
}

export default function ContactsSection({ prospectActivityId, reportId }: ContactsSectionProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  
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

    // Real-time subscription
    const channel = supabase
      .channel(`contacts-${prospectActivityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prospect_contacts',
          filter: `prospect_activity_id=eq.${prospectActivityId}`
        },
        () => {
          fetchContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }

    setSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();

      const contactData = {
        prospect_activity_id: prospectActivityId,
        report_id: reportId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
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
          `Updated contact: ${firstName} ${lastName}${title ? ` (${title})` : ""}`
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
          `Added contact: ${firstName} ${lastName}${title ? ` (${title})` : ""}`
        );

        toast.success("Contact added");
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
                  <Label htmlFor="lastName">Last Name *</Label>
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
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                  disabled={saving}
                />
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
                  disabled={saving || !firstName.trim() || !lastName.trim()}
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
                      {contact.first_name} {contact.last_name}
                    </p>
                    {contact.is_primary && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        Primary
                      </Badge>
                    )}
                  </div>
                  {contact.title && (
                    <p className="text-sm text-muted-foreground mb-2">{contact.title}</p>
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
