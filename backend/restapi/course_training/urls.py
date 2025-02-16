from django.urls import path
from .views import ModuleListView, LessonListView, TestQuestionListView, SubmitTestAnswerView, CommentListView, SubmitCommentView, PoseDetectionView

urlpatterns = [
    path('modules/', ModuleListView.as_view(), name='module-list'),
    # path('lessons/', LessonListView.as_view(), name='lesson-list'),
    path('tests/', TestQuestionListView.as_view(), name='test-list'),
    path('tests/submit/', SubmitTestAnswerView.as_view(), name='test-submit'),
    path('comments/', CommentListView.as_view(), name='comment-list'),  # GET to fetch all comments
    path('comments/submit/', SubmitCommentView.as_view(), name='comment-submit'),  # POST to submit a comment
    path('pose-detection/', PoseDetectionView.as_view(), name='pose-detection'),  # POST to detect the traffic poses
]
