const statusMap: Record<string, string> = {
  Interested: "badge badge-blue",
  Contacted: "badge badge-amber",
  Visited:   "badge badge-purple",
  Offered:   "badge badge-green",
  Committed: "badge",
  Declined:  "badge badge-red",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={statusMap[status] || "badge badge-gray"}>
      {status}
    </span>
  );
}
