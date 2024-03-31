from PIL import Image
import os

# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the path to the image
image_path = os.path.join(script_dir, "input.png")

# Open the image
image = Image.open(image_path).convert("RGBA")
threshold = 100

pixels = image.load()

width, height = image.size
for x in range(width):
    for y in range(height):
        r, g, b, a = pixels[x, y]
        if a < threshold:
            pixels[x, y] = (r, g, b, 0)
        else:
            pixels[x, y] = (r, g, b, 255)  # Make pixel fully opaque

image.save("output.png")