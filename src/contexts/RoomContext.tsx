
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from "sonner";
import { useAuth } from './AuthContext';

// Types for our decision rooms
export interface Option {
  id: string;
  text: string;
  submittedBy: string;
  votes: string[]; // User IDs who voted for this option
}

export interface Room {
  id: string;
  code: string;
  title: string;
  description: string;
  creatorId: string;
  createdAt: Date;
  isOpen: boolean;
  votingOpen: boolean;
  participants: string[]; // User IDs
  options: Option[];
  result?: {
    winningOptionId: string;
    tiebreaker?: 'dice' | 'spinner' | 'coin';
    resolvedAt: Date;
  };
}

// RoomContext type
interface RoomContextType {
  rooms: Room[];
  userRooms: Room[];
  activeRoom: Room | null;
  loading: boolean;
  createRoom: (title: string, description: string) => Promise<Room>;
  joinRoom: (roomCode: string) => Promise<Room | null>;
  leaveRoom: (roomId: string) => void;
  addOption: (roomId: string, optionText: string) => void;
  startVoting: (roomId: string) => void;
  vote: (roomId: string, optionId: string) => void;
  endVoting: (roomId: string) => void;
  resolveTie: (roomId: string, method: 'dice' | 'spinner' | 'coin') => Promise<string>;
  getRoom: (roomId: string) => Room | undefined;
  deleteRoom: (roomId: string) => void;
  hasUserVoted: (roomId: string) => boolean;
}

// Create the room context
const RoomContext = createContext<RoomContextType | undefined>(undefined);

// For MVP, we'll mock the backend using localStorage
export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load rooms from localStorage
  useEffect(() => {
    const storedRooms = localStorage.getItem('diceyRooms');
    if (storedRooms) {
      setRooms(JSON.parse(storedRooms));
    }
    setLoading(false);
  }, []);

  // Save rooms to localStorage whenever they change
  useEffect(() => {
    if (rooms.length > 0) {
      localStorage.setItem('diceyRooms', JSON.stringify(rooms));
    }
  }, [rooms]);

  // Get rooms the user is participating in
  const userRooms = rooms.filter(
    room => user && (room.participants.includes(user.id) || room.creatorId === user.id)
  );

  // Function to generate a unique room code (6 characters)
  const generateRoomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  // Create a new room
  const createRoom = async (title: string, description: string) => {
    if (!user) {
      toast.error("You must be logged in to create a room");
      throw new Error("Authentication required");
    }
    
    // Create new room
    const newRoom: Room = {
      id: `room_${Math.random().toString(36).substr(2, 9)}`,
      code: generateRoomCode(),
      title,
      description,
      creatorId: user.id,
      createdAt: new Date(),
      isOpen: true,
      votingOpen: false,
      participants: [user.id],
      options: []
    };
    
    // Add room to state
    setRooms(prevRooms => [...prevRooms, newRoom]);
    setActiveRoom(newRoom);
    toast.success("Room created successfully!");
    return newRoom;
  };

  // Join a room with a code
  const joinRoom = async (roomCode: string) => {
    if (!user) {
      toast.error("You must be logged in to join a room");
      throw new Error("Authentication required");
    }
    
    // Find room by code
    const room = rooms.find(r => r.code === roomCode);
    
    if (!room) {
      toast.error("Room not found. Check the code and try again.");
      return null;
    }
    
    if (!room.isOpen) {
      toast.error("This room is closed and no longer accepting participants.");
      return null;
    }
    
    // Check if user is already a participant
    if (room.participants.includes(user.id)) {
      setActiveRoom(room);
      toast.info("Rejoined the room!");
      return room;
    }
    
    // Add user to participants
    const updatedRoom = {
      ...room,
      participants: [...room.participants, user.id]
    };
    
    // Update rooms state
    setRooms(prevRooms => 
      prevRooms.map(r => (r.id === room.id ? updatedRoom : r))
    );
    
    setActiveRoom(updatedRoom);
    toast.success("Successfully joined the room!");
    return updatedRoom;
  };

  // Leave a room
  const leaveRoom = (roomId: string) => {
    if (!user) {
      toast.error("You must be logged in to leave a room");
      return;
    }
    
    // Find the room
    const room = rooms.find(r => r.id === roomId);
    
    if (!room) {
      toast.error("Room not found");
      return;
    }
    
    // If user is the creator, warn them
    if (room.creatorId === user.id) {
      toast.error("As the creator, you cannot leave the room. You can delete it instead.");
      return;
    }
    
    // Remove user from participants
    const updatedRoom = {
      ...room,
      participants: room.participants.filter(p => p !== user.id)
    };
    
    // Update rooms state
    setRooms(prevRooms => 
      prevRooms.map(r => (r.id === roomId ? updatedRoom : r))
    );
    
    // If active room is the one being left, set activeRoom to null
    if (activeRoom?.id === roomId) {
      setActiveRoom(null);
    }
    
    toast.info("Left the room successfully");
  };

  // Add an option to a room
  const addOption = (roomId: string, optionText: string) => {
    if (!user) {
      toast.error("You must be logged in to add options");
      return;
    }
    
    // Find the room
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) {
      toast.error("Room not found");
      return;
    }
    
    const room = rooms[roomIndex];
    
    // Check if voting has started
    if (room.votingOpen) {
      toast.error("Voting has started. Can't add new options.");
      return;
    }
    
    // Create new option
    const newOption: Option = {
      id: `option_${Math.random().toString(36).substr(2, 9)}`,
      text: optionText,
      submittedBy: user.id,
      votes: []
    };
    
    // Add option to room
    const updatedRoom = {
      ...room,
      options: [...room.options, newOption]
    };
    
    // Update rooms state
    const newRooms = [...rooms];
    newRooms[roomIndex] = updatedRoom;
    setRooms(newRooms);
    
    // Update active room if needed
    if (activeRoom?.id === roomId) {
      setActiveRoom(updatedRoom);
    }
    
    toast.success("Option added successfully!");
  };

  // Start voting in a room
  const startVoting = (roomId: string) => {
    if (!user) {
      toast.error("You must be logged in to start voting");
      return;
    }
    
    // Find the room
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) {
      toast.error("Room not found");
      return;
    }
    
    const room = rooms[roomIndex];
    
    // Check if user is the creator
    if (room.creatorId !== user.id) {
      toast.error("Only the room creator can start voting");
      return;
    }
    
    // Check if there are at least two options
    if (room.options.length < 2) {
      toast.error("Need at least two options to start voting");
      return;
    }
    
    // Start voting
    const updatedRoom = {
      ...room,
      votingOpen: true
    };
    
    // Update rooms state
    const newRooms = [...rooms];
    newRooms[roomIndex] = updatedRoom;
    setRooms(newRooms);
    
    // Update active room if needed
    if (activeRoom?.id === roomId) {
      setActiveRoom(updatedRoom);
    }
    
    toast.success("Voting has started!");
  };

  // Vote for an option
  const vote = (roomId: string, optionId: string) => {
    if (!user) {
      toast.error("You must be logged in to vote");
      return;
    }
    
    // Find the room
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) {
      toast.error("Room not found");
      return;
    }
    
    const room = rooms[roomIndex];
    
    // Check if voting is open
    if (!room.votingOpen) {
      toast.error("Voting has not started yet");
      return;
    }
    
    // Check if user has already voted
    const hasVoted = room.options.some(option => 
      option.votes.includes(user.id)
    );
    
    if (hasVoted) {
      // Remove previous vote
      const updatedOptions = room.options.map(option => ({
        ...option,
        votes: option.votes.filter(v => v !== user.id)
      }));
      
      // Add new vote
      const updatedRoom = {
        ...room,
        options: updatedOptions.map(option => 
          option.id === optionId 
            ? { ...option, votes: [...option.votes, user.id] } 
            : option
        )
      };
      
      // Update rooms state
      const newRooms = [...rooms];
      newRooms[roomIndex] = updatedRoom;
      setRooms(newRooms);
      
      // Update active room if needed
      if (activeRoom?.id === roomId) {
        setActiveRoom(updatedRoom);
      }
      
      toast.success("Vote updated!");
    } else {
      // Add vote
      const updatedRoom = {
        ...room,
        options: room.options.map(option => 
          option.id === optionId 
            ? { ...option, votes: [...option.votes, user.id] } 
            : option
        )
      };
      
      // Update rooms state
      const newRooms = [...rooms];
      newRooms[roomIndex] = updatedRoom;
      setRooms(newRooms);
      
      // Update active room if needed
      if (activeRoom?.id === roomId) {
        setActiveRoom(updatedRoom);
      }
      
      toast.success("Vote recorded!");
    }
  };

  // End voting in a room
  const endVoting = (roomId: string) => {
    if (!user) {
      toast.error("You must be logged in to end voting");
      return;
    }
    
    // Find the room
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) {
      toast.error("Room not found");
      return;
    }
    
    const room = rooms[roomIndex];
    
    // Check if user is the creator
    if (room.creatorId !== user.id) {
      toast.error("Only the room creator can end voting");
      return;
    }
    
    // Find the winning option(s)
    const maxVotes = Math.max(...room.options.map(o => o.votes.length));
    const winningOptions = room.options.filter(o => o.votes.length === maxVotes);
    
    // If there's only one winner, set the result
    if (winningOptions.length === 1) {
      const updatedRoom = {
        ...room,
        votingOpen: false,
        isOpen: false,
        result: {
          winningOptionId: winningOptions[0].id,
          resolvedAt: new Date()
        }
      };
      
      // Update rooms state
      const newRooms = [...rooms];
      newRooms[roomIndex] = updatedRoom;
      setRooms(newRooms);
      
      // Update active room if needed
      if (activeRoom?.id === roomId) {
        setActiveRoom(updatedRoom);
      }
      
      toast.success("Voting ended! We have a winner!");
    } else {
      // If there's a tie, just close voting
      const updatedRoom = {
        ...room,
        votingOpen: false
      };
      
      // Update rooms state
      const newRooms = [...rooms];
      newRooms[roomIndex] = updatedRoom;
      setRooms(newRooms);
      
      // Update active room if needed
      if (activeRoom?.id === roomId) {
        setActiveRoom(updatedRoom);
      }
      
      toast.info("Voting ended! It's a tie!");
    }
  };

  // Resolve a tie using a random method
  const resolveTie = async (roomId: string, method: 'dice' | 'spinner' | 'coin') => {
    if (!user) {
      toast.error("You must be logged in to resolve a tie");
      throw new Error("Authentication required");
    }
    
    // Find the room
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) {
      toast.error("Room not found");
      throw new Error("Room not found");
    }
    
    const room = rooms[roomIndex];
    
    // Check if user is the creator
    if (room.creatorId !== user.id) {
      toast.error("Only the room creator can resolve ties");
      throw new Error("Not authorized");
    }
    
    // Check if voting has ended
    if (room.votingOpen) {
      toast.error("End voting before resolving ties");
      throw new Error("Voting still open");
    }
    
    // Find options with the most votes
    const maxVotes = Math.max(...room.options.map(o => o.votes.length));
    const tiedOptions = room.options.filter(o => o.votes.length === maxVotes);
    
    // If there's no tie, return the winner
    if (tiedOptions.length === 1) {
      return tiedOptions[0].id;
    }
    
    // Simulate random selection with animation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Pick a random winner from the tied options
    const winnerIndex = Math.floor(Math.random() * tiedOptions.length);
    const winningOptionId = tiedOptions[winnerIndex].id;
    
    // Update the room with the result
    const updatedRoom = {
      ...room,
      isOpen: false,
      result: {
        winningOptionId,
        tiebreaker: method,
        resolvedAt: new Date()
      }
    };
    
    // Update rooms state
    const newRooms = [...rooms];
    newRooms[roomIndex] = updatedRoom;
    setRooms(newRooms);
    
    // Update active room if needed
    if (activeRoom?.id === roomId) {
      setActiveRoom(updatedRoom);
    }
    
    toast.success("Tie resolved! We have a winner!");
    return winningOptionId;
  };

  // Get a room by ID
  const getRoom = (roomId: string) => {
    return rooms.find(r => r.id === roomId);
  };

  // Delete a room
  const deleteRoom = (roomId: string) => {
    if (!user) {
      toast.error("You must be logged in to delete a room");
      return;
    }
    
    // Find the room
    const room = rooms.find(r => r.id === roomId);
    
    if (!room) {
      toast.error("Room not found");
      return;
    }
    
    // Check if user is the creator
    if (room.creatorId !== user.id) {
      toast.error("Only the room creator can delete the room");
      return;
    }
    
    // Remove the room
    setRooms(prevRooms => prevRooms.filter(r => r.id !== roomId));
    
    // If active room is being deleted, set activeRoom to null
    if (activeRoom?.id === roomId) {
      setActiveRoom(null);
    }
    
    toast.success("Room deleted successfully");
  };

  // Check if user has voted in a room
  const hasUserVoted = (roomId: string) => {
    if (!user) return false;
    
    const room = rooms.find(r => r.id === roomId);
    if (!room) return false;
    
    return room.options.some(option => option.votes.includes(user.id));
  };

  return (
    <RoomContext.Provider value={{ 
      rooms, 
      userRooms, 
      activeRoom, 
      loading,
      createRoom,
      joinRoom,
      leaveRoom,
      addOption,
      startVoting,
      vote,
      endVoting,
      resolveTie,
      getRoom,
      deleteRoom,
      hasUserVoted
    }}>
      {children}
    </RoomContext.Provider>
  );
};

// Create a hook for using the room context
export const useRoom = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
