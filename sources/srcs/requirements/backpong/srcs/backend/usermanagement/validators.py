from django.core.exceptions import ValidationError
import os

def validate_image_extension(value):
    if not value:
        return
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = ['.png', '.jpg', '.jpeg', '.webp']
    if ext not in valid_extensions:
        raise ValidationError('Unsupported file extension. Only .png, .jpg, .jpeg, and .webp files are allowed.')