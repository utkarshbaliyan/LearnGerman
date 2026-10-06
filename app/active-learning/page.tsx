import { SiteHeader } from '@/app/components/site-header';
import { TranslationWorkspace } from './translation-workspace';
export const metadata = { title: 'Active Learning · LeseLaut', description: 'Choose A1–C1 and translate 1–12 English sentences into German by writing, speaking or uploading a photo. Get AI corrections and explanations.' };
export default function ActiveLearningPage() {
 return <div className="site-shell"><SiteHeader active="active-learning"/><main className="active-learning translation-page"><h1>Translation practice</h1><p className="active-intro">Choose your level. Translate English sentences into German, then get feedback on your mistakes.</p><TranslationWorkspace/></main></div>;
}
