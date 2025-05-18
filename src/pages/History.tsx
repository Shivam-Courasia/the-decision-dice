
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRoom } from "@/contexts/RoomContext";
import AppHeader from "@/components/layout/AppHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const History = () => {
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

  // Get only completed decisions with results
  const completedDecisions = userRooms.filter(room => 
    !room.isOpen && room.result && room.result.winningOptionId
  );

  // Sort by resolved date, most recent first
  const sortedDecisions = [...completedDecisions].sort((a, b) => {
    const dateA = a.result?.resolvedAt ? new Date(a.result.resolvedAt).getTime() : 0;
    const dateB = b.result?.resolvedAt ? new Date(b.result.resolvedAt).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="game-container">
        <h1 className="text-3xl font-bold mb-8">Decision History</h1>

        {sortedDecisions.length > 0 ? (
          <div className="space-y-6">
            {sortedDecisions.map(decision => {
              const winningOption = decision.options.find(
                o => o.id === decision.result?.winningOptionId
              );

              return (
                <Link
                  key={decision.id}
                  to={`/room/${decision.id}`}
                  className="block hover:no-underline"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h2 className="text-xl font-semibold">{decision.title}</h2>
                          <div className="text-sm text-muted-foreground">
                            {decision.result?.resolvedAt && 
                              format(new Date(decision.result.resolvedAt), "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        </div>
                        
                        <div className="mt-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground mr-2">
                              Winner:
                            </span>
                            <span className="font-medium">{winningOption?.text || "Unknown"}</span>
                          </div>
                          
                          <div>
                            <span className="text-sm text-muted-foreground mr-2">
                              Votes:
                            </span>
                            <span>{winningOption?.votes.length || 0}</span>
                          </div>
                          
                          {decision.result?.tiebreaker && (
                            <Badge variant="outline" className="capitalize w-fit">
                              {decision.result.tiebreaker} tiebreaker
                            </Badge>
                          )}
                          
                          {decision.creatorId === user.id && (
                            <Badge variant="secondary" className="w-fit">
                              You created this
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <p className="text-lg mb-4">No completed decisions yet.</p>
            <p className="text-muted-foreground">
              As you make decisions with your groups, they'll appear here for reference.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
