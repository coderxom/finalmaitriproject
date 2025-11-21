from tkinter import *
from tkinter import ttk
from PIL import Image, ImageTk
import time
import threading

class ChatbotUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🌌 MAITRI – AI Counseling Assistant")
        self.root.geometry("1100x700+70+30")
        self.root.config(bg="#0f1419")

        # ===== Left Sidebar =====
        sidebar = Frame(self.root, bg="#141a21", width=280)
        sidebar.pack(side=LEFT, fill=Y)

        Label(sidebar, text="🧠 Counseling Topics", font=("Arial", 15, "bold"),
              bg="#141a21", fg="#00d4ff", pady=15).pack()

        self.topics = {
            "🏠 Isolation & Homesickness": "It's natural to feel homesick 💙. Try writing journals or video calling family to feel connected.",
            "😴 Sleep & Circadian Issues": "Good sleep is vital 😴. Avoid screens before bed, use relaxation breathing, and keep a sleep schedule.",
            "😟 Stress & Anxiety": "Stress is tough 😟. Let's try a 4-7-8 breathing exercise: inhale 4s, hold 7s, exhale 8s.",
            "🧠 Cognitive Function": "To sharpen focus 🧠, try memory games, short breaks, and hydration.",
            "🤝 Crew Relationships": "Relationships are key 🤝. Try active listening and weekly group check-ins.",
            "📉 Performance Concerns": "Performance dips happen 📉. Track small wins, adjust routine, and seek peer feedback.",
            "🌍 Earth Communication": "Missing Earth 🌍? Regularly share audio/video logs, it helps reduce loneliness.",
            "💬 General Chat": "I'm always here 💬. Tell me, how are you feeling now?"
        }

        for t in self.topics.keys():
            btn = Button(sidebar, text=t, font=("Arial", 11, "bold"),
                         fg="white", bg="#1e2630", activebackground="#00d4ff",
                         activeforeground="black", bd=0, pady=12, width=26,
                         relief="flat", cursor="hand2",
                         command=lambda txt=t: self.send_topic_response(txt))
            btn.pack(pady=6, padx=12)

            # Hover effect
            btn.bind("<Enter>", lambda e, b=btn: b.config(bg="#00d4ff", fg="black"))
            btn.bind("<Leave>", lambda e, b=btn: b.config(bg="#1e2630", fg="white"))

        # ===== Right Chat Frame =====
        chat_frame = Frame(self.root, bg="#1a2332")
        chat_frame.pack(side=RIGHT, fill=BOTH, expand=True)

        # ===== Header =====
        header = Frame(chat_frame, bg="#141a21", height=70)
        header.pack(fill=X, side=TOP)

        try:
            img = Image.open("bot.png")
            img = img.resize((50, 50), Image.Resampling.LANCZOS)
            self.bot_img = ImageTk.PhotoImage(img)
            Label(header, image=self.bot_img, bg="#141a21").pack(side=LEFT, padx=12, pady=10)
        except:
            Label(header, text="🤖", font=("Arial", 32), bg="#141a21").pack(side=LEFT, padx=12, pady=10)

        self.status_label = Label(header, text="MAITRI Counselor\n● Online",
                                  font=("Arial", 11, "bold"), fg="#00ff88", bg="#141a21", justify=LEFT)
        self.status_label.pack(anchor="w", padx=6, pady=12, side=LEFT)

        # ===== Chat Display =====
        self.canvas = Canvas(chat_frame, bg="#1a2332", highlightthickness=0)
        self.scrollbar = Scrollbar(chat_frame, orient=VERTICAL, command=self.canvas.yview)
        self.scrollbar.pack(side=RIGHT, fill=Y)

        self.chat_window = Frame(self.canvas, bg="#1a2332")
        self.canvas.create_window((0, 0), window=self.chat_window, anchor="nw", width=780)
        self.canvas.pack(fill=BOTH, expand=True, side=LEFT)
        self.canvas.configure(yscrollcommand=self.scrollbar.set)
        self.chat_window.bind("<Configure>", lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all")))

        # ===== Input Area =====
        input_frame = Frame(chat_frame, bg="#141a21")
        input_frame.pack(fill=X, side=BOTTOM)

        self.entry = StringVar()
        self.entry_box = Entry(input_frame, textvariable=self.entry, font=("Arial", 12, "italic"),
                               bg="#222b36", fg="gray", insertbackground="white",
                               relief=FLAT)
        self.entry_box.insert(0, "💬 Type your message here...")
        self.entry_box.bind("<FocusIn>", self.clear_placeholder)
        self.entry_box.bind("<FocusOut>", self.add_placeholder)
        self.entry_box.pack(side=LEFT, padx=12, pady=12, ipady=10, fill=X, expand=True)

        # Buttons
        clear_btn = Button(input_frame, text="✖ Clear", font=("Arial", 12, "bold"),
                          bg="#ff4d4d", fg="white", activebackground="#cc0000",
                          activeforeground="white", relief=FLAT, bd=0,
                          padx=18, pady=10, cursor="hand2",
                          command=self.clear_chat)
        clear_btn.pack(side=RIGHT, padx=10, pady=10)

        send_btn = Button(input_frame, text="➤ Send", font=("Arial", 12, "bold"),
                          bg="#00d4ff", fg="black", activebackground="#00aacc",
                          activeforeground="white", relief=FLAT, bd=0,
                          padx=18, pady=10, cursor="hand2",
                          command=self.send_message)
        send_btn.pack(side=RIGHT, padx=10, pady=10)

        # Welcome Message
        self.insert_message("Bot", "👋 Hello! I'm MAITRI, your AI counselor. How are you feeling today?")

    # === Placeholder ===
    def clear_placeholder(self, event):
        if self.entry_box.get() == "💬 Type your message here...":
            self.entry_box.delete(0, END)
            self.entry_box.config(fg="white", font=("Arial", 12))

    def add_placeholder(self, event):
        if self.entry_box.get() == "":
            self.entry_box.insert(0, "💬 Type your message here...")
            self.entry_box.config(fg="gray", font=("Arial", 12, "italic"))

    # === Typing Animation ===
    def bot_typing(self, response):
        def task():
            for i in range(3):
                self.status_label.config(text=f"MAITRI Counselor\n⌛ Typing{'.'*(i+1)}")
                time.sleep(0.5)
            self.status_label.config(text="MAITRI Counselor\n● Online")
            self.insert_message("Bot", response)
        threading.Thread(target=task).start()

   
            
            
            
                # === Chat Bubbles ===
    def insert_message(self, sender, msg):
        bubble_frame = Frame(self.chat_window, bg="#1a2332")

        if sender == "You":
            lbl = Label(bubble_frame, text=msg, bg="#00d4ff", fg="black",
                        font=("Arial", 12, "bold"), wraplength=600, justify=LEFT,
                        padx=15, pady=10, relief=FLAT, anchor="e")
            lbl.pack(anchor="e", pady=6, padx=10, ipadx=5, ipady=3)

        else:
            lbl = Label(bubble_frame, text=msg, bg="#2c3e50", fg="white",
                        font=("Arial", 12), wraplength=600, justify=LEFT,
                        padx=15, pady=10, relief=FLAT, anchor="w")
            lbl.pack(anchor="w", pady=6, padx=10, ipadx=5, ipady=3)

        bubble_frame.pack(fill=X, pady=2)
        self.canvas.update_idletasks()
        self.canvas.yview_moveto(1.0)


        

    # === Send Message ===
    def send_message(self):
        user_input = self.entry.get().strip()
        if not user_input or user_input == "💬 Type your message here...":
            return
        self.insert_message("You", user_input)
        self.entry.set("")
        self.add_placeholder(None)

        lower_input = user_input.lower()
        if "hello" in lower_input:
            self.bot_typing("Hi astronaut! 🚀 How’s your day going?")
        elif "stress" in lower_input:
            self.bot_typing("I understand stress can be overwhelming 😟. Want to try a relaxation technique?")
        elif "isro" in lower_input:
            self.bot_typing("🚀 ISRO (Indian Space Research Organisation) is India's national space agency, known for Chandrayaan & Mangalyaan!")
        elif "maitri" in lower_input or "counselor" in lower_input:
            self.bot_typing("🌌 MAITRI is your AI Counselor — supporting astronauts emotionally & mentally during space missions 💙")
        else:
            self.bot_typing("Interesting! Tell me more...")

    # === Topic Response ===
    def send_topic_response(self, topic):
        self.insert_message("You", f"I want to talk about {topic}")
        self.bot_typing(self.topics[topic])

    # === Clear Chat ===
    def clear_chat(self):
        for widget in self.chat_window.winfo_children():
            widget.destroy()
        self.insert_message("Bot", "🧹 Chat cleared! Start fresh with me 💬")

if __name__ == "__main__":
    root = Tk()
    ui = ChatbotUI(root)
    root.mainloop()
