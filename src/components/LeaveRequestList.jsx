import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const LeaveRequestList = ({ requests, isAdmin = false, onApprove, onReject }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
    }
  };

  return (
    <div>
      {requests.map((request) => (
        <div key={request.id} className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">{request.employeeName}</div>
              <div className="text-sm text-gray-500">{format(new Date(request.startDate), 'PPP')} - {format(new Date(request.endDate), 'PPP')}</div>
            </div>
            <div>{getStatusBadge(request.status)}</div>
          </div>
          {isAdmin && (
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => onApprove(request.id)}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(request.id)}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LeaveRequestList;