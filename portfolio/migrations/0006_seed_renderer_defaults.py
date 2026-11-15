"""Frozen first-run content and bundled media; subsequent deploys do not reseed."""

from django.db import migrations


ASSETS = (
    ("home", "home.jpg", 2731, 4096, "image/jpeg"),
    ("bio", "bio.jpg", 2731, 4096, "image/jpeg"),
    ("cello", "cello.jpg", 2731, 4096, "image/jpeg"),
    ("tristana", "tristana.jpg", 1215, 717, "image/jpeg"),
    ("cadence", "cadence.jpg", 460, 215, "image/jpeg"),
    ("musical", "elspeth-the-musical.jpg", 700, 700, "image/jpeg"),
    ("return", "return-of-the-elspeth.jpg", 700, 700, "image/jpeg"),
    ("world", "i-saw-her-across-the-world-official-soundtrack.jpg", 700, 700, "image/jpeg"),
)
INTRO = {
    "home": (
        "A distinctive voice for stories, games, streams, and whatever strange thing comes next.",
        "",
        "Elspeth works across voice performance, live entertainment, and music, bringing character, timing, and an actual point of view to the work. For casting, collaborations, appearances, music projects, or something that refuses to fit neatly into a category, reach out.",
    ),
    "voiceover": (
        "Voiceover",
        "Character-forward performance with range, specificity, and enough personality to survive contact with a writers' room.",
        "Elspeth has worked in games and animation since 2012, with roles spanning major live-service titles, indie leads, recurring franchise characters, and English-language animation.",
    ),
    "music": (
        "Music", "Music has been a constant, even when the instrument changes.",
        "Elspeth's work spans original albums, game soundtracks, vocals, production, piano, and now a near-daily obsession with the cello.",
    ),
    "streaming": (
        "Streaming", "Games are involved. Things generally deteriorate from there.",
        "Elspeth has spent more than a decade streaming variety games, roleplay, collaborations, and whatever else seemed like a good idea at the time.",
    ),
    "press": (
        "Press", "A decade of conversations, coverage, panels, and public appearances.",
        "From voice acting and streaming to music and the stranger corners of internet culture, Elspeth's work has generated a substantial external media trail.",
    ),
    "bio": (
        "Bio", "A career built sideways, one interesting detour at a time.",
        "Elspeth Eastman is a voice actor, streamer, and musician whose work has moved between games, live entertainment, original music, and whatever new instrument has her attention.",
    ),
}
IDENTITIES = {
    "home": ("Voice actor", "Streamer", "Musician"),
    "voiceover": ("Character", "Games", "Animation"),
    "music": ("Cello", "Composition", "Vocals"),
    "streaming": ("Partner", "Ambassador", "Variety"),
    "press": ("Interviews", "Features", "Appearances"),
    "bio": ("Voice actor", "Streamer", "Musician"),
}
SECTIONS = (
    ("voiceover", "roles", "Featured roles"),
    ("music", "releases", "Original music"),
    ("streaming", "streams", "Recent streams"),
    ("streaming", "clips", "Clips"),
    ("press", "coverage", "Interviews & features"),
    ("press", "appearances", "Appearances"),
    ("bio", "story", "How I got here"),
    ("bio", "current", "Currently"),
    ("bio", "explore", "Explore the work"),
)
YOUTUBE = "https://www.youtube.com/user/ratedEwithElspeth"
ROLES = (
    ("tristana", "Tristana", "League of Legends", "One of Elspeth's most recognizable long-running game roles, including Dragon Trainer Tristana.", "https://www.youtube.com/watch?v=mamnlBEUU0E"),
    ("cadence", "Cadence", "Crypt of the NecroDancer", "Character performance in Crypt of the NecroDancer.", "https://www.youtube.com/watch?v=CENF14Iloxw"),
)
RELEASES = (
    ("musical", "2012", "Album", "Elspeth! The Musical", "Fourteen tracks written, recorded, sung, mixed, and produced by Elspeth.", "elspeth-the-musical"),
    ("return", "2013", "Album", "Return of the Elspeth!", "Ten vocal tracks with original lyrics, vocals, and music.", "return-of-the-elspeth"),
    ("world", "2014", "Game soundtrack", "i saw her across the world", "Original soundtrack for i saw her across the world.", "i-saw-her-across-the-world-official-soundtrack"),
)


def seed_defaults(apps, schema_editor):
    alias = schema_editor.connection.alias
    models = {name: apps.get_model("portfolio", name).objects.using(alias) for name in (
        "Page", "PageCopy", "Eyebrow", "MediaAsset", "PageImage", "MusicFeature", "MusicRelease", "ContentEntry",
    )}
    pages = {page.kind: page for page in models["Page"].all()}
    assets = {}
    for key, name, width, height, mime in ASSETS:
        assets[key], _ = models["MediaAsset"].get_or_create(
            file=f"seed/v1/{name}", defaults={"width": width, "height": height, "mime_type": mime}
        )
    legacy = apps.get_model("core", "Skills").objects.using(alias).order_by("pk").first()
    legacy_fields = {"voiceover": "voice_acting", "music": "game_development", "streaming": "streaming"}
    for kind, values in INTRO.items():
        for order, (treatment, value) in enumerate(zip(("headline", "subheadline", "body"), values)):
            if treatment == "body" and legacy is not None and kind in legacy_fields:
                value = getattr(legacy, legacy_fields[kind]) or value
            if value:
                models["PageCopy"].get_or_create(page=pages[kind], key=f"intro-{treatment}", defaults={
                    "section": "intro", "kind": treatment, "value": value, "sort_order": order,
                })
        if not models["Eyebrow"].filter(page=pages[kind]).exists():
            for order, label in enumerate(IDENTITIES[kind]):
                models["Eyebrow"].create(page=pages[kind], label=label, sort_order=order)
    for kind, section, text in SECTIONS:
        models["PageCopy"].get_or_create(page=pages[kind], key=f"{section}-heading", defaults={
            "section": section, "kind": "section_label", "value": text, "sort_order": 0,
        })
    for kind, key, asset, alt in (
        ("home", "hero", "home", "Elspeth Eastman smiling in the studio"),
        ("bio", "portrait", "bio", "Portrait of Elspeth Eastman"),
    ):
        models["PageImage"].get_or_create(page=pages[kind], key=key, defaults={"asset": assets[asset], "alt_text": alt})
    for treatment, value, order in (
        ("headline", "Theater kid. Internet voice experiments. One very consequential League of Legends video.", 0),
        ("body", "Elspeth grew up in rural northern Indiana, spent her school years around theater, and began experimenting with voice work while in college. What started as a side project on YouTube eventually became a professional career spanning voice acting, streaming, music, and live appearances.", 1),
    ):
        models["PageCopy"].get_or_create(page=pages["bio"], key=f"short-bio-{treatment}", defaults={
            "section": "short_bio", "kind": treatment, "value": value, "sort_order": order,
        })
    models["MusicFeature"].get_or_create(page=pages["music"], defaults={
        "eyebrow": "Current practice", "title": "Cello", "description": "What started as learning a new instrument turned into a near-daily practice.",
        "asset": assets["cello"], "alt_text": "Elspeth practicing cello", "action_label": "Watch on YouTube", "action_url": YOUTUBE,
    })
    if not models["ContentEntry"].filter(page=pages["voiceover"]).exists():
        for order, (asset, title, eyebrow, description, url) in enumerate(ROLES):
            models["ContentEntry"].create(page=pages["voiceover"], title=title, eyebrow=eyebrow, description=description,
                asset=assets[asset], alt_text=f"{title} from {eyebrow}", action_label="Project / clip", action_url=url, sort_order=order)
    if not models["MusicRelease"].filter(page=pages["music"]).exists():
        for order, (asset, year, format, title, description, slug) in enumerate(RELEASES):
            models["MusicRelease"].create(page=pages["music"], year=year, format=format, title=title, description=description,
                asset=assets[asset], alt_text=f"{title} cover artwork", artwork_title="", action_label="Listen",
                action_url=f"https://elspetheastman.bandcamp.com/album/{slug}", sort_order=order)


class Migration(migrations.Migration):
    dependencies = [("portfolio", "0005_independent_page_collections"), ("core", "0008_project_uuid")]
    operations = [migrations.RunPython(seed_defaults, migrations.RunPython.noop)]
