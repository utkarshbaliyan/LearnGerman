# Responsive QA — 29 October 2026

The shared responsive rules are in `app/responsive.css`, imported after the section colour tokens. Phone vocabulary rows stack below 768px; the logo remains a Home link when the duplicate Home tab is hidden below 421px.

## Browser coverage

Chromium browser checks used real CSS viewports in an isolated loopback-only development harness. All 260 fully loaded page/viewport combinations passed horizontal document and component overflow checks. Phone and portrait-tablet checks also found no undersized audited controls or fields below 16px. Inline word glosses and browser-native media internals are excluded from the control measurement.

| Viewport | Pages | Result |
| --- | ---: | --- |
| 320x568 | 26 | Passed |
| 375x667 | 26 | Passed |
| 390x844 | 26 | Passed |
| 430x932 | 26 | Passed |
| 768x1024 | 26 | Passed |
| 1024x768 | 26 | Passed |
| 1440x900 | 26 | Passed |
| 1920x1080 | 26 | Passed |
| 844x390 | 26 | Passed |
| 640x960 | 26 | Passed |

Another 20 breakpoint checks covered Home, C1 vocabulary, grammar and account at 421, 481, 767, 769 and 1023px. All passed.

Both themes were checked; light mode received another 52 phone/tablet checks. Open dialogs, answer feedback, expanded lesson navigation, the completed daily goal, an active learning session and the resume card were checked separately.

Representative routes:

- `/`
- `/stories`
- `/stories/a1`
- `/stories/b2`
- `/stories/reading-a1-01-v1`
- `/stories/reading-b2-01-v1`
- `/books`
- `/books/a1/der-schluessel-im-blauen-korb`
- `/books/a1/der-schluessel-im-blauen-korb/1`
- `/books/a2/nicht-nur-ein-profil/1`
- `/books/b1/zwischen-hoersaal-und-arbeitswelt/1`
- `/vocabulary?level=A1`
- `/vocabulary?level=C1`
- `/vocabulary?level=A1&view=practice`
- `/grammar`
- `/grammar?lesson=c1-1-1`
- `/grammar/reference`
- `/grammar/cheat-sheets`
- `/grammar/lessons/a1-1-1`
- `/course`
- `/account`
- `/auth/reset-password`
- `/about`
- `/privacy`
- `/support`
- `/active-learning`

Interactive checks:

- Icon-only review toggles and saved local vocabulary.
- Flashcard start, reveal, rating, close and landscape scrolling.
- Menu theme toggle, Escape dismissal and restored focus.
- Story audio play/pause; English translations; four-question quiz feedback at 320px.
- Grammar lesson browser, practice, answer feedback and rule disclosure in landscape.
- Create-account, sign-in and password-help forms without credential submission.
- Book translations, bookmark and selected-word controls at 320px.
- Completed daily goal/streak, active session and resume card on phone/landscape.
- Vocabulary recognition answer feedback at 320px and 375px.

## Repeating the checks

```sh
LESELAUT_BUILD_TARGET=aws LESELAUT_LAYOUT_AUDIT=1 npm run dev -- --host 127.0.0.1
```

Use a separate local guest browser profile for progress-changing checks. Resize through the matrix above, wait until `ready` is true, and check the optional local audit panel for overflow, clipped containers, small controls and input sizes. The panel reports only to the same-origin parent when framed; it uses no monitoring service. The flag is ignored by production rendering, including when explicitly set in the AWS smoke test.

The temporary iframe harness changed framing only on its own loopback proxy. It is not shipped; application and CloudFront security policies were not changed. Physical iPhone/Safari and real software-keyboard testing were not performed. Pinch zoom remains enabled; narrow layouts, safe-area padding and short landscape viewports have explicit rules.

## Build compatibility

The locked Vinext viewport serializer drops `viewportFit` and `interactiveWidget`. `build/viewport-vite-plugin.ts` extends that serializer for both build targets, using the standard root viewport configuration and one viewport tag. It skips fields already supported upstream and fails on an unrecognised serializer shape. The AWS smoke test verifies the actual rendered tag, safe-area and keyboard options, enabled zoom, and absence of the development audit panel.
