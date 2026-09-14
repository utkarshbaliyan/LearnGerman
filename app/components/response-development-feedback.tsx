import type { ResponseDevelopment } from '@/app/lib/response-development';
export function ResponseDevelopmentFeedback({development}:{development?:ResponseDevelopment}) {
 if (!development) return null;
 return <section className="response-development" aria-label="Response development"><h4>{development.sufficient ? 'Enough detail for this task' : 'Add more, then try again'}</h4><p>{development.explanation}</p>{!development.sufficient && <><ul>{development.nextQuestions.map(question => <li key={question}>{question}</li>)}</ul><p>This activity will be complete once your answer is developed enough. Use your own details.</p></>}</section>;
}
