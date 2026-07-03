export type MenuHubPanel = 'menu' | 'qr' | 'analytics';

export type LaunchpadCard = {
  id: MenuHubPanel;
  title: string;
  description: string;
  metric: string;
  metricTone: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  visual: 'items' | 'qr' | 'chart';
};
