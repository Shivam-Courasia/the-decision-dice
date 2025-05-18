
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRoom } from "@/contexts/RoomContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import OptionItem from "@/components/rooms/OptionItem";
import DiceRoller from "@/components/tiebreakers/DiceRoller";
import Spinner from "@/components/tiebreakers/Spinner";
import CoinFlipper from "@/components/tiebreakers/CoinFlipper";

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { getRoom, activeRoom, addOption, startVoting, vote, endVoting, resolveTie, leaveRoom, deleteRoom, hasUserVoted } = useRoom();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [newOption, setNewOption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [tiebreaker, setTiebreaker] = useState<'dice' | 'spinner' | 'coin' | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (!roomId) {
      navigate("/");
      return;
    }
    
    const room = getRoom(roomId);
    if (!room) {
      toast.error("Room not found");
      navigate("/");
      return;
    }
    
    // Check if user is part of this room
    if (!room.participants.includes(user.id)) {
      toast.error("You are not a member of this room");
      navigate("/");
      return;
    }
    
    setLoading(false);
  }, [roomId, user, navigate, getRoom]);

  useEffect(() => {
    if (activeRoom && user) {
      // Check if user has already voted
      const userVote = activeRoom.options.find(option => 
        option.votes.includes(user.id)
      );
      
      if (userVote) {
        setSelectedOption(userVote.id);
      } else {
        setSelectedOption(null);
      }
    }
  }, [activeRoom, user]);

  if (loading || !activeRoom || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const isCreator = activeRoom.creatorId === user.id;
  const isVotingOpen = activeRoom.votingOpen;
  const isRoomClosed = !activeRoom.isOpen;
  const totalVotes = activeRoom.options.reduce((sum, option) => sum + option.votes.length, 0);
  const hasVoted = hasUserVoted(activeRoom.id);
  
  // Check if there's a tie
  const hasTie = !isVotingOpen && !isRoomClosed && (() => {
    const voteCounts = activeRoom.options.map(o => o.votes.length);
    const maxVotes = Math.max(...voteCounts, 0);
    return maxVotes > 0 && voteCounts.filter(count => count === maxVotes).length > 1;
  })();
  
  // Get options with max votes (for tiebreaker)
  const tiedOptions = (() => {
    if (!hasTie) return [];
    const maxVotes = Math.max(...activeRoom.options.map(o => o.votes.length), 0);
    return activeRoom.options
      .filter(o => o.votes.length === maxVotes)
      .map(o => o.text);
  })();

  const handleAddOption = async () => {
    if (!newOption.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addOption(activeRoom.id, newOption.trim());
      setNewOption("");
    } catch (error) {
      console.error("Failed to add option:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = (optionId: string) => {
    if (!isVotingOpen) return;
    setSelectedOption(optionId);
    vote(activeRoom.id, optionId);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(activeRoom.code);
    setCopySuccess(true);
    toast.success("Room code copied to clipboard!");
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleStartVoting = () => {
    if (activeRoom.options.length < 2) {
      toast.error("Need at least two options to start voting");
      return;
    }
    startVoting(activeRoom.id);
  };

  const handleEndVoting = () => {
    endVoting(activeRoom.id);
  };

  const handleResolveTie = async (method: 'dice' | 'spinner' | 'coin') => {
    setTiebreaker(method);
    setIsResolving(true);
  };

  const handleTiebreakerResult = async (winningOption: string) => {
    if (!tiebreaker) return;
    
    try {
      // Find the option ID from the option text
      const option = activeRoom.options.find(o => o.text === winningOption);
      if (option) {
        await resolveTie(activeRoom.id, tiebreaker);
      }
    } catch (error) {
      console.error("Failed to resolve tie:", error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom(activeRoom.id);
    navigate("/");
  };

  const handleDeleteRoom = () => {
    if (window.confirm("Are you sure you want to delete this room? This cannot be undone.")) {
      deleteRoom(activeRoom.id);
      navigate("/");
    }
  };

  // Get the winning option if the room is closed
  const winningOption = activeRoom.result 
    ? activeRoom.options.find(o => o.id === activeRoom.result.winningOptionId)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="game-container">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">{activeRoom.title}</h1>
              {activeRoom.description && (
                <p className="text-muted-foreground mt-1">{activeRoom.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-muted px-3 py-1.5 rounded-md">
                <span className="text-sm font-medium mr-2">Room Code:</span>
                <span className="font-mono font-semibold">{activeRoom.code}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 ml-1"
                  onClick={copyRoomCode}
                >
                  {copySuccess ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {isRoomClosed && winningOption && (
            <Card className="mb-8 border-secondary bg-secondary/5">
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>Final Decision</span>
                  {activeRoom.result?.tiebreaker && (
                    <span className="text-sm bg-secondary/20 text-secondary px-2 py-1 rounded-md">
                      Resolved by {activeRoom.result.tiebreaker}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">{winningOption.text}</h3>
                    <p className="text-muted-foreground">
                      Received {winningOption.votes.length} vote{winningOption.votes.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {tiebreaker && isResolving && (
            <Card className="mb-8 animate-fall-in">
              <CardContent className="pt-6">
                {tiebreaker === 'dice' && (
                  <DiceRoller 
                    options={tiedOptions} 
                    onResult={handleTiebreakerResult} 
                    autoRoll={true} 
                  />
                )}
                {tiebreaker === 'spinner' && (
                  <Spinner 
                    options={tiedOptions} 
                    onResult={handleTiebreakerResult}
                    autoSpin={true}
                  />
                )}
                {tiebreaker === 'coin' && (
                  <CoinFlipper 
                    options={tiedOptions} 
                    onResult={handleTiebreakerResult}
                    autoFlip={true}
                  />
                )}
              </CardContent>
            </Card>
          )}
          
          {!isRoomClosed && !tiebreaker && (
            <>
              {!isVotingOpen && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Add Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add your option here..."
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <Button 
                        onClick={handleAddOption} 
                        disabled={isSubmitting || !newOption.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                  {isCreator && (
                    <CardFooter className="flex justify-end border-t pt-4">
                      <Button
                        onClick={handleStartVoting}
                        disabled={activeRoom.options.length < 2}
                      >
                        Start Voting
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              )}
              
              {isVotingOpen && hasVoted && !isCreator && (
                <div className="bg-secondary/10 text-center py-4 px-6 rounded-lg mb-6">
                  <p className="font-medium">Your vote has been recorded!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Wait for the room creator to end voting to see results
                  </p>
                </div>
              )}
              
              {isCreator && isVotingOpen && (
                <div className="flex justify-end mb-4">
                  <Button onClick={handleEndVoting} variant="secondary">
                    End Voting & Show Results
                  </Button>
                </div>
              )}
              
              {hasTie && isCreator && (
                <Card className="mb-8 border-secondary bg-secondary/5">
                  <CardHeader>
                    <CardTitle>We Have a Tie!</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      There's a tie between multiple options. Select a tiebreaker method:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        className="bg-dice hover:bg-dice/90 h-auto py-3"
                        onClick={() => handleResolveTie('dice')}
                      >
                        <div>
                          <div className="text-lg font-bold">Roll the Dice</div>
                          <div className="text-xs opacity-80">
                            Random dice roll decides
                          </div>
                        </div>
                      </Button>
                      <Button
                        className="bg-spinner hover:bg-spinner/90 h-auto py-3"
                        onClick={() => handleResolveTie('spinner')}
                      >
                        <div>
                          <div className="text-lg font-bold">Spin the Wheel</div>
                          <div className="text-xs opacity-80">
                            Spinning wheel decides
                          </div>
                        </div>
                      </Button>
                      <Button
                        className="bg-coin hover:bg-coin/90 h-auto py-3"
                        onClick={() => handleResolveTie('coin')}
                        disabled={tiedOptions.length > 2}
                      >
                        <div>
                          <div className="text-lg font-bold">Flip a Coin</div>
                          <div className="text-xs opacity-80">
                            {tiedOptions.length > 2 
                              ? "Only for 2 options" 
                              : "Heads or tails decides"}
                          </div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <h2 className="text-xl font-semibold mb-4">
            Options {isVotingOpen && !isRoomClosed ? "(Vote by clicking an option)" : ""}
          </h2>
          
          {activeRoom.options.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No options added yet. Be the first to add one!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {activeRoom.options.map((option) => (
                <OptionItem
                  key={option.id}
                  option={option}
                  isVotingOpen={isVotingOpen && !isRoomClosed}
                  isSelected={selectedOption === option.id}
                  showResults={!isVotingOpen || isRoomClosed || (hasVoted && isCreator)}
                  totalVotes={totalVotes}
                  onSelect={() => handleVote(option.id)}
                  isWinner={activeRoom.result?.winningOptionId === option.id}
                />
              ))}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-between mt-8 pt-4 border-t">
            <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
              {activeRoom.participants.length} participant{activeRoom.participants.length !== 1 ? 's' : ''}
              {isRoomClosed ? " participated" : " in room"}
            </div>
            
            <div className="flex gap-3">
              {!isCreator && !isRoomClosed && (
                <Button variant="outline" onClick={handleLeaveRoom}>
                  Leave Room
                </Button>
              )}
              {isCreator && !isRoomClosed && (
                <Button variant="destructive" onClick={handleDeleteRoom}>
                  Delete Room
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Room;
