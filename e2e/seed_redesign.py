"""Figma examples for the guarded disposable browser database only."""

from datetime import datetime, timezone
from importlib import import_module
from pathlib import Path
from shutil import copyfile
from types import SimpleNamespace
from uuid import UUID

from django.apps import apps
from django.conf import settings
from django.db import connection
from PIL import Image


def seed_redesign():
    from portfolio.models import (
        Appearance, BioChapter, ContentEntry, ContentEntryMetadata, MediaAsset,
        MusicFeature, MusicRelease, Page, PageCopy, PracticeFact, TriviaItem,
    )
    import_module("portfolio.migrations.0002_seed_page_identities").seed_pages(apps, SimpleNamespace(connection=connection))
    defaults = import_module("portfolio.migrations.0006_seed_renderer_defaults")
    defaults.seed_defaults(apps, SimpleNamespace(connection=connection))
    pages = {page.kind: page for page in Page.objects.all()}
    for kind, values in defaults.INTRO.items():
        PageCopy.objects.filter(page=pages[kind], key="intro-body").update(value=values[2])
    root = Path(settings.BASE_DIR)
    media = Path(settings.MEDIA_ROOT)
    if media.resolve() != (root / ".e2e/media").resolve():
        raise RuntimeError("Browser imagery requires isolated E2E media storage")
    media.joinpath("fixtures").mkdir(parents=True, exist_ok=True)
    assets = {}
    for name in ("tristana", "cadence", "nori", "enatsu", "cello", "rib", "stream", "press-health", "press-podcast", "press-geekenders", "press-dignitas", "press-tubefilter"):
        source = root / f"frontend/src/assets/design/{name}.png"
        target = media / f"fixtures/{name}.jpg"
        copyfile(source, target)
        with Image.open(source) as image:
            assets[name] = MediaAsset.objects.create(file=f"fixtures/{name}.jpg", width=image.width, height=image.height,
                                                     mime_type=Image.MIME[image.format])
    for kind, label in (("voiceover", "Play voiceover reel"), ("streaming", "Watch on Twitch"), ("press", "Latest interview")):
        Page.objects.filter(pk=pages[kind].pk).update(primary_action_label=label, primary_action_url=f"https://example.invalid/{kind}")
    ContentEntry.objects.all().delete()
    for order, (image, title, eyebrow, summary) in enumerate((
        ("tristana", "Tristana", "League of Legends", "One of Elspeth's most recognizable long-running game roles, including Dragon Trainer Tristana."),
        ("cadence", "Cadence", "NecroDancer franchise", "From Crypt of the NecroDancer through Cadence of Hyrule and Rift of the NecroDancer."),
        ("nori", "Nori Kaga", "Cook Serve Forever", "Lead performance in Vertigo Gaming's fully voiced narrative cooking adventure."),
        ("enatsu", "Major Enatsu", "Gamera -Rebirth-", "English-language animation credit for Netflix's Gamera series."),
    )):
        entry = ContentEntry.objects.create(page=pages["voiceover"], title=title, eyebrow=eyebrow, description=summary,
            asset=assets[image], alt_text=f"{title} artwork", action_label="Project / clip", action_url=f"https://example.invalid/{image}", sort_order=order)
        ContentEntryMetadata.objects.create(entry=entry, key="details", label="Details", value=eyebrow, sort_order=0)
    feature = MusicFeature.objects.get(page=pages["music"])
    feature.eyebrow = "Two years in, still climbing"
    feature.action_label = "Watch progress"
    feature.action_url = "https://example.invalid/practice"
    feature.asset = assets["cello"]
    feature.save()
    for order, (label, value) in enumerate((("Playing", "2+ years"), ("Current study", "Popper · Etude No. 7"))):
        PracticeFact.objects.create(feature=feature, label=label, value=value, sort_order=order)
    for release in MusicRelease.objects.all():
        release.asset = assets["rib"]
        release.artwork_title = release.title
        release.action_url = f"https://example.invalid/release-{release.pk}"
        release.save()
    MusicRelease.objects.create(page=pages["music"], year="2017", format="Single", title="Miss You Again ft. JonSandman",
        description="Written, composed, and produced by Elspeth, with JonSandman as guest writer.", asset=assets["rib"],
        alt_text="Amber rib artwork", artwork_title="Miss You Again", action_label="Listen", action_url="https://example.invalid/single", sort_order=3)
    for order, (title, eyebrow, category) in enumerate((
        ("Collab with @TheNormiesTV", "Latest stream · Collaboration", "Collaboration"),
        ("gonna find what was tryna eat me today", "Subnautica 2", "Recent stream"),
        ("Meccha Chameleon with pals", "Meccha Chameleon", "Recent stream"),
        ("Hookworm Sally", "Wayward RP · Red Dead Redemption II", "Roleplay"),
    )):
        ContentEntry.objects.create(page=pages["streaming"], title=title, eyebrow=eyebrow, description="Joining the push toward one million subscribers.",
            asset=assets["stream"] if order == 0 else None, alt_text="Elspeth collaborating with The Normies" if order == 0 else "",
            category=category, action_label="Watch stream" if order == 0 else "Watch VOD", action_url=f"https://example.invalid/stream-{order}",
            is_featured=order == 0, sort_order=order)
    for order, title in enumerate(("Elspeth finds the no-no Square", "Elspeth puts a rude viewer in their place")):
        ContentEntry.objects.create(page=pages["streaming"], collection="stream_clips", title=title, eyebrow="Clip", category="Highlights", action_label="Play clip",
                                  action_url=f"https://example.invalid/clip-{order}", sort_order=order)
    for order, (image, title, eyebrow, outlet, category) in enumerate((
        ("press-podcast", "The Patrick Scott Patterson Project", "Podcast · Featured interview", "The Patrick Scott Patterson Project", "Podcast"),
        ("press-health", "Finding her voice again", "Feature", "UC Health", "Health / voice"),
        ("press-geekenders", "Chatting with Elspeth", "Podcast", "The Geekenders", "Conversation"),
        ("press-dignitas", "On becoming Tristana", "Interview", "Dignitas", "League / voice"),
        ("press-tubefilter", "CAA signs gaming creators", "Coverage", "Tubefilter", "Industry / creators"),
    )):
        entry = ContentEntry.objects.create(page=pages["press"], title=title, eyebrow=eyebrow,
            description="Long-form conversation on voice acting, games, Twitch, music, and career evolution.", asset=assets[image], alt_text=title,
            category=category, published_at=datetime(2026, 4, 4, 12, 0, tzinfo=timezone.utc), action_label="Read", action_url=f"https://example.invalid/press-{order}",
            is_featured=order == 0, sort_order=order)
        ContentEntryMetadata.objects.create(entry=entry, key="outlet", label="Publication", value=outlet, sort_order=0)
    for order, (year, title, format) in enumerate((("2026", "MAGFest · Voice Actor Round Table", "Panel"), ("2024", "The Geekenders", "Podcast"),
        ("2023", "UC Health patient feature", "Feature"), ("2016", "White House Gaming Healthcare Event", "Appearance"), ("2013", "WNIT · Experience Michiana", "Performance"))):
        Appearance.objects.create(page=pages["press"], year=year, title=title, format=format, sort_order=order)
    for order, (eyebrow, heading, body) in enumerate((
        ("Early years", "From theater to a microphone in a closet.", "Growing up in northern Indiana, Elspeth gravitated toward performance early through school theater. In college, voice acting became a side hobby: recording character voices, posting experiments online, and learning the craft by doing it."),
        ("The turn", "YouTube found its way to Riot.", "In 2013, Elspeth posted a video voicing League of Legends champions. Riot employees found it, passed it around internally, and later invited her to audition for Tristana."),
        ("More than one lane", "Voice acting was never the only thing.", "Alongside character work, Elspeth has composed, produced, sung, streamed, hosted, and appeared at events and panels."),
        ("Now", "The current obsession has four strings.", "Today the mix still changes. Voice work and streaming continue, while cello has become the most visible musical focus."),
    )):
        BioChapter.objects.create(page=pages["bio"], eyebrow=eyebrow, heading=heading, body=body, sort_order=order)
    for order, (eyebrow, title, description) in enumerate((("Voice acting", "Games & animation", "Character-forward performance and recurring roles."),
        ("Streaming", "Variety & live chaos", "Games, roleplay, collaborations, and conversation."), ("Music", "Cello", "Two-plus years of near-daily practice and counting."))):
        ContentEntry.objects.create(page=pages["bio"], collection="current_items", eyebrow=eyebrow, title=title, description=description, sort_order=order)
    for kind in ("voiceover", "music", "streaming", "press", "bio"):
        TriviaItem.objects.create(page=pages[kind], label="Selected work", value="Games · Music · Live", sort_order=0)
    for model in apps.get_app_config("portfolio").get_models():
        for record in model.objects.all():
            model.objects.filter(pk=record.pk).update(public_id=UUID(f'00000000-0000-4000-8000-{record.pk:012x}'))
