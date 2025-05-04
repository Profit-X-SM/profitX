Instruction to running the test server locally
When you want to work on the project again, you need to restart both servers:

Start the Flask API Server:

Open a terminal window.
Navigate to your project directory: cd "D:\Winter 25\FA591\profitX"
Run the command: python TokenScorerAPI.py
Wait until you see the output indicating it's running on http://127.0.0.1:5000 and the Debugger PIN appears. Leave this terminal running.

Start the Simple HTTP Server:
Open a second, separate terminal window.
Navigate to the same project directory: cd "D:\Winter 25\FA591\profitX"
Run the command: python -m http.server 8000 (use the same port you used before, e.g., 8000).
Wait until you see the Serving HTTP on ... port 8000 ... message. Leave this terminal running too.

Website Link:
Once both servers are running again, you access your website by going to this URL in your web browser: 
http://localhost:8000 (Replace 8000 with the port number you used for the python -m http.server command if you chose a different one).






Template Credit:
TXT by HTML5 UP
html5up.net | @ajlkn
Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)


A new, fully responsive portfolio/business style website template. I've been experimenting
with minimalist styles lately and this design is one of many in the works that exemplifies
this new direction. Hope you enjoy it.

Demo images* courtesy of Unsplash, a radtastic collection of CC0 (public domain) images
you can use for pretty much whatever.

(* = Not included)

Feedback, bug reports, and comments are not only welcome, but strongly encouraged :)

AJ
aj@lkn.io | @ajlkn


Credits:

	Demo Images:
		Unsplash (unsplash.com)

	Icons:
		Font Awesome (fontawesome.io)

	Other:
		jQuery (jquery.com)
		Responsive Tools (github.com/ajlkn/responsive-tools)
	
	AI Generation:
		Chatgpt, Claude