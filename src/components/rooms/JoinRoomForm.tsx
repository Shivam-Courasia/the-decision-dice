
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRoom } from "@/contexts/RoomContext";

const JoinRoomForm = () => {
  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { joinRoom } = useRoom();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    
    try {
      const room = await joinRoom(roomCode.toUpperCase());
      if (room) {
        navigate(`/room/${room.id}`);
      }
    } catch (error) {
      console.error("Failed to join room:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and remove non-alphanumeric characters
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setRoomCode(value);
  };

  return (
    <Card className="w-full max-w-md animate-scale-up">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Join a Decision Room</CardTitle>
          <CardDescription>
            Enter a room code to join an existing decision
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomCode">Room Code</Label>
            <Input
              id="roomCode"
              className="text-center text-2xl tracking-widest uppercase"
              maxLength={6}
              placeholder="ABCD12"
              value={roomCode}
              onChange={handleChange}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isJoining || roomCode.length !== 6}>
            {isJoining ? "Joining..." : "Join Room"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default JoinRoomForm;
