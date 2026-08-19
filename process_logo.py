from PIL import Image
img = Image.open('public/mrl-logo.png').convert('RGBA')
data = img.getdata()

newData = []
for item in data:
    if item[0] > 230 and item[1] > 230 and item[2] > 230:
        newData.append((255, 255, 255, 0))
    else:
        newData.append(item)

img.putdata(newData)
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)
img.save('public/mrl-logo.png', 'PNG')
