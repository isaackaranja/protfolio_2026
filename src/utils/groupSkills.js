// Categories shown first, in this order. Any other category follows, A–Z.
export const SKILL_CATEGORIES = ['Languages', 'Frontend', 'Backend', 'Databases', 'Tools & cloud']

// Turns the API's skill list into [{ category, items }], keeping each category's skills in order
export function groupSkills(skills) {
  const byCategory = new Map()
  for (const skill of skills) {
    if (!byCategory.has(skill.category)) byCategory.set(skill.category, [])
    byCategory.get(skill.category).push(skill)
  }

  const rank = (category) => {
    const index = SKILL_CATEGORIES.indexOf(category)
    return index === -1 ? SKILL_CATEGORIES.length : index
  }
  return [...byCategory]
    .map(([category, items]) => ({ category, items }))
    .sort(
      (a, b) =>
        rank(a.category) - rank(b.category) ||
        a.category.localeCompare(b.category, undefined, { sensitivity: 'base' }),
    )
}
