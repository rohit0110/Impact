from django.db import models

class Node(models.Model):
    label = models.CharField(max_length=100)
    # Add other properties as needed

class Edge(models.Model):
    source = models.ForeignKey(Node, related_name='source_edges', on_delete=models.CASCADE)
    target = models.ForeignKey(Node, related_name='target_edges', on_delete=models.CASCADE)
    # Add other properties as needed
