import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { ChatMessage } from "@/components/chat-message"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatInput } from "@/components/chat-input"

const sampleMessages = [
  {
    role: "assistant" as const,
    content:
      "Hello! I'm your AI Study Buddy. I've loaded your Biology notes. Feel free to ask me any questions about the material, and I'll help you understand it better.",
  },
  {
    role: "user" as const,
    content: "Can you explain photosynthesis in simple terms?",
  },
  {
    role: "assistant" as const,
    content:
      "Of course! Photosynthesis is the process by which plants convert light energy into chemical energy. Here are the key steps:\n\n1. **Light Absorption**: Chlorophyll in leaves absorbs sunlight\n2. **Water Splitting**: Water is broken down into hydrogen and oxygen\n3. **Energy Conversion**: Light energy is converted to ATP and NADPH\n4. **Carbon Fixation**: CO₂ is combined to create glucose\n\nThe simple equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂",
    hasCode: false,
  },
  {
    role: "user" as const,
    content: "What are chloroplasts?",
  },
  {
    role: "assistant" as const,
    content:
      'Chloroplasts are specialized organelles found in plant cells where photosynthesis occurs. Think of them as the "solar panels" of the plant cell!\n\n**Key features:**\n- Contains chlorophyll (green pigment)\n- Has a double membrane (outer and inner)\n- Contains thylakoids (stacked into grana) where light reactions happen\n- Contains stroma where the Calvin cycle occurs\n- Has their own DNA (mitochondria too!)\n\nThis is why plants are green - the chlorophyll absorbs blue and red light but reflects green light back to our eyes.',
    hasCode: false,
  },
]

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar title="AI Chat" />

        <main className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-background">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {sampleMessages.map((msg, idx) => (
                <ChatMessage key={idx} role={msg.role} content={msg.content} hasCode={msg.hasCode} />
              ))}
            </div>

            {/* Input */}
            <ChatInput />
          </div>

          {/* Context Sidebar */}
          <ChatSidebar />
        </main>
      </div>
    </div>
  )
}
