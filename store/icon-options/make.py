from PIL import Image, ImageDraw, ImageFont, ImageFilter
S=1024
BLUE=(26,115,232); DBLUE=(13,71,161); WHITE=(255,255,255); RED=(229,57,53)
def font(sz):
    for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf","/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"]:
        try: return ImageFont.truetype(p,sz)
        except: pass
    return ImageFont.load_default()
def star(d,cx,cy,r,fill):
    k=r*0.26; d.polygon([(cx,cy-r),(cx+k,cy-k),(cx+r,cy),(cx+k,cy+k),(cx,cy+r),(cx-k,cy+k),(cx-r,cy),(cx-k,cy-k)],fill=fill)
def grad(c1,c2):
    g=Image.new('RGBA',(S,S)); d=ImageDraw.Draw(g)
    for y in range(S):
        t=y/S; d.line([(0,y),(S,y)],fill=tuple(int(c1[i]+(c2[i]-c1[i])*t) for i in range(3))+(255,))
    return g
def rounded_bg(c1,c2):
    m=Image.new('L',(S,S),0); ImageDraw.Draw(m).rounded_rectangle([0,0,S-1,S-1],radius=230,fill=255)
    out=Image.new('RGBA',(S,S),(0,0,0,0)); out.paste(grad(c1,c2),(0,0),m); return out

# A: burbuja de chat que es una hoja con esquina doblada + estrella
def A():
    im=rounded_bg((66,133,244),(21,87,200)); d=ImageDraw.Draw(im)
    # sombra
    sh=Image.new('RGBA',(S,S),(0,0,0,0)); sd=ImageDraw.Draw(sh)
    sd.rounded_rectangle([210,190,830,760],radius=90,fill=(0,0,0,70)); sd.polygon([(300,740),(300,900),(460,740)],fill=(0,0,0,70))
    sh=sh.filter(ImageFilter.GaussianBlur(24)); im.alpha_composite(sh,(0,18))
    d=ImageDraw.Draw(im)
    d.rounded_rectangle([200,170,820,740],radius=90,fill=WHITE)
    d.polygon([(290,720),(290,880),(450,720)],fill=WHITE)
    # esquina doblada
    d.polygon([(700,170),(820,170),(820,290)],fill=(21,87,200)); d.polygon([(700,170),(700,290),(820,290)],fill=(200,220,250))
    # líneas
    for i,w in enumerate([400,330,400,240]):
        y=440+i*70; d.rounded_rectangle([290,y,290+w,y+34],radius=17,fill=(26,115,232,255) if i==0 else (190,210,240))
    star(d,370,320,80,BLUE); star(d,480,270,38,(66,133,244))
    return im

# B: impresora con burbuja saliendo
def B():
    im=rounded_bg((52,168,83),(24,128,56)) if False else rounded_bg((40,48,64),(18,22,32)); d=ImageDraw.Draw(im)
    # hoja que sale (arriba) como burbuja
    d.rounded_rectangle([290,130,734,470],radius=60,fill=WHITE)
    d.polygon([(360,450),(360,560),(470,450)],fill=WHITE)
    star(d,420,260,62,BLUE); star(d,510,215,30,(120,170,250))
    for i,w in enumerate([250,190]): d.rounded_rectangle([370,330+i*55,370+w,330+i*55+28],radius=14,fill=(180,200,235))
    # cuerpo impresora
    d.rounded_rectangle([170,500,854,800],radius=70,fill=BLUE)
    d.rounded_rectangle([250,560,774,610],radius=25,fill=(13,60,140))
    d.ellipse([720,660,770,710],fill=(140,230,160))
    # hoja impresa abajo
    d.rounded_rectangle([300,700,724,900],radius=30,fill=WHITE)
    for i in range(2): d.rounded_rectangle([350,750+i*55,650-i*80,778+i*55],radius=14,fill=(200,210,225))
    return im

# C: hoja con esquina, estrella IA y banda PDF roja
def C():
    im=rounded_bg((255,255,255),(236,241,250)); d=ImageDraw.Draw(im)
    d.rounded_rectangle([0,0,S-1,S-1],radius=230,outline=(220,226,236),width=10)
    sh=Image.new('RGBA',(S,S),(0,0,0,0)); ImageDraw.Draw(sh).rounded_rectangle([240,130,800,900],radius=60,fill=(26,60,120,60))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(26)),(0,16)); d=ImageDraw.Draw(im)
    d.rounded_rectangle([230,120,790,890],radius=60,fill=WHITE,outline=(210,218,230),width=8)
    d.polygon([(640,120),(790,120),(790,270)],fill=(236,241,250)); d.polygon([(640,120),(640,270),(790,270)],fill=(205,220,245))
    star(d,420,330,120,BLUE); star(d,580,250,55,(100,160,245))
    # banda PDF
    d.rounded_rectangle([150,560,700,760],radius=40,fill=RED)
    f=font(150); tw=d.textlength("PDF",font=f); d.text((425-tw/2,568),"PDF",font=f,fill=WHITE)
    for i,w in enumerate([400,300]): d.rounded_rectangle([300,800-0+i*0,300+w,800+30],radius=15,fill=(210,218,230)) if i==0 else None
    return im

opts={'A':A(),'B':B(),'C':C()}
for k,im in opts.items(): im.save(f'option-{k}-1024.png')

# hoja comparativa
W=1500; H=620; sheet=Image.new('RGB',(W,H),(250,250,252)); sd=ImageDraw.Draw(sheet)
f=font(40); fs=font(22)
for i,(k,im) in enumerate(opts.items()):
    x=40+i*490
    sd.text((x,20),f"Opción {k}",font=f,fill=(30,30,30))
    big=im.resize((300,300),Image.LANCZOS); sheet.paste(big,(x,80),big)
    # barra clara y oscura con 32 y 16 px (tamaño real)
    for j,(bg,label) in enumerate([((241,243,244),'Barra clara'),((53,54,58),'Barra oscura')]):
        y=410+j*95; sd.rounded_rectangle([x,y,x+420,y+80],radius=14,fill=bg)
        for size,ox in [(48,20),(32,100),(16,160)]:
            s=im.resize((size,size),Image.LANCZOS); sheet.paste(s,(x+ox,y+40-size//2),s)
        sd.text((x+200,y+28),label+" · 48/32/16",font=fs,fill=(120,120,120) if j==0 else (200,200,200))
sheet.save('comparativa.png')
