from django.contrib import admin
from core.models import (
    Experience,
    FooterStat,
    Affiliations,
    Project,
    Skills,
)
# Register your models here.

admin.site.register(Experience)
admin.site.register(FooterStat)
admin.site.register(Affiliations)
admin.site.register(Project)
admin.site.register(Skills)
