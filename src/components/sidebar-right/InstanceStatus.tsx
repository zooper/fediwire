import { useStore } from '../../store/useStore';

export default function InstanceStatus() {
  const { instance, instanceUrl } = useStore();

  return (
    <div className="border-t border-gray-200 pt-6">
      <h2 className="text-lg font-bold text-gray-900 mb-3">Instance Status</h2>
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        {instance ? (
          <>
            <div>
              <p className="text-sm text-gray-500">Instance</p>
              <p className="font-semibold text-gray-900">{instance.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-500">Users</p>
                <p className="font-semibold text-gray-900">
                  {instance.stats.user_count.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Posts</p>
                <p className="font-semibold text-gray-900">
                  {instance.stats.status_count.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">API Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Latency</span>
              <span className="text-sm text-gray-900 font-medium">~50ms</span>
            </div>
          </>
        ) : instanceUrl ? (
          <div>
            <p className="text-sm text-gray-500">Instance</p>
            <p className="font-semibold text-gray-900">
              {new URL(instanceUrl).hostname}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-500">Not connected</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No instance configured</p>
          </div>
        )}
      </div>
    </div>
  );
}
