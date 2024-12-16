from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def healthcheck(request):
    return Response('healthy!')