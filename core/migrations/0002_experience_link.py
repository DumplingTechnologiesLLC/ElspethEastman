# Generated by Django 3.1.7 on 2021-03-22 00:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='experience',
            name='link',
            field=models.CharField(
                blank=True, max_length=400, null=True, verbose_name='Link'),
        ),
        migrations.AddField(
            model_name='affiliations',
            name='link',
            field=models.CharField(
                blank=True, max_length=400, null=True, verbose_name='Link'),
        ),
    ]
