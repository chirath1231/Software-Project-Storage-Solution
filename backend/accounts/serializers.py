from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import Profile



# -------------------------
# Register Serializer
# -------------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(
        write_only=True, required=True, label="Confirm password"
    )
    first_name = serializers.CharField(required=False, allow_blank=False)
    last_name = serializers.CharField(required=False, allow_blank=False)

    class Meta:
        model = User
        fields = ("username", "email", "password", "password2", "first_name", "last_name")
        extra_kwargs = {
            "email": {"required": True},
            "username": {"required": True}
        }

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return data

    def validate_username(self, value):
        val = value.strip()
        user = self.instance
        qs = User.objects.filter(username__iexact=val)
        if user:
            qs = qs.exclude(id=user.id)
        if qs.exists():
            raise serializers.ValidationError("Username already exists.")
        return val

    def validate_email(self, value):
        val = value.strip().lower()
        user = self.instance
        qs = User.objects.filter(email__iexact=val)
        if user:
            qs = qs.exclude(id=user.id)
        if qs.exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return val

    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", "")
        )
        # Automatically create profile for the new user
        Profile.objects.get_or_create(user=user)
        return user


# -------------------------
# Profile Serializers
# -------------------------
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = [
            'username', 'first_name', 'last_name', 'email',
            'address', 'contact_number', 'city', 'state', 'country', 'profile_picture'
        ]

    def update(self, instance, validated_data):
        # Extract the fields that belong to the User model
        user = instance.user
        user_fields = ['username', 'first_name', 'last_name', 'email']
        user_updated = False

        for field in user_fields:
            if field in validated_data:
                # If source='user.username' is used, the key is in validated_data
                # but we must pop it so it doesn't crash the Profile update
                val = validated_data.pop(field)
                setattr(user, field, val)
                user_updated = True
        
        if user_updated:
            user.save()

        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class ProfileUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True, allow_empty_file=True)

    class Meta:
        model = Profile
        fields = [
            'username', 'email', 'first_name', 'last_name', 'address', 'contact_number',
            'city', 'state', 'country', 'profile_picture'
        ]

    def update(self, instance, validated_data):
        # Update User model fields
        user = instance.user
        if 'username' in validated_data:
            user.username = validated_data.pop('username')
        if 'first_name' in validated_data:
            user.first_name = validated_data.pop('first_name')
        if 'last_name' in validated_data:
            user.last_name = validated_data.pop('last_name')
        user.save()

        # Handle profile picture removal/update
        if 'profile_picture' in validated_data:
            if validated_data['profile_picture'] in [None, ""]:
                instance.profile_picture.delete(save=False)
                instance.profile_picture = None
            else:
                instance.profile_picture = validated_data['profile_picture']
            validated_data.pop('profile_picture', None)

        # Update Profile model fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

# -------------------------
# Login Serializer
# -------------------------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        # find the user by email
        user_obj = User.objects.filter(email__iexact=email).first()
        if not user_obj:
            raise serializers.ValidationError("Invalid email or password")

        # Check if the account is suspended
        if not user_obj.is_active:
            raise serializers.ValidationError("This account has been suspended. Please contact support.")

        # authenticate user
        user = authenticate(username=user_obj.username, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        data["user"] = user
        return data

# -------------------------
# Google Auth Serializer
# -------------------------
class GoogleAuthSerializer(serializers.Serializer):
    token = serializers.CharField()


# -------------------------
# Password Reset & Deletion Serializers
# -------------------------
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(validators=[validate_password])


class DeleteAccountSerializer(serializers.Serializer):
    password = serializers.CharField()

