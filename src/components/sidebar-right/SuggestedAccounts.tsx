import { useState } from 'react';
import type { Account } from '../../types';

// Mock data for demonstration
const mockSuggestions: Account[] = [];

export default function SuggestedAccounts() {
  const [suggestions] = useState<Account[]>(mockSuggestions);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3">Suggested Accounts</h2>
      <div className="space-y-3">
        {suggestions.slice(0, 3).map((account) => (
          <div key={account.id} className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <img
              src={account.avatar}
              alt={account.display_name}
              className="w-12 h-12 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {account.display_name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                @{account.acct}
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {account.note.replace(/<[^>]*>/g, '')}
              </p>
              <button className="mt-2 px-4 py-1.5 bg-mastodon-blue text-white text-sm font-medium rounded-lg hover:bg-mastodon-darkBlue transition-colors">
                Follow
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
