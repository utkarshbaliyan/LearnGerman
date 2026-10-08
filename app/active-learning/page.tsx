import { SiteHeader } from '@/app/components/site-header';
import { TopicArt } from '@/app/components/topic-art';
import { TranslationWorkspace } from './translation-workspace';
export const metadata = { title: 'Active Learning · LeseLaut', description: 'Choose A1–C1 and translate 1–12 English sentences into German by writing, speaking or uploading a photo. Get AI corrections and explanations.' };
export default function ActiveLearningPage() {
 return <div className="site-shell"><SiteHeader active="active-learning"/><main className="active-learning translation-page"><header className="illustrated-intro"><div><span className="reading-eyebrow">Active Learning · Your turn.</span><h1>Put your German<br /><em>into practice.</em></h1><p className="active-intro">Choose your level. Translate English sentences into German, then get feedback on your mistakes.</p></div><TopicArt kind="friends" className="topic-art--intro" /></header><TranslationWorkspace/></main></div>;
}
