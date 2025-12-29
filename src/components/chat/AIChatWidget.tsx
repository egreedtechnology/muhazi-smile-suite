import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickResponses = [
  { question: "What are your working hours?", answer: "Muhazi Dental Clinic is open from 8:00 AM to 8:00 PM, 7 days a week. We're here to serve you every day!" },
  { question: "How do I book an appointment?", answer: "You can book an appointment online through our website by clicking 'Book Appointment' or call us at +250 787 630 399. We also accept walk-ins during working hours." },
  { question: "What services do you offer?", answer: "We offer a wide range of dental services including:\n• General Checkups & Cleaning\n• Teeth Whitening\n• Dental Fillings\n• Root Canal Treatment\n• Tooth Extraction\n• Dental Implants\n• Orthodontics (Braces)\n• Pediatric Dentistry" },
  { question: "Where is the clinic located?", answer: "Muhazi Dental Clinic is located in Rwamagana, Rwanda. You can find us easily using Google Maps. Click 'Get Directions' on our Contact page for navigation." },
  { question: "Do you accept walk-ins?", answer: "Yes, we accept walk-in patients! However, we recommend booking an appointment to minimize wait times, especially during peak hours." },
  { question: "What payment methods do you accept?", answer: "We accept cash, mobile money (MTN MoMo, Airtel Money), and bank transfers. Payment is typically made after treatment." },
  { question: "Do you treat children?", answer: "Absolutely! We have experienced pediatric dental care specialists who are great with children. We make dental visits fun and stress-free for kids." },
  { question: "Is teeth whitening safe?", answer: "Yes, professional teeth whitening at our clinic is safe and effective. Our dentists use approved whitening agents and customize the treatment for your teeth sensitivity level." },
];

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! 👋 I'm the Muhazi Dental Clinic assistant. How can I help you today? You can ask me about our services, working hours, or how to book an appointment.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const findBestResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    // Check for keyword matches
    for (const qr of quickResponses) {
      const keywords = qr.question.toLowerCase().split(" ");
      const matchCount = keywords.filter(keyword => 
        keyword.length > 3 && lowerQuery.includes(keyword)
      ).length;

      if (matchCount >= 2 || lowerQuery.includes(qr.question.toLowerCase().slice(0, 10))) {
        return qr.answer;
      }
    }

    // Specific keyword checks
    if (lowerQuery.includes("hour") || lowerQuery.includes("open") || lowerQuery.includes("time") || lowerQuery.includes("close")) {
      return quickResponses[0].answer;
    }
    if (lowerQuery.includes("book") || lowerQuery.includes("appointment") || lowerQuery.includes("schedule")) {
      return quickResponses[1].answer;
    }
    if (lowerQuery.includes("service") || lowerQuery.includes("treatment") || lowerQuery.includes("offer") || lowerQuery.includes("do you do")) {
      return quickResponses[2].answer;
    }
    if (lowerQuery.includes("where") || lowerQuery.includes("location") || lowerQuery.includes("address") || lowerQuery.includes("find")) {
      return quickResponses[3].answer;
    }
    if (lowerQuery.includes("walk") || lowerQuery.includes("walk-in") || lowerQuery.includes("without appointment")) {
      return quickResponses[4].answer;
    }
    if (lowerQuery.includes("pay") || lowerQuery.includes("payment") || lowerQuery.includes("money") || lowerQuery.includes("cost")) {
      return quickResponses[5].answer;
    }
    if (lowerQuery.includes("child") || lowerQuery.includes("kid") || lowerQuery.includes("pediatric") || lowerQuery.includes("baby")) {
      return quickResponses[6].answer;
    }
    if (lowerQuery.includes("whiten") || lowerQuery.includes("white")) {
      return quickResponses[7].answer;
    }
    if (lowerQuery.includes("hello") || lowerQuery.includes("hi") || lowerQuery.includes("hey")) {
      return "Hello! How can I assist you today? Feel free to ask about our dental services, booking appointments, or any other questions.";
    }
    if (lowerQuery.includes("thank")) {
      return "You're welcome! If you have any more questions, feel free to ask. We're here to help! 😊";
    }
    if (lowerQuery.includes("bye") || lowerQuery.includes("goodbye")) {
      return "Goodbye! Thank you for chatting with us. We hope to see you at Muhazi Dental Clinic soon! 🦷";
    }

    // Default response
    return "I'd be happy to help with that! For specific inquiries, please contact us directly at +250 787 630 399 or visit our clinic in Rwamagana. You can also book an appointment online through our website. Is there anything else I can help you with?";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = findBestResponse(inputValue);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 500);
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${isOpen ? "scale-0" : "scale-100"}`}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] bg-card border border-border rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">MDC Assistant</h3>
              <p className="text-xs opacity-80">We typically reply instantly</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-primary-foreground/20 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <ScrollArea className="h-[350px] p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[75%] p-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted p-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Questions */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-1">
              {quickResponses.slice(0, 4).map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(qr.question)}
                  className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full transition-colors"
                >
                  {qr.question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!inputValue.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AIChatWidget;
