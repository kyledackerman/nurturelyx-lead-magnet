import { Author } from "@/data/authors";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin, ExternalLink } from "lucide-react";

interface AuthorBioProps {
  author: Author;
}

export const AuthorBio = ({ author }: AuthorBioProps) => {
  const initials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="my-8 border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="flex gap-4 items-start">
          <Avatar className="w-16 h-16 ring-2 ring-primary/10">
            <AvatarImage src={author.image} alt={author.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">About the Author</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {author.name} • {author.jobTitle}
            </p>
            <p className="text-sm mb-3 leading-relaxed">{author.bio}</p>
            
            {author.expertise && author.expertise.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {author.expertise.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2 py-1 bg-primary/5 text-primary rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
            
            {author.socialLinks && (
              <div className="flex gap-3">
                {author.socialLinks.linkedin && (
                  <a
                    href={author.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {author.socialLinks.website && (
                  <a
                    href={author.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
