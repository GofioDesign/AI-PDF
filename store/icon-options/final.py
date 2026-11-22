from PIL import Image, ImageDraw, ImageFilter
exec(open('make.py').read().split("opts={")[0])  # reutiliza funciones (S, C, font, star…)
big=C()
out='/home/claude/ai-print/extension/icons/'
for s in (48,128): big.resize((s,s),Image.LANCZOS).save(out+f'icon-{s}.png')
# versión simplificada para 16 y 32: hoja + estrella + banda roja sin texto
def simple():
    im=Image.new('RGBA',(S,S),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.rounded_rectangle([0,0,S-1,S-1],radius=200,fill=(255,255,255),outline=(200,208,220),width=36)
    d.rounded_rectangle([210,90,814,934],radius=70,fill=(255,255,255),outline=(150,165,190),width=48)
    d.polygon([(640,90),(814,90),(814,264)],fill=(205,220,245))
    star(d,512,340,190,BLUE)
    d.rounded_rectangle([130,600,894,820],radius=60,fill=RED)
    return im
sm=simple()
sm.resize((32,32),Image.LANCZOS).save(out+'icon-32.png')
sm.resize((16,16),Image.LANCZOS).save(out+'icon-16.png')
# vista previa
prev=Image.new('RGB',(420,200),(241,243,244)); pd=ImageDraw.Draw(prev); pd.rectangle([0,100,420,200],fill=(53,54,58))
for row in (0,1):
    x=20
    for s in (128,48,32,16):
        ic=Image.open(out+f'icon-{s}.png').convert('RGBA')
        if s==128: ic=ic.resize((80,80),Image.LANCZOS)
        prev.paste(ic,(x,row*100+50-ic.height//2),ic); x+=ic.width+30
prev.save('preview-final.png')
