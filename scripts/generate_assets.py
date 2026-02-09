from PIL import Image, ImageDraw, ImageFont
import os, math, wave, struct

# Splash
size = 2048
bg = (255, 249, 230)  # #FFF9E6
img = Image.new('RGBA', (size, size), bg)
icon_path = os.path.join('assets', 'icon-app-1024.png')
if os.path.exists(icon_path):
    icon = Image.open(icon_path).convert('RGBA')
    icon_size = int(size * 0.55)
    icon = icon.resize((icon_size, icon_size), Image.LANCZOS)
    x = (size - icon_size) // 2
    y = int(size * 0.22)
    img.alpha_composite(icon, (x, y))

draw = ImageDraw.Draw(img)
try:
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Avenir Next.ttc", 140)
except Exception:
    font = ImageFont.load_default()

text = "Solimo"
text_bbox = draw.textbbox((0, 0), text, font=font)
text_w = text_bbox[2] - text_bbox[0]
text_x = (size - text_w) // 2
text_y = int(size * 0.72)
shadow = (0, 0, 0, 35)
draw.text((text_x + 6, text_y + 6), text, font=font, fill=shadow)
draw.text((text_x, text_y), text, font=font, fill=(26, 26, 26, 255))

splash_path = os.path.join('assets', 'splash.png')
img.save(splash_path, 'PNG')

# SFX
def write_tone(path, freq=880, duration=0.22, sr=44100, volume=0.35):
    n_samples = int(sr * duration)
    fade_len = int(sr * 0.02)
    with wave.open(path, 'w') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        for i in range(n_samples):
            t = i / sr
            amp = volume
            if i < fade_len:
                amp *= i / fade_len
            elif i > n_samples - fade_len:
                amp *= (n_samples - i) / fade_len
            sample = amp * math.sin(2 * math.pi * freq * t)
            wf.writeframes(struct.pack('<h', int(sample * 32767)))

sfx_dir = os.path.join('assets', 'sfx')
os.makedirs(sfx_dir, exist_ok=True)
write_tone(os.path.join(sfx_dir, 'correct.wav'), freq=880, duration=0.18)
write_tone(os.path.join(sfx_dir, 'wrong.wav'), freq=220, duration=0.22)

print('Created assets/splash.png, assets/sfx/correct.wav, assets/sfx/wrong.wav')
