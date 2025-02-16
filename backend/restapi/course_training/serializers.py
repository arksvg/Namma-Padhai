from rest_framework import serializers
from .models import Modules, Lessons, TestQuestion, UserTestAnswer, Comment
from user_management.models import CustomUser
from rest_framework import serializers

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lessons
        fields = ['id', 'lesson_title', 'lesson_url']

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)  # Nested lessons under modules

    class Meta:
        model = Modules
        fields = ['id', 'module', 'lessons']

class TestQuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()

    class Meta:
        model = TestQuestion
        fields = ['id', 'question', 'options']

    def get_options(self, obj):
        return [obj.option1, obj.option2, obj.option3, obj.option4]

class UserTestAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTestAnswer
        fields = ['id', 'test_question', 'answer']

class TestEvaluationSerializer(serializers.ModelSerializer):
    correct_incorrect = serializers.BooleanField(source='is_correct')

    class Meta:
        model = UserTestAnswer
        fields = ['id', 'correct_incorrect']

class CommentSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'name', 'comment_text']

    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
class ImageSerializer(serializers.Serializer):
    image_base64 = serializers.CharField()
