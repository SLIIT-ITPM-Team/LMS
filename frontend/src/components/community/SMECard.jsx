import React from 'react';
import './SMECard.css';

const SMECard = ({ sme, channelName }) => {
  if (!sme) {
    return (
      <div className="sme-card">
        <div className="sme-unavailable">
          <p>No Subject Matter Expert assigned</p>
        </div>
      </div>
    );
  }

  const handleEmailClick = () => {
    window.location.href = `mailto:${sme.email}`;
  };

  const handlePhoneClick = () => {
    if (sme.phone) {
      window.location.href = `tel:${sme.phone}`;
    }
  };

  return (
    <div className="sme-card">
      <div className="sme-header">
        <h3>Subject Matter Expert</h3>
        <span className="sme-badge">👤 SME</span>
      </div>

      <div className="sme-content">
        <img
          src={sme.avatar || 'https://via.placeholder.com/100'}
          alt={sme.firstName}
          className="sme-avatar"
        />

        <div className="sme-info">
          <h4 className="sme-name">
            {sme.firstName} {sme.lastName}
          </h4>
          <p className="sme-title">Expert in {channelName}</p>
        </div>
      </div>

      <div className="sme-contacts">
        <button
          className="contact-btn email-btn"
          onClick={handleEmailClick}
          title={sme.email}
        >
          ✉️ Email
        </button>
        {sme.phone && (
          <button
            className="contact-btn phone-btn"
            onClick={handlePhoneClick}
            title={sme.phone}
          >
            📞 Call
          </button>
        )}
      </div>

      {sme.bio && (
        <div className="sme-bio">
          <p>{sme.bio}</p>
        </div>
      )}
    </div>
  );
};

export default SMECard;
