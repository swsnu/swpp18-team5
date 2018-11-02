# Generated by Django 2.1.2 on 2018-11-02 13:38

import api.models
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Party',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120)),
                ('type', models.SmallIntegerField(choices=[(api.models.PartyType(0), 0), (api.models.PartyType(1), 1)])),
                ('location', models.CharField(max_length=120)),
                ('since', models.DateTimeField(auto_now=True)),
                ('leader', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('members', models.ManyToManyField(related_name='parties', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
