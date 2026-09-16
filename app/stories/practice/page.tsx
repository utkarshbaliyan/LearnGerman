import Link from 'next/link';
import { SiteHeader } from '@/app/components/site-header';
import { RECEPTION_CATALOG } from '@/app/lib/reception-catalog';
export const metadata={title:'Practical reading & listening · LeseLaut'};
export default function ReceptionIndex(){return <div className="site-shell"><SiteHeader active="stories"/><main className="reading-reader"><Link href="/stories">← Stories</Link><header><h1>Read & listen</h1><p>Messages, everyday choices and conversations.</p></header>{['A1','A2','B1'].map(level=><section className="reception-later" key={level}><h2>{level}</h2><ul>{RECEPTION_CATALOG.filter(l=>l.level===level).map(l=><li key={l.id}><Link href={`/stories/practice/${l.id}`}>{l.title} →</Link></li>)}</ul></section>)}</main></div>}
