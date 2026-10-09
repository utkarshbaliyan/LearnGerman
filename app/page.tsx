import { SiteHeader } from './components/site-header';
import { TodayDashboard } from './components/today-dashboard';
import { READING_STORIES, readingSummary } from './lib/reading-path';

export default function HomePage() {
  return <div className="site-shell"><SiteHeader active="today" /><TodayDashboard stories={READING_STORIES.map(readingSummary)} /></div>;
}
