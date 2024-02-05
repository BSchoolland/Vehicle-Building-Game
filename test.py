import math

def rotate_shape(vertices, rotation_point, angle_degrees):
    # Convert angle from degrees to radians
    angle_radians = math.radians(angle_degrees)
    
    # Unpack the rotation point
    x_r, y_r = rotation_point
    
    # Translated and rotated vertices
    rotated_vertices = []
    
    for x, y in vertices:
        # Translate points to origin
        x_translated, y_translated = x - x_r, y - y_r
        
        # Apply rotation
        x_rotated = x_translated * math.cos(angle_radians) - y_translated * math.sin(angle_radians)
        y_rotated = x_translated * math.sin(angle_radians) + y_translated * math.cos(angle_radians)
        
        # Translate points back
        x_new = x_rotated + x_r
        y_new = y_rotated + y_r
        
        # Append the new vertex to the list of rotated vertices
        rotated_vertices.append((x_new, y_new))
    
    return rotated_vertices

# Example usage
vertices = [(1, 1), (1, 2), (2, 2), (2, 1)]  # Define a square shape
rotation_point = (1.5, 1.5)  # Center of the square
angle_degrees = 45  # Rotate 45 degrees

rotated_vertices = rotate_shape(vertices, rotation_point, angle_degrees)
print("Rotated Vertices:", rotated_vertices)
