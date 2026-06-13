import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <SignIn 
        appearance={{
          elements: {
            // Tum yahan Tailwind classes inject karke Clerk components ko 
            // apne app ke theme (dark mode) ke hisab se style kar sakte ho
            formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
          }
        }}
      />
    </div>
  );
}