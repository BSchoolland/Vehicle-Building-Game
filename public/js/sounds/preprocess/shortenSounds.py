from moviepy.editor import AudioFileClip
import os

def shorten_mp3_files(directory):
    for filename in os.listdir(directory):
        print('Checking ' + filename)
        if filename.endswith('.mp3'):
            filepath = os.path.join(directory, filename)
            
            with AudioFileClip(filepath) as audio:
                # Truncate the audio to the first 1 second
                shortened_audio = audio.subclip(0, 1.35)
                # make it quieter
                # Write the shortened audio
                shortened_audio.write_audiofile(filepath)
                print('Shortened ' + filepath)

def louden_mp3_files(directory, volume_increase_factor=2.0):
    for filename in os.listdir(directory):
        if filename.endswith('.mp3'):
            filepath = os.path.join(directory, filename)
            with AudioFileClip(filepath) as audio:
                # Make it louder
                louder_audio = audio.volumex(volume_increase_factor)
                # Write the louder audio
                louder_audio.write_audiofile(filepath)
                print(f'Loudened {filepath}')

# Replace with your directory path
louden_mp3_files('./public/js/sounds/preprocess')
