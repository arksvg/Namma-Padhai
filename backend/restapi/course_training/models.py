from django.db import models
from user_management.models import CustomUser

class Modules(models.Model):
    module=models.CharField(max_length=200, blank=False, null=False)
    
    class Meta:
        verbose_name_plural = '01. Modules'

    def __str__(self):
        return self.module

class Lessons(models.Model):
    module = models.ForeignKey(Modules, on_delete=models.CASCADE, null=True, blank=True, related_name="lessons")
    lesson_title=models.CharField(max_length=200, blank=False, null=False)
    lesson_url=models.URLField(max_length=200, blank=False, null=False)

    class Meta:
        verbose_name_plural = '02. Lessons'

    def __str__(self):
        return self.lesson_title

class TestQuestion(models.Model):
    question = models.CharField(max_length=500, blank=False, null=False)
    option1 = models.CharField(max_length=200, blank=False, null=False)
    option2 = models.CharField(max_length=200, blank=False, null=False)
    option3 = models.CharField(max_length=200, blank=False, null=False)
    option4 = models.CharField(max_length=200, blank=False, null=False)
    correct_answer = models.CharField(max_length=200, blank=False, null=False)  # Store the correct answer

    class Meta:
        verbose_name_plural = '03. TestQuestions'

    def __str__(self):
        return self.question

class UserTestAnswer(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="user_answers")
    test_question = models.ForeignKey(TestQuestion, on_delete=models.CASCADE, related_name="user_responses")
    answer = models.CharField(max_length=200, blank=False, null=False)
    is_correct = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = '04. UserTestAnswers'

    def save(self, *args, **kwargs):
        self.is_correct = self.answer == self.test_question.correct_answer
        super().save(*args, **kwargs)

class Comment(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="comments")
    comment_text = models.TextField(blank=False, null=False)

    class Meta:
        verbose_name_plural = '05. Comment'

    def __str__(self):
        return f"Comment by {self.user.username}"

    class Meta:
        verbose_name_plural = 'Comments'

