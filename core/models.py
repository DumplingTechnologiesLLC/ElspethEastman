from django.db import models
from django.utils import timezone

# Create your models here.


class Contact(models.Model):
    name = models.CharField('Name', max_length=2000)
    email = models.EmailField('Email')
    message = models.TextField('Message')
    date_created = models.DateTimeField("Date Created", blank=True)
    date_sent = models.DateTimeField("Date Sent", blank=True, null=True)
    sent = models.BooleanField('Email sent', default=False)

    def save(self, *args, **kwargs):
        if not self.id:
            self.date_created = timezone.now()

        return super(Contact, self).save(*args, **kwargs)

    def __str__(self):
        return f'{self.name} - {self.email}'


class Experience(models.Model):
    VOICE_CREDITS = 'Voice Credits'
    MUSIC_GAMES = 'Music - Games'
    MUSIC_MISCELLANEOUS = 'Music - Miscellaneous'
    STREAMING_CREDITS = 'Streaming - Credits'
    CHOICES = (
        (VOICE_CREDITS, VOICE_CREDITS),
        (MUSIC_GAMES, MUSIC_GAMES),
        (MUSIC_MISCELLANEOUS, MUSIC_MISCELLANEOUS),
        (STREAMING_CREDITS, STREAMING_CREDITS),
    )
    year = models.IntegerField("Year", blank=True, null=True)
    link = models.CharField('Link', null=True, blank=True, max_length=400)
    tba = models.BooleanField("TBA Year", default=False)
    credit = models.CharField("Credit", max_length=2000)
    category = models.CharField("Category", choices=CHOICES, max_length=30)

    def __str__(self):
        return f"{self.get_category_display()}: {'TBA' if self.tba else self.year if self.year is not None else ''} {self.credit}"  # noqa


class FooterStat(models.Model):
    value = models.CharField("Value", max_length=200)
    label = models.CharField("Label", max_length=200)
    percent = models.IntegerField("Percent")

    def __str__(self):
        return f"{self.value} {self.label} | {self.percent}%"


class Affiliations(models.Model):
    affiliation = models.CharField("Affiliation", max_length=2000)
    link = models.CharField(blank=True, max_length=400, null=True)

    class Meta:
        verbose_name_plural = "Affiliations"
        verbose_name = "Affiliation"

    def __str__(self):
        return self.affiliation


class Project(models.Model):
    src = models.CharField("Source", max_length=200)
    title = models.CharField("Title", max_length=1000)

    def __str__(self):
        return self.title


class Skills(models.Model):
    game_development = models.TextField()
    streaming = models.TextField()
    voice_acting = models.TextField()

    class Meta:
        verbose_name_plural = "Skills"
        verbose_name = "Skill"
