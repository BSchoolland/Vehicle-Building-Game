from moviepy.editor import AudioFileClip
import os

def shorten_mp3_files(directory):
    for filename in os.listdir(directory):
        print('Checking ' + filename)
        if filename.endswith('.mp3'):
            filepath = os.path.join(directory, filename)
            
            with AudioFileClip(filepath) as audio:
                # Truncate the audio to the first 1 second
                shortened_audio = audio.subclip(0, 1)
                # make it quieter
                # Write the shortened audio
                shortened_audio.write_audiofile(filepath)
                print('Shortened ' + filepath)

# Replace with your directory path
shorten_mp3_files('./public/js/sounds/effects')
