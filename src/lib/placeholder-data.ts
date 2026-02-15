export const dashboardMetrics = [
  {
    id: "revenue",
    label: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1% from last month",
  },
  {
    id: "users",
    label: "Active Users",
    value: "+2350",
    change: "+180.1% from last month",
  },
  {
    id: "orders",
    label: "New Orders",
    value: "+12,234",
    change: "+19% from last month",
  },
  {
    id: "growth",
    label: "Growth",
    value: "+57.3%",
    change: "+2.1% from last month",
  },
];

export type User = {
  id: string;
  name: string;
  avatarId: string;
  role: string;
  status: "Active" | "Inactive";
};

export const users: User[] = [
  {
    id: "1",
    name: "Olivia Martin",
    avatarId: "avatar2",
    role: "Admin",
    status: "Active",
  },
  {
    id: "2",
    name: "Jackson Lee",
    avatarId: "avatar3",
    role: "Editor",
    status: "Active",
  },
  {
    id: "3",
    name: "Isabella Nguyen",
    avatarId: "avatar4",
    role: "Contributor",
    status: "Inactive",
  },
  {
    id: "4",
    name: "William Kim",
    avatarId: "avatar5",
    role: "Editor",
    status: "Active",
  },
  {
    id: "5",
    name: "Sofia Davis",
    avatarId: "avatar6",
    role: "Subscriber",
    status: "Active",
  },
];

export const overviewData = [
  { month: "January", revenue: 4500, profit: 2400, users: 1200 },
  { month: "February", revenue: 4200, profit: 2210, users: 1500 },
  { month: "March", revenue: 5200, profit: 3200, users: 1800 },
  { month: "April", revenue: 4800, profit: 3000, users: 2100 },
  { month: "May", revenue: 5800, profit: 3400, users: 2350 },
  { month: "June", revenue: 5500, profit: 3600, users: 2500 },
];
