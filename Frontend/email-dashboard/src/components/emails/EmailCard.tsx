import React from "react";
import { User, Mail, Calendar } from "lucide-react";
import { Email } from "../../types/email";
import { formatDate, getCategoryColor } from "../../utils/emailUtils";

interface EmailCardProps {
  email: Email;
  onCategorise: (id: string) => void;
  onSuggest: (id: string) => void;
}

const EmailCard: React.FC<EmailCardProps> = ({ email, onCategorise,onSuggest }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-4 group-hover:text-blue-600 transition-colors">
          {email.subject}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getCategoryColor(
            email.category
          )}`}
        >
          {email.category}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="p-2 bg-blue-50 rounded-lg">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-500 text-xs">From</p>
            <p className="truncate text-gray-900">{email.from}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <div className="p-2 bg-green-50 rounded-lg">
            <Mail className="w-4 h-4 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-500 text-xs">To</p>
            <p className="truncate text-gray-900">{email.to}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-500 text-xs">Date</p>
            <p className="text-gray-900">{formatDate(email.date)}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCategorise(email.id);
            }}
            className="ml-6 mt-4 px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Categorise Email
          </button>

           <button
            onClick={(e) => {
              e.stopPropagation();
              onSuggest(email.id);
            }}
            className="ml-6 mt-4 px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Suggest Replies
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailCard;
