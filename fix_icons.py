from PIL import Image
import os

os.makedirs('src-tauri/icons', exist_ok=True)

img = Image.new('RGB', (256, 256), color=(88, 166, 255))

img.save('src-tauri/icons/icon.ico', format='ICO', sizes=[(16,16),(32,32),(48,48),(256,256)])
img.save('src-tauri/icons/32x32.png')
img.save('src-tauri/icons/128x128.png')
img.save('src-tauri/icons/128x128@2x.png')

print('Icons created successfully.')