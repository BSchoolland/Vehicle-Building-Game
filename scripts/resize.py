import os
from PIL import Image

# specify the directory you want to resize images in
directory = './public/img/'

# specify the maximum size
max_size = (150, 150)

# iterate over the files in the directory
for filename in os.listdir(directory):
    print(filename)
    # check if the file is an image
    if filename.endswith(".jpg") or filename.endswith(".png"):
        # open the image file
        img = Image.open(os.path.join(directory, filename))
        # resize the image while maintaining aspect ratio
        img.thumbnail(max_size)
        # make the image a square by measuring the shorter side and cropping the longer side
        width, height = img.size
        if width != height:
            if width > height:
                left = (width - height) / 2
                top = 0
                right = (width + height) / 2
                bottom = height
                img = img.crop((left, top, right, bottom))
            else:
                left = 0
                top = (height - width) / 2
                right = width
                bottom = (height + width) / 2
                img = img.crop((left, top, right, bottom))

        # save the resized image with a prefix of "resized_"
        img.save(os.path.join(directory, filename))