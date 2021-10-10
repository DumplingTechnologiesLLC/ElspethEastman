from django.contrib import admin
from core.models import (
    Experience,
    FooterStat,
    Affiliations,
    Project,
    Skills,
    Contact
)
from core.views import send_contact_email
# Register your models here.


def resend(modeladmin, request, queryset):
    for contact in queryset:
        send_contact_email(contact)


resend.description = 'Resend selected contacts'


class ContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'date_created', 'date_sent', 'sent']
    list_filter = ['sent']
    ordering = ['-date_created']
    actions = [resend]


admin.site.register(Experience)
admin.site.register(FooterStat)
admin.site.register(Affiliations)
admin.site.register(Project)
admin.site.register(Skills)
admin.site.register(Contact, ContactAdmin)
