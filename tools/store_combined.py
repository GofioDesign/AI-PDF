# Descripción única multilingüe (< 16.000 caracteres) para pegar en todos los idiomas de la ficha.
#   python3 tools/store_combined.py  -> store/descripcion-combinada.txt
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from store_descriptions import D, REPO

SHORT = [
 ('🇫🇷 Français', "Enregistrez en PDF ou imprimez vos conversations avec n’importe quelle IA ou n’importe quel site, dans une vue épurée sans menus ni boutons. Code coloré (Prism, Highlight.js…), tableaux, images et formules ; conversations complètes, même longues. Réglages : titre, masquer vos messages, mode compact, taille du texte, mention en pied de page facultative. Tout est traité dans votre navigateur ; rien n’est envoyé à un serveur."),
 ('🇩🇪 Deutsch', "Speichern oder drucken Sie Gespräche mit jeder KI oder Website als PDF – in einer sauberen Ansicht ohne Menüs und Schaltflächen. Code mit Syntaxhervorhebung (Prism, Highlight.js …), Tabellen, Bilder und Formeln; vollständige Gespräche, auch lange. Einstellungen: Titel, eigene Nachrichten ausblenden, Kompaktmodus, Schriftgröße, abschaltbarer Hinweis in der Fußzeile. Alles wird im Browser verarbeitet; nichts wird an Server gesendet."),
 ('🇮🇹 Italiano', "Salva in PDF o stampa le conversazioni con qualsiasi IA o sito, in una vista pulita senza menu né pulsanti. Codice evidenziato (Prism, Highlight.js…), tabelle, immagini e formule; conversazioni complete, anche lunghe. Impostazioni: titolo, nascondere i tuoi messaggi, modalità compatta, dimensione del testo, credito a piè di pagina facoltativo. Tutto avviene nel browser; nulla viene inviato a server."),
 ('🇧🇷 Português (Brasil)', "Salve em PDF ou imprima conversas com qualquer IA ou site, em uma visão limpa sem menus nem botões. Código destacado (Prism, Highlight.js…), tabelas, imagens e fórmulas; conversas completas, mesmo longas. Ajustes: título, ocultar suas mensagens, modo compacto, tamanho da letra, crédito opcional no rodapé. Tudo é processado no navegador; nada é enviado a servidores."),
 ('🇵🇹 Português (Portugal)', "Guarde em PDF ou imprima conversas com qualquer IA ou site, numa vista limpa sem menus nem botões. Código realçado (Prism, Highlight.js…), tabelas, imagens e fórmulas; conversas completas, mesmo longas. Ajustes: título, ocultar as suas mensagens, modo compacto, tamanho da letra, crédito opcional no rodapé. Tudo é processado no navegador; nada é enviado para servidores."),
 ('🇳🇱 Nederlands', "Sla gesprekken met elke AI of website op als pdf of druk ze af, in een strak overzicht zonder menu’s of knoppen. Code met syntaxismarkering (Prism, Highlight.js …), tabellen, afbeeldingen en formules; volledige gesprekken, ook lange. Instellingen: titel, eigen berichten verbergen, compacte modus, lettergrootte, optionele vermelding in de voettekst. Alles gebeurt in je browser; er gaat niets naar een server."),
 ('🇵🇱 Polski', "Zapisuj do PDF lub drukuj rozmowy z dowolną AI lub stroną w przejrzystym widoku bez menu i przycisków. Kod z podświetlaniem składni (Prism, Highlight.js…), tabele, obrazy i wzory; pełne rozmowy, także długie. Ustawienia: tytuł, ukrywanie własnych wiadomości, tryb kompaktowy, rozmiar czcionki, opcjonalna informacja w stopce. Wszystko dzieje się w przeglądarce; nic nie jest wysyłane na serwer."),
 ('🇹🇷 Türkçe', "Herhangi bir yapay zekâ veya sitedeki sohbetleri menü ve düğme olmadan temiz bir görünümde PDF olarak kaydedin veya yazdırın. Sözdizimi vurgulu kod (Prism, Highlight.js…), tablolar, görseller ve formüller; uzunlar dâhil eksiksiz sohbetler. Ayarlar: başlık, kendi mesajlarını gizleme, sıkı mod, yazı boyutu, isteğe bağlı altbilgi notu. Her şey tarayıcıda işlenir; hiçbir şey sunucuya gönderilmez."),
 ('🇷🇺 Русский', "Сохраняйте в PDF или печатайте диалоги с любым ИИ или сайтом в чистом виде, без меню и кнопок. Код с подсветкой синтаксиса (Prism, Highlight.js…), таблицы, изображения и формулы; полные диалоги, даже длинные. Настройки: заголовок, скрытие своих сообщений, компактный режим, размер шрифта, отключаемая подпись внизу. Всё обрабатывается в браузере; ничего не отправляется на серверы."),
 ('🇯🇵 日本語', "あらゆる AI やサイトの会話を、メニューやボタンのないすっきりした表示で PDF 保存・印刷できます。コードの色分け（Prism、Highlight.js など）、表、画像、数式に対応し、長い会話も全体を取り込みます。タイトル編集、自分のメッセージの非表示、コンパクト表示、文字サイズ、フッターのクレジット（任意）を設定可能。処理はすべてブラウザ内で行われ、サーバーには何も送信されません。"),
 ('🇰🇷 한국어', "모든 AI와 사이트의 대화를 메뉴나 버튼 없는 깔끔한 화면으로 PDF 저장하거나 인쇄하세요. 구문 강조 코드(Prism, Highlight.js 등), 표, 이미지, 수식을 지원하며 긴 대화도 전체를 담습니다. 제목 편집, 내 메시지 숨기기, 간결 모드, 글자 크기, 선택적 바닥글 표시를 설정할 수 있습니다. 모든 처리는 브라우저에서 이루어지며 서버로 전송되지 않습니다."),
 ('🇨🇳 简体中文', "以简洁视图（无菜单和按钮）将任何 AI 或网站上的对话保存为 PDF 或打印。支持代码语法高亮（Prism、Highlight.js 等）、表格、图片和公式，长对话也能完整保存。可设置标题、隐藏自己的消息、紧凑模式、字号以及可选的页脚署名。所有处理均在浏览器中完成，不会发送到任何服务器。"),
 ('🇹🇼 繁體中文', "以簡潔檢視（無選單和按鈕）將任何 AI 或網站上的對話儲存為 PDF 或列印。支援程式碼語法醒目顯示（Prism、Highlight.js 等）、表格、圖片和公式，長對話也能完整保存。可設定標題、隱藏自己的訊息、緊湊模式、字級以及可選的頁尾署名。所有處理均在瀏覽器中完成，不會傳送到任何伺服器。"),
]

text = '🇪🇸 Español\n\n' + D['es'] + '\n\n————————————————————\n\n🇬🇧 English\n\n' + D['en'] + '\n\n————————————————————\n\n' + \
       '\n\n'.join(f'{t}\n{p}' for t, p in SHORT) + f'\n\n{REPO}'
here = os.path.dirname(os.path.abspath(__file__))
open(os.path.join(here, '..', 'store', 'descripcion-combinada.txt'), 'w', encoding='utf-8').write(text)
print(len(text), 'caracteres')
