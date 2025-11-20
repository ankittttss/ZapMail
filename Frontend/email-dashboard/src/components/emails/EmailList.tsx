import React from 'react';
import { Email } from '../../types/email';
import EmailCard from './EmailCard';
import EmptyState from '../emails/EmptyState';

interface EmailListProps {
  emails: Email[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  onCategorise: (id: string) => void;   // NEW
}

const EmailList: React.FC<EmailListProps> = ({
  emails,
  onClearFilters,
  hasActiveFilters,
  onCategorise,
}) => {
  if (emails.length === 0) {
    return (
      <EmptyState
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div className="space-y-4 mb-8">
      {emails.map((email) => (
        <EmailCard
          key={email.id}
          email={email}
          onCategorise={onCategorise}   
        />
      ))}
    </div>
  );
};

export default EmailList;
