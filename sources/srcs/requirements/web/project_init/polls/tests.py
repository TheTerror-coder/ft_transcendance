import datetime

from django.test import TestCase
from django.test import Client
from django.utils import timezone
from django.urls import reverse
from .models import Question


def	create_question(question_text, days):
	"""
		Create a question with the given `question_text` and published the
		given number of `days` offset to now (negative for questions published
		in the past, positive for questions that have yet to be published).
	"""
	time = timezone.now() + datetime.timedelta(days=days)
	return (Question.objects.create(question_text=question_text, pub_date=time))


class	QuestionModelTests(TestCase):
	def test_was_published_recently_with_future_question(self):
		time = timezone.now() + datetime.timedelta(days=30)
		future_question = Question(pub_date=time)
		self.assertIs(future_question.was_published_recently(), False)
	
	def test_was_published_recently_with_old_question(self):
		time = timezone.now() - datetime.timedelta(days=30)
		past_question = Question(pub_date=time)
		self.assertIs(past_question.was_published_recently(), False)
	
	def test_was_published_recently_with_recent_question(self):
		time = timezone.now() - datetime.timedelta(hours=23, minutes=59, seconds=59)
		recent_question = Question(pub_date=time)
		self.assertIs(recent_question.was_published_recently(), True)

class	QuestionIndexViewTests(TestCase):
	def	test_no_question(self):
		response = self.client.get(reverse("polls:index"))
		self.assertEqual(response.status_code, 200)
		self.assertContains(response, "No polls are available.")
		self.assertQuerySetEqual(response.context["latest_question_list"], [])

	def	test_past_question(self):
		question = create_question("past question.", -30)
		response = self.client.get(reverse("polls:index"))
		self.assertEqual(response.status_code, 200)
		self.assertNotContains(response, "No polls are available.")
		self.assertQuerySetEqual(response.context["latest_question_list"], [question])
	
	def	test_future_question(self):
		create_question("future question.", +30)
		response = self.client.get(reverse("polls:index"))
		self.assertEqual(response.status_code, 200)
		self.assertContains(response, "No polls are available.")
		self.assertQuerySetEqual(response.context["latest_question_list"], [])
	
	def	test_past_question_and_future_question(self):
		question = create_question("past question.", -3)
		create_question("future question.", +1)
		response = self.client.get(reverse("polls:index"))
		self.assertEqual(response.status_code, 200)
		self.assertNotContains(response, "No polls are available.")
		self.assertQuerySetEqual(response.context["latest_question_list"], [question])
	
	def	test_two_past_questions(self):
		question1 = create_question("past question1.", -1)
		question2 = create_question("past question2.", -100)
		response = self.client.get(reverse("polls:index"))
		self.assertEqual(response.status_code, 200)
		self.assertNotContains(response, "No polls are available.")
		self.assertQuerySetEqual(response.context["latest_question_list"], [question1, question2])

class	QuestionDetailViewTests(TestCase):
	def	test_no_question(self):
		response = self.client.get(reverse("polls:detail", args=(1, )))
		self.assertEqual(response.status_code, 404)

	def	test_past_question_and_unexisting_question(self):
		question = create_question("past question.", -30)
		response = self.client.get(reverse("polls:detail", args=(question.id, )))
		self.assertEqual(response.status_code, 200)
		self.assertNotContains(response, "No polls are available.")
		response2 = self.client.get(reverse("polls:detail", args=(question.id + 1, )))
		self.assertEqual(response2.status_code, 404)
	
	def	test_future_question(self):
		create_question("future question.", +30)
		response = self.client.get(reverse("polls:detail", args=(1, )))
		self.assertEqual(response.status_code, 404)
