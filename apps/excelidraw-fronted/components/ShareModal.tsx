import { toast } from "react-toastify";

export function ShareModal({
  roomId,
  onClose,
}: {
  roomId: string;
  onClose: () => void;
}) {
  const link = `${window.location.origin}/canvas/${roomId}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg text-center">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">
          Live collaboration
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Invite people to collaborate on your drawing.
          <br />
          The session is private and end-to-end encrypted.
        </p>

        <div className="mb-6">
          <button
            onClick={() => {
              toast.success("link copied");
              navigator.clipboard.writeText(link);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg "
          >
            Copy link
          </button>
          <p className="text-sm text-gray-500 mt-2 break-all">{link}</p>
        </div>

        <button
          onClick={onClose}
          className="mt-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
