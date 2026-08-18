from django.db import migrations, models
import storage.models


class Migration(migrations.Migration):

    dependencies = [
        ('storage', '0007_delete_sharelink'),
    ]

    operations = [
        migrations.AlterField(
            model_name='file',
            name='file',
            field=models.FileField(upload_to=storage.models.user_upload_path),
        ),
    ]
