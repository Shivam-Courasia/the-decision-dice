
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoom } from "@/contexts/RoomContext";
import AppHeader from "@/components/layout/AppHeader";
import RoomCard from "@/components/rooms/RoomCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";

const Rooms = () => {
  const { user, isAuthenticated } = useAuth();
  const { userRooms } = useRoom();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Filter active and closed rooms
  const activeRooms = userRooms.filter(room => room.isOpen);
  const closedRooms = userRooms.filter(room => !room.isOpen);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="game-container">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Decision Rooms</h1>
          <Button asChild>
            <Link to="/">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Room
            </Link>
          </Button>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Active Rooms</h2>
          {activeRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRooms.map(room => (
                <RoomCard 
                  key={room.id} 
                  room={room} 
                  isCreator={room.creatorId === user.id}
                />
              ))}
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <p className="text-lg mb-4">You don't have any active decision rooms.</p>
              <Button asChild>
                <Link to="/">Create Your First Decision Room</Link>
              </Button>
            </div>
          )}
        </div>

        {closedRooms.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Past Decisions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedRooms.map(room => (
                <RoomCard 
                  key={room.id} 
                  room={room} 
                  isCreator={room.creatorId === user.id}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Rooms;
