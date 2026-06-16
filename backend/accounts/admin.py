from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'contact_number', 'city', 'state', 'country')
    search_fields = ('user__username', 'user__email', 'contact_number')
