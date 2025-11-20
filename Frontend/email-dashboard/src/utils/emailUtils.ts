export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Interested': 'bg-green-100 text-green-700 border border-green-200',
    'Meeting Booked': 'bg-blue-100 text-blue-700 border border-blue-200',
    'Not Interested': 'bg-red-100 text-red-700 border border-red-200',
    'Spam': 'bg-gray-100 text-gray-700 border border-gray-200',
    'Out of Office': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    'Transactions': 'bg-purple-100 text-purple-700 border border-purple-200',
    'Promotions': 'bg-pink-100 text-pink-700 border border-pink-200',
    'New': 'bg-orange-100 text-orange-700 border border-orange-200',
    'Uncategorized': 'bg-slate-100 text-slate-700 border border-slate-200'
  };
  return colors[category] || 'bg-gray-100 text-gray-700 border border-gray-200';
};
