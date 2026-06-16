from django.db import models


from django.contrib.auth.models import User



class Ticket(models.Model):
    # Using 'choices' prevents data entry errors
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        CLOSED = 'CLOSED', 'Closed'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    # Fields made optional (blank=True) to avoid migration errors
    name = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(blank=True, null=True) 
    category = models.CharField(max_length=100, default='Uncategorized')
    
    # Using choices for structured data
    priority = models.CharField(
        max_length=20, 
        choices=Priority.choices, 
        default=Priority.MEDIUM
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.OPEN
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title