# Adjustments to the cloud generation and the gradient based on user feedback
from PIL import Image, ImageDraw
import numpy as np
# Define the image size and cloud parameters
img_size = (1024, 1024)
num_clouds = 5
cloud_min_size = 100
cloud_max_size = 200
block_size = 30  # Increase block size for the clouds

# Create a new image with a white background
img = Image.new("RGB", img_size, "white")

# Function to create a stepped gradient background
def create_stepped_gradient(img, num_steps):
    draw = ImageDraw.Draw(img)
    for i in range(num_steps):
        r = 135 - (i * (135 - 175) // num_steps)
        g = 206 - (i * (206 - 235) // num_steps)
        b = 235
        draw.rectangle(
            [0, i * img_size[1] // num_steps, img_size[0], (i+1) * img_size[1] // num_steps],
            fill=(r, g, b)
        )

# Function to generate a "cloud"
def draw_cloud(draw, position, size, block_size):
    for i in range(-size, size + 1, block_size):
        for j in range(-size // 2, size // 2 + 1, block_size):
            if np.random.rand() > 0.3:  # Adjust probability to make the clouds fuller
                draw.rectangle(
                    [position[0] + i, position[1] + j, position[0] + i + block_size - 1, position[1] + j + block_size - 1],
                    fill="white"
                )

# Create a stepped gradient background
create_stepped_gradient(img, 10)  # Create a gradient with 10 steps

# Draw the clouds on the stepped gradient
draw = ImageDraw.Draw(img)
for _ in range(num_clouds):  # Number of clouds
    x = np.random.randint(block_size, img_size[0] - block_size * 2)
    y = np.random.randint(block_size, img_size[1] // 2 - block_size)
    cloud_size = np.random.randint(cloud_min_size, cloud_max_size)
    draw_cloud(draw, (x, y), cloud_size, block_size)

# show the image
img.show()