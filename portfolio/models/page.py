from django.db import models


class PageKind(models.TextChoices):
    HOME = "home", "Home"
    VOICEOVER = "voiceover", "Voiceover"
    MUSIC = "music", "Music"
    STREAMING = "streaming", "Streaming"
    PRESS = "press", "Press"
    BIO = "bio", "Bio"


class Page(models.Model):
    kind = models.CharField(max_length=20, choices=PageKind.choices, unique=True, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    primary_action_label = models.CharField(max_length=200, null=True, blank=True)
    primary_action_url = models.URLField(max_length=2000, null=True, blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(kind__in=PageKind.values), name="portfolio_page_known_kind"),
            models.CheckConstraint(
                condition=models.Q(kind=PageKind.HOME, slug="") | (~models.Q(kind=PageKind.HOME) & ~models.Q(slug="")),
                name="portfolio_page_home_slug",
            ),
            models.CheckConstraint(
                condition=(models.Q(primary_action_label__isnull=True, primary_action_url__isnull=True) | (
                    models.Q(primary_action_label__isnull=False, primary_action_url__isnull=False)
                    & ~models.Q(primary_action_label="") & ~models.Q(primary_action_url="")
                )),
                name="portfolio_page_complete_action",
            ),
        ]
