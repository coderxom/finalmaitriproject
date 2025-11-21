from tkinter import *
from chatbot import ChatbotUI

def open_chatbot():
    chatbot_window = Toplevel()
    ChatbotUI(chatbot_window)

root = Tk()
root.title("🌌 MAITRI Dashboard")
root.geometry("1200x700")
root.config(bg="#0f1419")

# ===== Header =====
Label(root, text="🌌 MAITRI – AI Assistant for Astronaut Well-Being",
      font=("Arial", 20, "bold"), bg="#0f1419", fg="#00d4ff").pack(pady=20)

# ===== Navbar =====
navbar = Frame(root, bg="#141a21")
navbar.pack(fill=X, padx=10, pady=10)

buttons = [
    ("Dashboard", lambda: print("Dashboard clicked")),
    ("Emotion Detection", lambda: print("Emotion clicked")),
    ("AI Counseling", open_chatbot),
    ("Health Monitoring", lambda: print("Health clicked")),
    ("Reports & Analytics", lambda: print("Reports clicked")),
    ("Settings", lambda: print("Settings clicked"))
]

for text, cmd in buttons:
    Button(navbar, text=text, command=cmd, bg="#1e2630", fg="white",
           activebackground="#00d4ff", activeforeground="black",
           font=("Arial", 12, "bold"), bd=0, padx=20, pady=10,
           cursor="hand2").pack(side=LEFT, padx=5)

root.mainloop()
