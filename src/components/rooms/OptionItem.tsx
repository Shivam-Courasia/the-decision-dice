
import { useState } from "react";
import { Option } from "@/contexts/RoomContext";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface OptionItemProps {
  option: Option;
  isVotingOpen: boolean;
  isSelected: boolean;
  showResults: boolean;
  totalVotes: number;
  onSelect: () => void;
  isWinner?: boolean;
}

const OptionItem = ({
  option,
  isVotingOpen,
  isSelected,
  showResults,
  totalVotes,
  onSelect,
  isWinner = false,
}: OptionItemProps) => {
  const voteCount = option.votes.length;
  const votePercentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
  
  return (
    <div
      onClick={isVotingOpen ? onSelect : undefined}
      className={cn(
        "option-card relative",
        isSelected && "option-card-selected",
        isVotingOpen && "cursor-pointer",
        isWinner && "ring-2 ring-secondary border-secondary",
        !isVotingOpen && !showResults && "cursor-default"
      )}
    >
      {isWinner && (
        <div className="absolute -top-3 -right-3 bg-secondary text-white rounded-full px-2 py-1 text-xs font-bold">
          Winner!
        </div>
      )}
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{option.text}</h3>
        {isSelected && isVotingOpen && (
          <Check className="h-5 w-5 text-primary" />
        )}
      </div>

      {showResults && (
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span>{voteCount} vote{voteCount !== 1 ? 's' : ''}</span>
            <span>{votePercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                isWinner ? "bg-secondary" : "bg-primary",
              )}
              style={{ width: `${votePercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionItem;
