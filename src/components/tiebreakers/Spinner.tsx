
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  options: string[];
  onResult: (winner: string) => void;
  autoSpin?: boolean;
}

const Spinner = ({ options, onResult, autoSpin = false }: SpinnerProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const spinnerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<string[]>([...options]);

  useEffect(() => {
    if (autoSpin) {
      handleSpin();
    }
  }, [autoSpin]);

  const handleSpin = () => {
    setIsSpinning(true);
    setWinner(null);
    
    // Determine a random rotation (between 4 to 10 full rotations + partial for selection)
    const baseRotation = Math.floor(Math.random() * 6 + 4) * 360;
    const extraRotation = Math.floor(Math.random() * 360);
    const finalRotation = rotation + baseRotation + extraRotation;
    
    setRotation(finalRotation);
    
    // Determine winner based on where spinner stops
    setTimeout(() => {
      finishSpin(finalRotation);
    }, 3000); // Match this with the CSS animation duration
  };

  const finishSpin = (finalRotation: number) => {
    // Calculate which option the spinner landed on
    const normalizedRotation = finalRotation % 360;
    const degreesPerOption = 360 / optionsRef.current.length;
    const optionIndex = Math.floor(normalizedRotation / degreesPerOption);
    const winningOption = optionsRef.current[optionIndex];
    
    setWinner(winningOption);
    setTimeout(() => {
      setIsSpinning(false);
      onResult(winningOption);
    }, 500);
  };

  // Generate spinner segments
  const renderSpinnerSegments = () => {
    return optionsRef.current.map((option, index) => {
      const segmentRotation = (index * (360 / optionsRef.current.length));
      const segmentStyle = {
        transform: `rotate(${segmentRotation}deg)`,
        transformOrigin: 'center',
      };
      const textRotation = segmentRotation + (180 / optionsRef.current.length);
      const textStyle = {
        transform: `rotate(${textRotation}deg)`,
        transformOrigin: 'center',
      };
      
      return (
        <div key={index} className="absolute inset-0" style={segmentStyle}>
          <div
            className={`absolute w-full h-1/2 origin-bottom-center overflow-hidden`}
            style={{
              backgroundColor: index % 2 === 0 ? '#F97316' : '#FEC6A1',
              clipPath: `polygon(50% 0, 100% 0, 50% 100%)`
            }}
          >
            <div
              className="absolute left-1/2 top-1/4 -translate-x-1/2 text-xs font-medium text-white"
              style={textStyle}
            >
              {option}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="spinner-container text-center py-6">
      <h3 className="text-xl font-semibold mb-4">Spinner Tiebreaker</h3>
      
      <div className="flex flex-col items-center mb-6 min-h-[220px]">
        <div className="relative w-64 h-64">
          {/* Spinner wheel */}
          <div 
            ref={spinnerRef}
            className="absolute inset-0 rounded-full border-4 border-spinner-border bg-spinner overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 3s cubic-bezier(.17,.67,.83,.67)' : 'none'
            }}
          >
            {renderSpinnerSegments()}
          </div>
          
          {/* Center of spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white shadow-md z-10"></div>
          </div>
          
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -ml-4 w-8 h-8 flex justify-center z-20">
            <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-[16px] border-b-red-500"></div>
          </div>
        </div>
        
        {winner && !isSpinning && (
          <div className="mt-6 animate-scale-up">
            <p className="text-lg mb-2">The winner is:</p>
            <p className="font-bold text-xl text-spinner">{winner}</p>
          </div>
        )}
      </div>
      
      {!autoSpin && !isSpinning && !winner && (
        <Button 
          onClick={handleSpin}
          className="bg-spinner hover:bg-spinner/90"
        >
          Spin the Wheel
        </Button>
      )}
    </div>
  );
};

export default Spinner;
