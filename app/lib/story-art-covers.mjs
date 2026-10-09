// Reuse approved, already verified illustrations; retain each original cover.
export function assignStoryArtCovers(briefs, originals, reuse) {
  const ids = new Set(briefs.map(story => story.id));
  const covers = { ...originals };
  for (const [id, sourceId] of Object.entries(reuse)) {
    if (!ids.has(id) || !ids.has(sourceId) || !originals[sourceId]) {
      throw new Error(`Unknown story artwork assignment: ${id} -> ${sourceId}`);
    }
    if (!covers[id]) covers[id] = { ...originals[sourceId] };
  }
  const usage = new Map();
  for (const id of ids) {
    if (!covers[id]?.url) throw new Error(`Missing story cover: ${id}`);
    const url = covers[id].url;
    usage.set(url, (usage.get(url) ?? 0) + 1);
    if (usage.get(url) > 3) throw new Error(`Story illustration used more than three times: ${url}`);
  }
  return covers;
}
