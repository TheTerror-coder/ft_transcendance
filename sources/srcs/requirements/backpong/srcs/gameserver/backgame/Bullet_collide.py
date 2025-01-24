import logging
import sys

# Configuration du logging au début du fichier
logging.basicConfig(
    filename='game.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    stream=sys.stderr
)
logger = logging.getLogger(__name__)

def computeCode3d(point, hitbox):
    """
    Calcule un code binaire représentant la position d'un point par rapport à la hitbox
    Chaque bit représente une région de l'espace :
    - Bit 1 (1): Gauche
    - Bit 2 (2): Droite
    - Bit 3 (4): Bas
    - Bit 4 (8): Haut
    - Bit 5 (16): Arrière
    - Bit 6 (32): Avant
    """
    code = 0
    
    try:
        # Axe X
        if (point['x'] < hitbox['min']['x']):
            code |= 1  # gauche
        elif (point['x'] > hitbox['max']['x']):
            code |= 2  # droite
        
        # Axe Y
        if (point['y'] < hitbox['min']['y']):
            code |= 4  # bas
        elif (point['y'] > hitbox['max']['y']):
            code |= 8  # haut
            
        # Axe Z - Correction de la condition pour l'avant
        if (point['z'] < hitbox['min']['z']):
            code |= 16  # Arriere
        elif (point['z'] > hitbox['max']['z']):  # Changé de < à >
            code |= 32  # Avant
        
        return code
        
    except Exception as e:
        logger.error(f"Erreur dans computeCode3d: {e}")
        logger.error(f"Point: {point}")
        logger.error(f"Hitbox: {hitbox}")
        return 0

def expandHitBox(hitbox, margin):
    return {
        'min' : {
            'x': hitbox['min']['x'] - margin,
            'y': hitbox['min']['y'] - margin,
            'z': hitbox['min']['z'] - margin
        },
        'max' : {
            'x': hitbox['max']['x'] + margin,
            'y': hitbox['max']['y'] + margin,
            'z': hitbox['max']['z'] + margin
        }
    }
    
def calculateIntersection(p1, p2, axis, value):
    """
    Calcule le point d'intersection entre un segment et un plan
    axis: 'x', 'y', ou 'z'
    value
    """
    t = (value - p1[axis]) / (p2[axis] - p1[axis])
    
    return {
        'x': p1['x'] + t * (p2['x'] - p1['x']),
        'y': p1['y'] + t * (p2['y'] - p1['y']),
        'z': p1['z'] + t * (p2['z'] - p1['z'])
    }

def TestFaces(p1, p2, hitbox, area1, area2, axis1, axis2, axis3):
    if (p1[axis1] < hitbox[area1][axis1] and p2[axis1] > hitbox[area1][axis1]) or \
       (p2[axis1] < hitbox[area1][axis1] and p1[axis1] > hitbox[area1][axis1]):
        intersection = calculateIntersection(p1, p2, axis1, hitbox[area1][axis1])
        if (hitbox[area1][axis2] <= intersection[axis2] <= hitbox[area2][axis2] and
            hitbox[area1][axis3] <= intersection[axis3] <= hitbox[area2][axis3]):
            return True, intersection
    return False, None
  
def checkCollision(p1, p2, hitbox):
    code1 = computeCode3d(p1, hitbox)
    code2 = computeCode3d(p2, hitbox)
    
    if ((code1 & code2) != 0):
        return False, None
    
    if ((code1 == 0) and (code2 == 0)):
        return True, p1
    
    # Test des faces X (gauche et droite)
    collision, intersection = TestFaces(p1, p2, hitbox, 'min', 'max', 'x', 'y', 'z')
    if collision:
        return True, intersection
    
    collision, intersection = TestFaces(p1, p2, hitbox, 'max', 'max', 'x', 'y', 'z')
    if collision:
        return True, intersection
    
    # Test des faces Y (haut et bas)
    collision, intersection = TestFaces(p1, p2, hitbox, 'min', 'max', 'y', 'x', 'z')
    if collision:
        return True, intersection
    
    collision, intersection = TestFaces(p1, p2, hitbox, 'max', 'max', 'y', 'x', 'z')
    if collision:
        return True, intersection
    
    # Test des faces Z (avant et arrière)
    collision, intersection = TestFaces(p1, p2, hitbox, 'min', 'max', 'z', 'x', 'y')
    if collision:
        return True, intersection
    
    collision, intersection = TestFaces(p1, p2, hitbox, 'max', 'max', 'z', 'x', 'y')
    if collision:
        return True, intersection
    
    return False, None