import { useStore } from '../../store/useStore';

export default function MiniProfile() {
  const { currentAccount } = useStore();

  if (!currentAccount) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">Not logged in</p>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-xs text-gray-500">Offline</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
      <img
        src={currentAccount.avatar}
        alt={currentAccount.display_name}
        className="w-12 h-12 rounded-full"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">
          {currentAccount.display_name}
        </p>
        <p className="text-sm text-gray-500 truncate">
          @{currentAccount.acct}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Connected</span>
        </div>
      </div>
    </div>
  );
}
