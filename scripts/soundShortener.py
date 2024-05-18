from pydub import AudioSegment

def trim_audio(input_file, output_file, duration):
    audio = AudioSegment.from_mp3(input_file)
    trimmed_audio = audio[:duration * 350]  # Convert duration to milliseconds
    trimmed_audio.export(output_file, format="mp3")

# Usage example
input_file = "./scripts/input.mp3"
output_file = "./output.mp3"
duration = 1  # Duration in seconds

trim_audio(input_file, output_file, duration)