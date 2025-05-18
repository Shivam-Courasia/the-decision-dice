
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CoinFlipperProps {
  options: string[];
  onResult: (winner: string) => void;
  autoFlip?: boolean;
}

const CoinFlipper = ({ options, onResult, autoFlip = false }: CoinFlipperProps) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinSide, setCoinSide] = useState<'heads' | 'tails'>('heads');
  const [winner, setWinner] = useState<string | null>(null);

  // Ensure we have exactly 2 options for the coin flip
  const coinOptions = options.slice(0, 2);
  if (coinOptions.length < 2) {
    coinOptions.push('No option');
  }

  useEffect(() => {
    if (autoFlip) {
      handleFlip();
    }
  }, [autoFlip]);

  const handleFlip = () => {
    setIsFlipping(true);
    setWinner(null);
    
    // Simulate coin flipping animation
    let flipCount = 0;
    const maxFlips = 8;
    const flipInterval = setInterval(() => {
      setCoinSide(prev => prev === 'heads' ? 'tails' : 'heads');
      flipCount++;
      
      if (flipCount >= maxFlips) {
        clearInterval(flipInterval);
        finishFlip();
      }
    }, 150);
  };

  const finishFlip = () => {
    // Simulate a final flip
    const finalSide = Math.random() > 0.5 ? 'heads' : 'tails';
    setCoinSide(finalSide);
    
    // Map heads to first option, tails to second option
    const winningOption = finalSide === 'heads' ? coinOptions[0] : coinOptions[1];
    
    setWinner(winningOption);
    setTimeout(() => {
      setIsFlipping(false);
      onResult(winningOption);
    }, 1000);
  };

  return (
    <div className="coin-container text-center py-6">
      <h3 className="text-xl font-semibold mb-4">Coin Toss Tiebreaker</h3>
      
      <div className="flex flex-col items-center mb-6 min-h-[150px]">
        <div 
          className={cn(
            "w-20 h-20 rounded-full border-4 flex items-center justify-center",
            isFlipping && "animate-flip",
            coinSide === 'heads' 
              ? "bg-coin text-white border-coin-border" 
              : "bg-coin-secondary text-coin border-coin"
          )}
        >
          <span className="text-xl font-bold">
            {coinSide === 'heads' ? 'H' : 'T'}
          </span>
        </div>
        
        {!isFlipping && (
          <div className="mt-4 flex justify-around w-full max-w-xs">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Heads</p>
              <p className="font-medium">{coinOptions[0]}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Tails</p>
              <p className="font-medium">{coinOptions[1]}</p>
            </div>
          </div>
        )}
        
        {winner && !isFlipping && (
          <div className="mt-6 animate-scale-up">
            <p className="text-lg mb-2">The winner is:</p>
            <p className="font-bold text-xl text-coin">{winner}</p>
          </div>
        )}
      </div>
      
      {!autoFlip && !isFlipping && !winner && (
        <Button 
          onClick={handleFlip}
          className="bg-coin hover:bg-coin/90"
        >
          Flip the Coin
        </Button>
      )}
    </div>
  );
};

export default CoinFlipper;
