from django.contrib import admin
from .models import Party, Restaurant, Menu, Payment

admin.site.register(Party)
admin.site.register(Restaurant)
admin.site.register(Menu)
admin.site.register(Payment)
