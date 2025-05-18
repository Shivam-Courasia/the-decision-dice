
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CreateRoomForm from "@/components/rooms/CreateRoomForm";
import JoinRoomForm from "@/components/rooms/JoinRoomForm";
import AppHeader from "@/components/layout/AppHeader";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="game-container">
        <section className="py-12 md:py-20">
          <h1 className="game-headline">
            Make Group Decisions Fun & Fair
          </h1>
          <p className="game-subheading max-w-2xl mx-auto">
            Create decision rooms, invite friends, vote anonymously, and let the games decide when there's a tie!
          </p>

          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild size="lg" className="animate-fall-in">
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-12 grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-6 text-center">Create a Decision Room</h2>
                <CreateRoomForm />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-6 text-center">Join a Decision Room</h2>
                <JoinRoomForm />
              </div>
            </div>
          )}
        </section>

        <section className="py-12 md:py-16">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="game-card text-center">
              <div className="w-16 h-16 bg-dice rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Create or Join a Room</h3>
              <p className="text-muted-foreground">
                Start a decision room and invite friends, or join an existing room with a code
              </p>
            </div>
            
            <div className="game-card text-center">
              <div className="w-16 h-16 bg-spinner rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Submit & Vote</h3>
              <p className="text-muted-foreground">
                Add your options, then vote anonymously on the best choice
              </p>
            </div>
            
            <div className="game-card text-center">
              <div className="w-16 h-16 bg-coin rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Your Result</h3>
              <p className="text-muted-foreground">
                See the voting results, and break ties with fun randomizers
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} DiceyDecisions. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
