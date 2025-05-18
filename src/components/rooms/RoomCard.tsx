
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Room } from "@/contexts/RoomContext";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface RoomCardProps {
  room: Room;
  isCreator: boolean;
}

const RoomCard = ({ room, isCreator }: RoomCardProps) => {
  const getStatusBadge = () => {
    if (!room.isOpen) {
      return <Badge variant="secondary">Closed</Badge>;
    }
    if (room.votingOpen) {
      return <Badge variant="destructive">Voting Open</Badge>;
    }
    return <Badge variant="outline">Adding Options</Badge>;
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{room.title}</CardTitle>
            <CardDescription>
              Created {formatDate(new Date(room.createdAt))}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {room.description || "No description provided"}
        </p>
        <div className="flex justify-between text-sm">
          <span>{room.participants.length} participants</span>
          <span>{room.options.length} options</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isCreator && (
          <p className="text-xs text-muted-foreground">You created this room</p>
        )}
        <Button asChild className="ml-auto">
          <Link to={`/room/${room.id}`}>
            {!room.isOpen ? "View Result" : "Enter Room"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
