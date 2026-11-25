"""Builds one PDF per episode with full practice: every exercise, an answer key and the word list.
Reads app/video-course/data/a1-eNN.json + a1-episodes.json, writes public/video-course/pdf/a1-episode-N.pdf.
Usage: python3 scripts/build-video-course-pdf.py   (needs reportlab + DejaVu fonts)"""
import json, glob, os, re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

FONT_DIR = next(d for d in ('/usr/share/fonts/truetype/dejavu', os.path.expanduser('~/Library/Fonts')) if os.path.exists(f'{d}/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('Sans', f'{FONT_DIR}/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('Sans-Bold', f'{FONT_DIR}/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Sans-Oblique', f'{FONT_DIR}/DejaVuSans-Oblique.ttf'))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily('Sans', normal='Sans', bold='Sans-Bold', italic='Sans-Oblique', boldItalic='Sans-Bold')

INK, SOFT, GREEN, LINE = colors.HexColor('#202d28'), colors.HexColor('#596860'), colors.HexColor('#206149'), colors.HexColor('#dce4de')
TONES = {'watch': '#9b492a', 'words': '#285bac', 'grammar': '#7042a0', 'skills': '#825b17', 'test': '#206149'}
NAMES = {'T': 'Frau Weber', 'A': 'Arjun', 'N': 'Amara', 'Y': 'Yuki', 'M': 'Mateo', 'O': 'Herr Özdemir', 'S': 'Frau Schulz'}
PICS = {'weber': 'Frau Weber', 'arjun': 'Arjun', 'amara': 'Amara', 'yuki': 'Yuki', 'mateo': 'Mateo', 'oezdemir': 'Herr Özdemir', 'schulz': 'Frau Schulz'}

S = lambda name, **k: ParagraphStyle(name, **{'fontName': 'Sans', 'fontSize': 10, 'leading': 14, 'textColor': INK, **k})
st = {'title': S('t', fontName='Sans-Bold', fontSize=20, leading=24, spaceAfter=4), 'sub': S('s', textColor=SOFT, fontSize=10.5),
      'block': S('b', fontName='Sans-Bold', fontSize=14, leading=18, spaceBefore=10, spaceAfter=4),
      'sec': S('h', fontName='Sans-Bold', fontSize=11.5, leading=15, spaceBefore=8, spaceAfter=1), 'instr': S('i', textColor=SOFT, fontSize=9, spaceAfter=4),
      'item': S('q', leftIndent=14, firstLineIndent=-14, spaceAfter=3), 'opt': S('o', leftIndent=14, textColor=SOFT, fontSize=9.5, spaceAfter=3),
      'key': S('k', fontSize=9.5, leading=13, leftIndent=14, firstLineIndent=-14), 'read': S('r', fontSize=10, leading=15, backColor=colors.HexColor('#fbf1d3'), borderPadding=6, spaceBefore=4, spaceAfter=8),
      'small': S('sm', fontSize=8.5, textColor=SOFT)}
esc = lambda s: (s or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
lst = lambda a: a if isinstance(a, list) else [a]
BLANK = '_' * 14

def who(it):
    bits = []
    if it.get('image'): bits.append(f"[picture: {PICS.get(it['image'], it['image'])}]")
    if it.get('audio'): bits.append(f"[audio: {NAMES.get(it['audio']['who'], '')} – listen online]")
    return (' '.join(bits) + ' ') if bits else ''

def question(it):
    t = it['type']; pre = esc(who(it))
    if t == 'choice': return f"{pre}{esc(it['prompt']) or 'Which one do you hear?'}", '   ○ ' + '   ○ '.join(esc(o) for o in it['options'])
    if t == 'gap': return f"{pre}{esc(it['before'])} {BLANK} {esc(it['after'])}" + (f" <i>({esc(it['hint'])})</i>" if it.get('hint') else ''), None
    if t == 'type': return f"{pre}{esc(it['prompt']) or 'Write what you hear.'}  {BLANK}", None
    if t == 'fix': return f"{pre}<strike>{esc(it['wrong'])}</strike>  →  {BLANK * 2}", None
    if t == 'order': return f"{pre}{esc(it.get('en', ''))}: " + ' / '.join(esc(x) for x in it['tokens']), None
    if t == 'match':
        left = ', '.join(esc(l) for l, _ in it['pairs'])
        right = ', '.join(esc(r) for _, r in reversed(it['pairs']))
        return f"{pre}{esc(it.get('prompt') or 'Match the pairs')}:", f"A: {left}   |   B: {right}"
    if t == 'sort':
        bnames = ' / '.join(esc(b['label']) for b in it['buckets'])
        cards = ', '.join(esc(c['text']) for c in it['cards'])
        return f"{pre}{esc(it.get('prompt') or f'Sort into {bnames}')}:", f"Words: {cards}"
    if t == 'chat':
        lines = []
        for turn in it['turns']:
            lines.append(f"<b>{NAMES.get(turn['who'], turn['who'])}:</b> {esc(turn['text'])}")
            if turn.get('reply'):
                opts = ' ○ '.join(esc(o) for o in turn['reply']['options'])
                lines.append(f"<i>You ({esc(turn['reply']['prompt'])}):</i> ○ {opts}")
        return f"{pre}<b>{esc(it['title'])}</b>", '<br/>'.join(lines)
    if t == 'form': return f"{pre}{esc(it['prompt'])}: " + '   '.join(f"{esc(f['label'])}: {BLANK}" for f in it['fields']), None
    if t == 'write': return f"{pre}{esc(it['prompt'])}", 'Checklist: ' + ' · '.join(esc(c['label']) for c in it['checks'])
    if t == 'speak': return f"{pre}{esc(it['prompt'])}" + (f" <i>({NAMES.get(it['audio']['who'], '')} asks: “{esc(it['audio']['text'])}”)</i>" if it.get('audio') else ''), None
    return esc(t), None

def answer(it):
    t = it['type']
    if t in ('choice', 'order'): a = esc(it['answer'])
    elif t == 'match': a = ' · '.join(f"{esc(l)} = {esc(r)}" for l, r in it['pairs'])
    elif t == 'sort':
        bmap = {b['id']: b['label'] for b in it['buckets']}
        a = ' · '.join(f"{esc(bmap.get(b['id'], b['id']))}: " + ', '.join(esc(c['text']) for c in it['cards'] if c['bucket'] == b['id']) for b in it['buckets'])
    elif t == 'chat':
        a = ' → '.join(esc(turn['reply']['answer']) for turn in it['turns'] if turn.get('reply'))
    elif t in ('gap', 'type', 'fix'): a = ' / '.join(esc(x) for x in lst(it['answer'])[:2])
    elif t == 'form': a = ' · '.join(f"{esc(f['label'])}: {esc(f['answer'])}" for f in it['fields'])
    elif t == 'write': a = f"Model: {esc(it['model'])}"
    elif t == 'speak': a = f"Model: {esc(it['modelText'])}" + (f" – e.g. “{esc(it['model']['text'])}”" if it.get('model') else '')
    else: a = ''
    if it.get('audio') and t != 'speak': a += f"  <i>(audio: “{esc(it['audio']['text'])}”)</i>"
    if it.get('note'): a += f"  <i>– {esc(it['note'])}</i>"
    return a

def footer(canvas, doc):
    canvas.saveState(); canvas.setFont('Sans', 8); canvas.setFillColor(SOFT)
    canvas.drawString(18 * mm, 10 * mm, doc.title_line); canvas.drawRightString(192 * mm, 10 * mm, f'leselaut.com · page {doc.page}')
    canvas.restoreState()

episodes = {e['n']: e for e in json.load(open('app/video-course/data/a1-episodes.json'))['episodes']}
os.makedirs('public/video-course/pdf', exist_ok=True)
for path in sorted(glob.glob('app/video-course/data/a1-e[0-9]*.json')):
    content = json.load(open(path)); n = content['episode']; e = episodes[n]
    out = f'public/video-course/pdf/a1-episode-{n}.pdf'
    doc = SimpleDocTemplate(out, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm, bottomMargin=18 * mm,
                            title=f'LeseLaut A1 Episode {n}: {e["title"]}', author='LeseLaut')
    doc.title_line = f'LeseLaut · A1 Episode {n}: {e["title"]}'
    story = [Paragraph(f'A1 · Episode {n} · {esc(e["location"])}', st['sub']), Paragraph(esc(e['title']), st['title']),
             Paragraph(f'{esc(e["english"])} – {esc(e["goal"])}', st['sub']), Spacer(1, 4),
             Paragraph(f'<b>Grammar:</b> {esc(e["grammarTitle"])}', st['sub']), Spacer(1, 6),
             Paragraph('All exercises from the episode page. Answers are at the end. Listening exercises need the audio on leselaut.com – their transcripts are in the answer key.', st['small'])]
    keys = []
    for b in content['blocks']:
        tone = colors.HexColor(TONES.get(b['id'], '#206149'))
        story.append(Paragraph(f'<font color="{TONES.get(b["id"])}">{esc(b["title"])}</font>', st['block']))
        keys.append(Paragraph(f'<font color="{TONES.get(b["id"])}"><b>{esc(b["title"])}</b></font>', st['sec']))
        for s in b['sections']:
            head = [Paragraph(esc(s['title']), st['sec']), Paragraph(esc(s['instructions']), st['instr'])]
            if s.get('text'):
                head.append(Paragraph(f"<b>{esc(s['text']['title'])}</b><br/>{esc(s['text']['body'])}<br/><font size=8 color='#596860'>"
                                      + ' · '.join(f'{esc(a)} = {esc(b2)}' for a, b2 in s['text']['glossary']) + '</font>', st['read']))
            items = []
            for i, it in enumerate(s['items'], 1):
                q, extra = question(it)
                items.append(Paragraph(f'{i}. {q}', st['item']))
                if extra: items.append(Paragraph(extra, st['opt']))
            story.append(KeepTogether(head + items[:4])); story.extend(items[4:])
            keys.append(Paragraph(f'<b>{esc(s["title"])}</b>', st['key']))
            keys.extend(Paragraph(f'{i}. {answer(it)}', st['key']) for i, it in enumerate(s['items'], 1))
    story += [PageBreak(), Paragraph('Answer key', st['title'])] + keys
    words = [v for v in e['vocab'] if v['section'] in ('core', 'topic', 'sentence', 'website')]
    seen, rows = set(), [['German', 'English', '']]
    for v in words:
        if v['de'] in seen: continue
        seen.add(v['de']); rows.append([Paragraph(esc(v['de']) + (f" <font color='#596860'>, {esc(v['plural'])}</font>" if v['plural'] and v['plural'] != 'Sg.' else ''), st['key']),
                                        Paragraph(esc(v['en']), st['key']), Paragraph('bonus' if v['section'] == 'website' else '', st['small'])])
    table = Table(rows, colWidths=[72 * mm, 88 * mm, 14 * mm], repeatRows=1)
    table.setStyle(TableStyle([('FONT', (0, 0), (-1, 0), 'Sans-Bold', 9.5), ('TEXTCOLOR', (0, 0), (-1, 0), GREEN), ('LINEBELOW', (0, 0), (-1, -1), 0.4, LINE), ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('TOPPADDING', (0, 0), (-1, -1), 3), ('BOTTOMPADDING', (0, 0), (-1, -1), 3)]))
    story += [PageBreak(), Paragraph(f'Words in this lesson ({len(rows) - 1})', st['title']), Spacer(1, 4), table]
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(out, os.path.getsize(out) // 1024, 'KB')
