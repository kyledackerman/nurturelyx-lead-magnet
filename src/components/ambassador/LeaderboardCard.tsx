import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Users, DollarSign } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  ambassador_name: string;
  ambassador_email: string;
  metrics: {
    total_signups: number;
    active_domains: number;
    retention_rate: number;
    total_leads_processed: number;
    leads_per_domain: number;
    estimated_revenue_recovered: number;
  };
  composite_score: number;
  badges: string[];
}

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const getRankEmoji = (rank: number): string => {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '';
  }
};

const getBadgeEmoji = (badge: string): string => {
  const emojiMap: Record<string, string> = {
    'Retention Master': '🏆',
    'Client Keeper': '🥇',
    'Whale Hunter': '🐋',
    'Big Fish': '🎣',
    'Growth Machine': '🚀',
    'Rising Star': '📈',
    'Revenue Champion': '💰',
    'Money Maker': '💵'
  };
  return emojiMap[badge] || '⭐';
};

export function LeaderboardCard({ entry, isCurrentUser = false }: LeaderboardCardProps) {
  return (
    <Card className={`transition-all hover:shadow-lg ${isCurrentUser ? 'border-primary border-2' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-muted-foreground">
              #{entry.rank} {getRankEmoji(entry.rank)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {entry.ambassador_name}
                {isCurrentUser && <span className="ml-2 text-primary">(You)</span>}
              </h3>
              <p className="text-sm text-muted-foreground">{entry.ambassador_email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Trophy className="w-4 h-4" />
              <span className="text-sm">Overall</span>
            </div>
            <div className="text-2xl font-bold">{entry.composite_score.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>Signups</span>
            </div>
            <div className="text-xl font-semibold">{entry.metrics.total_signups}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              <span>Active</span>
            </div>
            <div className="text-xl font-semibold">{entry.metrics.active_domains}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Retention</div>
            <div className="text-xl font-semibold">{entry.metrics.retention_rate}%</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Leads</div>
            <div className="text-xl font-semibold">{formatNumber(entry.metrics.total_leads_processed)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Leads/Domain</div>
            <div className="text-xl font-semibold">{formatNumber(entry.metrics.leads_per_domain)}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="w-3 h-3" />
              <span>Recovered</span>
            </div>
            <div className="text-xl font-semibold">${formatNumber(entry.metrics.estimated_revenue_recovered)}</div>
          </div>
        </div>

        {entry.badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {entry.badges.map((badge) => (
              <Badge key={badge} variant="secondary" className="text-xs">
                {getBadgeEmoji(badge)} {badge}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
