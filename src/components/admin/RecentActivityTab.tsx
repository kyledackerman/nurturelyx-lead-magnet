import { RecentlyAuditedDomainsTable } from "./RecentlyAuditedDomainsTable";
import { RecentlyUpdatedDomainsTable } from "./RecentlyUpdatedDomainsTable";

export const RecentActivityTab = () => {
  return (
    <div className="space-y-6">
      <RecentlyAuditedDomainsTable />
      <RecentlyUpdatedDomainsTable />
    </div>
  );
};
