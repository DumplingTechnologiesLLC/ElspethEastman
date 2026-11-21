from django.http import Http404
from django.shortcuts import render
from django.views import View

from portfolio.models import Page


class RegisteredPageClient(View):
    """Serve a fresh public or CMS request only at a currently registered slug."""

    def get(self, request, slug):
        if not Page.objects.filter(slug=slug).exists():
            raise Http404("Page not found")
        return render(request, "build/index.html", {})
