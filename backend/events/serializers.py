from django.utils import timezone
from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'start_time', 'end_time', 'meeting_link', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        # On partial updates, fall back to the existing values
        start = data.get('start_time', getattr(self.instance, 'start_time', None))
        end = data.get('end_time', getattr(self.instance, 'end_time', None))

        # Meetings cannot be booked in the past. Only checked when a start
        # time is being set, so editing e.g. the title of an old meeting works.
        if 'start_time' in data and data['start_time'] < timezone.now():
            raise serializers.ValidationError(
                {"start_time": "You cannot schedule a meeting in the past."}
            )

        if start and end and start >= end:
            raise serializers.ValidationError({"end_time": "End time must be after the start time."})
        return data
