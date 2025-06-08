import ClientApp from "@/components/ui/chat/client-app";

export default function ChatPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Chat Page</h1>
      <p className="text-lg">This is the chat page for staff members.</p>
      <ClientApp />
    </div>
  );
}
