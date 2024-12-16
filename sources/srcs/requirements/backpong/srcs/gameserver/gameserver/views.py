from django.http import HttpResponse, JsonResponse

def healthcheck(request):
	return (HttpResponse('healthy'));
def test(request):
	return (HttpResponse('healthy'));