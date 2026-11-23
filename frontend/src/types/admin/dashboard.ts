export interface MetricCardData {
  id: string;
  label: string;
  value: string | number;
  trend?: string;
  trendType?: "positive" | "neutral" | "negative";
  badge?: string;
  iconType: "residents" | "houses" | "revenue" | "requests";
}

export interface ReminderItem {
  id: string;
  text: string;
  time: string;
  completed?: boolean;
}

export interface EstateUpdate {
  id: string;
  headlinePrefix: string;
  headlineHighlight: string;
  imageUrl: string;
  imageAlt: string;
  leadParagraph: string;
  bodyParagraph: string;
  publishedAt: string;
  author: string;
}

export interface DashboardData {
  administrator: {
    name: string;
    role: string;
    avatarUrl: string;
  };
  systemStatus: {
    date: string;
    time: string;
    timezone: string;
    operational: boolean;
  };
  metrics: MetricCardData[];
  reminders: ReminderItem[];
  latestUpdate: EstateUpdate;
}

