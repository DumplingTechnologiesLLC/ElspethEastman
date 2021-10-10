# Generated by Django 3.1.7 on 2021-10-10 16:58

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_auto_20210325_1734'),
    ]

    operations = [
        migrations.AddField(
            model_name='contact',
            name='date_created',
            field=models.DateTimeField(default=datetime.datetime(2021, 10, 10, 16, 57, 58, 751510, tzinfo=utc), verbose_name='Date Created'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='contact',
            name='date_sent',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Date Created'),
        ),
        migrations.AddField(
            model_name='contact',
            name='sent',
            field=models.BooleanField(default=False, verbose_name='Email sent'),
            preserve_default=False,
        ),
    ]