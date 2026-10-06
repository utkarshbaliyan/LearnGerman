import { redirect } from 'next/navigation';
// Old task links open the replacement section. Saved attempts remain in D1.
export default function PreviousActiveTask() { redirect('/active-learning'); }
