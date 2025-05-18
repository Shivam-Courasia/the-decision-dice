
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DiceRollerProps {
  options: string[];
  onResult: (winner: string) => void;
  autoRoll?: boolean;
}

const diceValues = [1, 2, 3, 4, 5, 6];

const DiceRoller = ({ options, onResult, autoRoll = false }: DiceRollerProps) => {
  const [isRolling, setIsRolling] = useState(false);
  const [diceValue, setDiceValue] = useState(1);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    if (autoRoll) {
      handleRoll();
    }
  }, [autoRoll]);

  const handleRoll = () => {
    setIsRolling(true);
    setWinner(null);
    
    // Simulate dice rolling animation
    let rollCount = 0;
    const maxRolls = 10;
    const rollInterval = setInterval(() => {
      setDiceValue(diceValues[Math.floor(Math.random() * diceValues.length)]);
      rollCount++;
      
      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);
        finishRoll();
      }
    }, 200);
  };

  const finishRoll = () => {
    // Simulate a final roll
    const finalValue = Math.floor(Math.random() * 6) + 1;
    setDiceValue(finalValue);
    
    // Determine winner based on the dice roll
    // Use modulo to map dice value to options
    const winnerIndex = (finalValue - 1) % options.length;
    const winningOption = options[winnerIndex];
    
    setWinner(winningOption);
    setTimeout(() => {
      setIsRolling(false);
      onResult(winningOption);
    }, 1000);
  };

  return (
    <div className="dice-container text-center py-6">
      <h3 className="text-xl font-semibold mb-4">Dice Tiebreaker</h3>
      
      <div className="flex flex-col items-center mb-6 min-h-[150px]">
        <div 
          className={cn(
            "w-20 h-20 bg-dice text-white flex items-center justify-center rounded-lg border-4 border-dice-border text-4xl font-bold",
            isRolling && "animate-bounce-dice"
          )}
        >
          {diceValue}
        </div>
        
        {winner && !isRolling && (
          <div className="mt-6 animate-scale-up">
            <p className="text-lg mb-2">The winner is:</p>
            <p className="font-bold text-xl text-dice">{winner}</p>
          </div>
        )}
      </div>
      
      {!autoRoll && !isRolling && !winner && (
        <Button 
          onClick={handleRoll}
          className="bg-dice hover:bg-dice/90"
        >
          Roll the Dice
        </Button>
      )}
    </div>
  );
};

export default DiceRoller;
