from django.db import models

# Create your models here.


class Experience(models.Model):
    VOICE_CREDITS = 'Voice Credits',
    MUSIC_GAMES = 'Music - Games',
    CHOICES = (

    )
    year = models.IntegerField("Year")
    tba = models.BooleanField("TBA Year", default=False)
    credit = models.CharField("Credit", max_length=2000)


class FooterStat(models.Model):
    value = models.CharField("Value", max_length=200)
    label = models.CharField("Label", max_length=200)
    percent = models.IntegerField("Percent")


class Affiliations(models.Model):
    affiliation = models.CharField("Affiliation", max_length=2000)


class Project(models.Model):
    src = models.CharField("Source", max_length=200)
    title = models.CharField("Title", max_length=1000)


class Skills(models.Model):
    game_development = models.TextField()
    streaming = models.TextField()
    voice_acting = models.TextField()
