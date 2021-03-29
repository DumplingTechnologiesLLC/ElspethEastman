from core.views import (Client, ContactViewSet, ExperienceViewSet, FooterViewSet,
                        PaginatedProjectViewSet, ProjectViewSet, SkillViewSet)
from rest_framework import routers
from django.urls import include, path
app_name = "core"

router = routers.DefaultRouter()
router.register(r"experience", ExperienceViewSet, basename="records")
router.register(r'contact-me', ContactViewSet, basename='contact-me')
router.register(r"footerstats", FooterViewSet, basename="footerstats")
router.register(r"skills", SkillViewSet, basename="skills")
router.register(r"projects/list", ProjectViewSet, basename="projects")
router.register(r"projects/paginated", PaginatedProjectViewSet,
                basename="projects-paginated")

# urls = []
urlpatterns = [
    # path("calendar", App.as_view(), name="app"),
    # path("", App.as_view(), name="app"),
    path('projects', Client.as_view(), name="client"),
    path("api/", include(router.urls)),
    path('', Client.as_view(), name="client-projects"),
]
# urlpatterns = router.urls  # + urls
