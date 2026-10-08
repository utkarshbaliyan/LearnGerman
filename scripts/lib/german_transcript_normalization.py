"""Compare spoken German integer quantities with their ASR digit spellings."""

import re

_UNITS = [
    "null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben",
    "acht", "neun", "zehn", "elf", "zwölf", "dreizehn", "vierzehn",
    "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn",
]
_TENS = ["", "", "zwanzig", "dreissig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"]
_VALUES = {word: number for number, word in enumerate(_UNITS)}
for _number in range(20, 100):
    _word = _TENS[_number // 10] if _number % 10 == 0 else (
        ("ein" if _number % 10 == 1 else _UNITS[_number % 10])
        + "und" + _TENS[_number // 10]
    )
    _VALUES[_word] = _number


def _under_thousand(word, allow_ein=False):
    if word in _VALUES:
        return _VALUES[word]
    if allow_ein and word == "ein":
        return 1
    if word.count("hundert") == 1:
        before, after = word.split("hundert")
        hundreds = _under_thousand(before, allow_ein=True) if before else 1
        remainder = _under_thousand(after) if after else 0
        if hundreds is not None and 1 <= hundreds <= 9 and remainder is not None and 0 <= remainder < 100:
            return hundreds * 100 + remainder
    return None


def _integer_word(word):
    if word.count("tausend") == 1:
        before, after = word.split("tausend")
        thousands = _under_thousand(before, allow_ein=True) if before else 1
        remainder = _under_thousand(after) if after else 0
        if thousands is not None and 1 <= thousands <= 999 and remainder is not None and 0 <= remainder <= 999:
            return thousands * 1000 + remainder
    return _under_thousand(word)


def normal(text):
    """Normalize integer spellings without accepting different numeric values.

    German compound integers up to 999999 and German digit groupings such as
    23.090 compare by value. Articles, names and unknown compounds stay words.
    Transcript coverage and excess thresholds are applied by the caller.
    """
    value = text.casefold().replace("ß", "ss").replace("é", "e")
    value = re.sub(r"\bgleis(?=[a-zäöü])", "gleis ", value)
    value = re.sub(r"\b[0-9]{1,3}(?:\.[0-9]{3})+\b", lambda match: match.group().replace(".", ""), value)
    result = []
    for word in re.findall(r"[a-zäöü]+|[0-9]+", value):
        number = _integer_word(word)
        result.append(str(number) if number is not None else word)
    return result
