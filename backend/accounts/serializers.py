# accounts/serializers.py

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
    #     extra_kwargs = {"email": {"required": True}}

    # def validate(self, data):
    #     if data["password"] != data["password2"]:
    #         raise serializers.ValidationError({"password": "Passwords do not match"})
    #     return data

    # def create(self, validated_data):
    #     validated_data.pop("password2")
    #     first_name = validated_data.pop("first_name", "")
    #     last_name = validated_data.pop("last_name", "")

    #     user = User.objects.create_user(
    #         username=validated_data["username"],
    #         email=validated_data["email"],
    #         password=validated_data["password"],
    #         first_name=validated_data.get("first_name", ""),
    #         last_name=validated_data.get("last_name", "")
    #     )

        extra_kwargs = {
            "email": {"required": True},
            "username": {"required": True}
        }

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return data

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def create(self, validated_data):
        validated_data.pop("password2")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"]
        )

        # Automatically create profile
        Profile.objects.get_or_create(user=user)
        return user


# -------------------------
# Login Serializer
# -------------------------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        # find the username from the email
        try:
            username = User.objects.get(email=email).username
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password")

        # authenticate user
        user = authenticate(username=username, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        data["user"] = user
        return data
    
# -------------------------
# Forget Password Serializer
# -------------------------
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=6)

class GoogleAuthSerializer(serializers.Serializer):
    token = serializers.CharField()
 
# -------------------------
# Profile Serializer
# -------------------------
# accounts/serializers.py
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)

    class Meta:
        model = Profile
        fields = [
            'username', 'first_name', 'last_name', 'email',
            'address', 'contact_number', 'city', 'state'
        ]

    def update(self, instance, validated_data):
        # Update user fields
        user_data = validated_data.pop('user', {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()

        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile

class ProfileUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Profile
        fields = ["username", "first_name", "last_name", "contact_number", "city", "state", "address"]

    def update(self, instance, validated_data):
        # Update User fields
        user = instance.user
        if 'username' in validated_data:
            user.username = validated_data.pop('username')
        if 'first_name' in validated_data:
            user.first_name = validated_data.pop('first_name')
        if 'last_name' in validated_data:
            user.last_name = validated_data.pop('last_name')
        user.save()

        # Update remaining Profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance