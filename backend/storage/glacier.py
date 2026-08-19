import logging
import os

import boto3
from django.conf import settings

logger = logging.getLogger(__name__)


def upload_to_glacier(file_obj):
    """
    Copy a deleted file from the current storage backend
    to the AWS S3 archive bucket using Glacier storage.
    """

    client = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_GLACIER_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_GLACIER_SECRET_ACCESS_KEY,
        region_name=settings.AWS_GLACIER_REGION,
    )

    # Open the file from DigitalOcean Spaces
    file_obj.file.open("rb")

    try:
        # Create a safe archive key
        filename = os.path.basename(file_obj.name)

        archive_key = (
            f"deleted-files/"
            f"user-{file_obj.user.id}/"
            f"{file_obj.id}/"
            f"{filename}"
        )

        logger.info(
            "Uploading file %s to AWS bucket %s as %s",
            file_obj.id,
            settings.AWS_GLACIER_BUCKET_NAME,
            archive_key,
        )

        client.upload_fileobj(
            Fileobj=file_obj.file,
            Bucket=settings.AWS_GLACIER_BUCKET_NAME,
            Key=archive_key,
            ExtraArgs={
                "StorageClass": "GLACIER",
            },
        )

        logger.info(
            "Successfully archived file %s to AWS",
            file_obj.id,
        )

        return archive_key

    finally:
        file_obj.file.close()
