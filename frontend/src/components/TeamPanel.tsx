import { Team, TeamMember } from '@/lib/types';

interface TeamPanelProps {
  team: Team;
  currentUserId?: number;
  isLeader: boolean;
  onRemoveMember?: (userId: number) => void;
}

export default function TeamPanel({ team, currentUserId, isLeader, onRemoveMember }: TeamPanelProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
        <h3 className="font-bold text-lg text-gray-900">Team Members ({team.members.length})</h3>
        <span className="text-xs text-gray-500 font-medium">Challenge ID #{team.challenge_id}</span>
      </div>

      <div className="divide-y divide-gray-100">
        {team.members.map((member: TeamMember) => {
          const isCurrent = currentUserId === member.user_id;
          const isMemberLeader = member.role_in_team === 'Leader';

          return (
            <div key={member.user_id} className="py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                  {member.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-gray-900">{member.full_name}</span>
                    {isCurrent && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">You</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                  isMemberLeader
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}>
                  {member.role_in_team}
                </span>

                {isLeader && !isMemberLeader && !isCurrent && onRemoveMember && (
                  <button
                    onClick={() => onRemoveMember(member.user_id)}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
