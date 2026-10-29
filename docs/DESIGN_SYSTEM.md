# LeseLaut colour system

`app/platform-colours.css` owns the light and dark theme tokens and is imported
last in `app/layout.tsx`. Component styles use these tokens rather than defining
another theme. Neutral page and card surfaces keep learning content readable.

| Area | Accent |
| --- | --- |
| Home | Butter |
| Stories, account and supporting routes | Sage |
| Books | Peach |
| Vocabulary | Sky |
| Grammar and Active Learning | Lilac |

Home section cards use the same accent as their destination. Repeated discovery
cards, illustrations and learning explanations can use the five shared soft tints.
Every tint has a matching accent for labels and controls; body copy uses `--ink`
or `--ink-soft`. Book pages, menus, forms and dialogs follow the selected theme.

Progress colors are semantic and stable across routes: `--progress-learned`,
`--progress-review` and `--progress-unlearned`. Always include text labels.
Success feedback uses sage; correction/error feedback uses peach. Primary buttons
pair `--section-ink` with `--section-on`, including in dark mode. Reading and audio
word highlights use butter, and selected words use sky.

The shared UI tests calculate normal-text contrast from the actual palette values
in both themes, including every tint, button pair, neutral surface and inverse panel.
Check main routes and a book page at desktop and mobile widths after theme changes.
