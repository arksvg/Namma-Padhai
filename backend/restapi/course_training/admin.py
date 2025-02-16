from django.contrib import admin
from .models import Modules, Lessons, TestQuestion, UserTestAnswer, Comment

class AdminModules(admin.ModelAdmin):
    list_display = ['id', 'module']

class AdminLessons(admin.ModelAdmin):
    list_display = ['id', 'module', 'lesson_title', 'lesson_url']

class AdminTestQuestion(admin.ModelAdmin):
    list_display = ['id', 'question', 'option1', 'option2', 'option3', 'option4', 'correct_answer']

class AdminUserTestAnswer(admin.ModelAdmin):
    list_display = ['id', 'user', 'test_question', 'answer', 'is_correct']

class AdminComment(admin.ModelAdmin):
    list_display = ['id', 'user', 'comment_text']

admin.site.register(Modules, AdminModules)
admin.site.register(Lessons, AdminLessons)
admin.site.register(TestQuestion, AdminTestQuestion)
admin.site.register(UserTestAnswer, AdminUserTestAnswer)
admin.site.register(Comment, AdminComment)
