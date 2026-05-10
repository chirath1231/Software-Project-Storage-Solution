from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'start_time', 'end_time', 'meeting_link', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        """Make sure the user doesn't schedule an event that ends before it starts!"""
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError({"end_time": "End time must be after the start time."})
        return data