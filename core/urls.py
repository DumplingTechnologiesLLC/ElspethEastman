from core.views import (
    Client, ContactViewSet, ExperienceViewSet, FooterViewSet,
    PaginatedProjectViewSet, ProjectViewSet, SkillViewSet,
    AffiliationViewSet,  logout_view, session_view, AuthenticatedClient
)
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework import routers
from django.urls import include, path
app_name = "core"

router = routers.DefaultRouter()
router.register(r"experience", ExperienceViewSet, basename="records")
router.register(r'contact-me', ContactViewSet, basename='contact-me')
router.register(r"footerstats", FooterViewSet, basename="footerstats")
router.register(r"affiliations", AffiliationViewSet, basename="affiliations")
router.register(r"skills", SkillViewSet, basename="skills")
router.register(r"projects/list", ProjectViewSet, basename="projects")
router.register(r"projects/paginated", PaginatedProjectViewSet,
                basename="projects-paginated")

urlpatterns = [
    path('cms/', AuthenticatedClient.as_view(), name="client-cms-slash"),
    path('cms', AuthenticatedClient.as_view(), name="client-cms"),
    path('login/', Client.as_view(), name="client-login-slash"),
    path('login', Client.as_view(), name="client-login"),
    path('projects/', Client.as_view(), name="client-projects-slash"),
    path('projects', Client.as_view(), name="client-projects"),
    path('api/session/', include([
        path('login/', obtain_auth_token, name="api-token"),
        path('logout/', logout_view, name='api-logout'),
        path('', session_view, name='api-session'),
    ])),
    path("api/", include(router.urls)),
    path('', Client.as_view(), name="client"),
]
