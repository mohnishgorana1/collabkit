import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
          }
        }}
      />
    </div>
  );
}