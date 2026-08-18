import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sharing', '0001_initial'),
        ('storage', '0009_folder_file_folder'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='FolderShare',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('link_permission', models.CharField(choices=[('read', 'Read Only'), ('read_upload', 'Read & Upload')], default='read', max_length=20)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('folder', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='shares', to='storage.folder')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='owned_folder_shares', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('folder', 'owner')},
            },
        ),
        migrations.CreateModel(
            name='FolderShareCollaborator',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254)),
                ('permission', models.CharField(choices=[('read', 'Read Only'), ('read_upload', 'Read & Upload')], default='read', max_length=20)),
                ('added_at', models.DateTimeField(auto_now_add=True)),
                ('share', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='collaborators', to='sharing.foldershare')),
            ],
            options={
                'ordering': ['email'],
                'unique_together': {('share', 'email')},
            },
        ),
    ]
